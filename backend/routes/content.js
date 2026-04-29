const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { aiRotator } = require('../utils/aiClient');

// @route   GET /api/content/vocabulary
// @desc    Kullanıcının seviyesine uygun ve önceliği yüksek kelimeleri getirir
// @access  Public
router.get('/vocabulary', async (req, res) => {
  try {
    const { uuid } = req.query;
    
    if (!uuid) {
      return res.status(400).json({ success: false, message: 'UUID is required' });
    }

    const user = await User.findOne({ uuid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let userVocabLevel = user.level.vocabulary || 'A1';
    if (userVocabLevel === 'UNTESTED') userVocabLevel = 'A1';

    // A1-A2 ise 2 şık, B1-B2 ise 3 şık, C1-C2 ise 4 şık
    const optionsCountMap = { 'A1': 2, 'A2': 2, 'B1': 3, 'B2': 3, 'C1': 4, 'C2': 4 };
    const optionsCount = optionsCountMap[userVocabLevel] || 2;

    // Spaced Repetition Mantığı: Önce vakti gelmiş kelimeleri bulalım
    const dueProgress = await UserProgress.find({
      userUuid: uuid,
      moduleType: 'vocabulary',
      nextReviewDate: { $lte: new Date() }
    }).select('contentId');

    const dueContentIds = dueProgress.map(p => p.contentId);

    // 1. Önce vakti gelmiş olanlardan çek (en fazla 10 tane)
    let words = await Content.aggregate([
      { $match: { _id: { $in: dueContentIds }, type: 'word', level: userVocabLevel } },
      { $sample: { size: 10 } }
    ]);

    // 2. Eğer vakti gelmiş yeterli kelime yoksa, kullanıcının henüz HİÇ görmediği kelimelerden ekle
    if (words.length < 10) {
      const allSeenProgress = await UserProgress.find({ userUuid: uuid, moduleType: 'vocabulary' }).select('contentId');
      const seenContentIds = allSeenProgress.map(p => p.contentId);

      const needed = 10 - words.length;
      const newWords = await Content.aggregate([
        { $match: { _id: { $nin: seenContentIds }, type: 'word', level: userVocabLevel, priority: { $gt: 0 } } },
        { $sort: { priority: -1 } }, 
        { $sample: { size: needed } }
      ]);
      words = [...words, ...newWords];
    }

    // Şıkları hazırlayalım (rastgele yanlış çeviriler)
    const allWordsForOptions = await Content.find({ type: 'word', level: userVocabLevel, priority: { $gt: 0 } }).select('turkishTranslations');
    
    const questions = words.map(word => {
        const correctStr = word.turkishTranslations.join(', ');
        
        // Rastgele yanlış şıkları seç
        const wrongOptions = allWordsForOptions
            .filter(t => t.turkishTranslations && t.turkishTranslations.join(', ') !== correctStr)
            .sort(() => 0.5 - Math.random())
            .slice(0, optionsCount - 1)
            .map(t => t.turkishTranslations.join(', '));
            
        // Doğru şıkla yanlış şıkları birleştirip karıştır
        const options = [...wrongOptions, correctStr].sort(() => 0.5 - Math.random());
        
        return {
            _id: word._id,
            englishText: word.englishText,
            correctAnswer: correctStr,
            options: options,
            wordType: word.wordType
        };
    });

    res.json({ success: true, questions, userLevel: userVocabLevel });
  } catch (error) {
    console.error('Vocabulary Get Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/content/reading
// @desc    Kullanıcının seviyesine uygun okuma metinlerini getirir
// @access  Public
router.get('/reading', async (req, res) => {
  try {
    const { uuid, module: requestedModule } = req.query;
    if (!uuid) return res.status(400).json({ success: false, message: 'UUID required' });

    const user = await User.findOne({ uuid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Modüle göre seviyeyi seç (reading, writing, listening)
    const moduleType = requestedModule || 'reading';
    let userLevel = user.level[moduleType] || 'A1';
    if (userLevel === 'UNTESTED') userLevel = 'A1';

    // A1'de kelime ve cümle, A2-B1'de cümle, B2-C2'de paragraf hedefleniyor.
    let targetTypes = ['word', 'sentence'];
    if (userLevel === 'A2') targetTypes = ['word', 'sentence'];
    if (userLevel === 'B1') targetTypes = ['sentence'];
    if (userLevel === 'B2') targetTypes = ['sentence', 'paragraph'];
    if (userLevel === 'C1' || userLevel === 'C2') targetTypes = ['paragraph'];

    const readingTextsRaw = await Content.aggregate([
      { $match: { type: { $in: targetTypes }, level: userLevel, priority: { $gt: 0 } } },
      { $sort: { priority: -1 } },
      { $sample: { size: 5 } }
    ]);

    const readingTexts = readingTextsRaw.map(t => ({
      ...t,
      turkishTranslation: t.turkishTranslations?.join(', ') || ''
    }));

    res.json({ success: true, readingTexts, userLevel });
  } catch (error) {
    console.error('Reading Get Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Yardımcı fonksiyon: AI cevabından JSON'u temizleyip parse eder
const safeJsonParse = (text) => {
    try {
        // Eğer AI cevabı ```json ... ``` içinde verdiyse temizle
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('JSON Parse Error:', e, 'Raw Text:', text);
        return null;
    }
};

// @route   POST /api/content/evaluate-reading
// @desc    Kullanıcının okuduğu metni Gemini API ile karşılaştırır
// @access  Public
router.post('/evaluate-reading', async (req, res) => {
  try {
    const { originalText, spokenText } = req.body;

    const prompt = `
    Aşağıdaki Asıl Metin ile kullanıcının sesli okuyup cihazı tarafından yazıya dökülen (speech-to-text) metnini karşılaştır.
    Asıl Metin: "${originalText}"
    Kullanıcının Okuduğu: "${spokenText}"

    1. Doğruluk seviyesini (0 ile 100 arası bir tamsayı) belirle.
    2. Kullanıcının yanlış veya eksik okuduğu, telaffuz edemediği kelimelerin bir listesini ver. Eğer kelimenin kökü doğru ancak eki yanlışsa (goes yerine go okuduysa) bunu da yanlış say.

    Sadece aşağıdaki JSON formatında cevap ver:
    {
      "accuracyScore": 85,
      "wrongWords": ["word1", "word2"]
    }
    `;

    try {
        const responseText = await aiRotator.generateContent(prompt);
        const evaluation = safeJsonParse(responseText);
        if (evaluation) {
            return res.json({ success: true, evaluation });
        }
    } catch (aiErr) {
        console.error('AI Eval Error (Reading):', aiErr);
    }

    // AI Hatası durumunda Fallback (Basit bir karşılaştırma)
    console.log('AI failed, using basic fallback for reading eval');
    const origWords = originalText.toLowerCase().replace(/[.,!?]/g, '').split(' ');
    const spokenWords = spokenText.toLowerCase().replace(/[.,!?]/g, '').split(' ');
    
    const wrongWords = origWords.filter(w => !spokenWords.includes(w));
    const accuracyScore = Math.max(0, Math.round(((origWords.length - wrongWords.length) / origWords.length) * 100));

    res.json({ 
        success: true, 
        evaluation: { accuracyScore, wrongWords, isFallback: true } 
    });

  } catch (error) {
    console.error('Reading Eval General Error:', error);
    res.status(500).json({ success: false, message: 'Reading evaluation failed' });
  }
});

// @route   POST /api/content/evaluate-writing
// @desc    Kullanıcının yazdığı metni Gemini API ile analiz eder
// @access  Public
router.post('/evaluate-writing', async (req, res) => {
  try {
    const { originalText, writtenText, mode } = req.body;
    // mode: 'translation' (Turkish to English) or 'dictation' (Listening to English)

    const prompt = `
    Sen uzman bir İngilizce öğretmenisin.
    Öğrencinin görevi: ${mode === 'translation' ? 'Verilen Türkçe cümleyi/metni İngilizceye çevirmek.' : 'Duyduğu İngilizce cümleyi/metni hatasız olarak yazıya dökmek (Dikte).'}
    
    Asıl (Hedef) İngilizce Metin: "${originalText}"
    Öğrencinin Yazdığı Metin: "${writtenText}"

    Öğrencinin yazdığı metni dilbilgisi (grammar), kelime seçimi (vocabulary) ve yazım yanlışları (spelling) açısından değerlendir.
    Eğer çeviri (translation) modundaysa; öğrencinin çevirisi asıl metinle birebir aynı olmasa da anlamca ve gramer olarak doğruysa yüksek puan ver.
    Eğer dikte (dictation) modundaysa; kelimesi kelimesine asıl metne ne kadar yakın olduğuna bak.

    Sadece aşağıdaki JSON formatında cevap ver:
    {
      "score": 85,
      "feedback": "Kısa, motive edici ve nerede hata yaptığını anlatan Türkçe öğretmen notu...",
      "correctedText": "Eğer hata varsa öğrencinin metninin dilbilgisi açısından düzeltilmiş en iyi hali"
    }
    `;

    try {
        const responseText = await aiRotator.generateContent(prompt);
        const evaluation = safeJsonParse(responseText);
        if (evaluation) {
            return res.json({ success: true, evaluation });
        }
    } catch (aiErr) {
        console.error('AI Eval Error (Writing):', aiErr);
    }

    // Writing Fallback
    res.json({ 
        success: true, 
        evaluation: { 
            score: writtenText.toLowerCase().trim() === originalText.toLowerCase().trim() ? 100 : 50,
            feedback: "Şu an detaylı analiz yapılamıyor ancak ilerlemeniz kaydedildi.",
            correctedText: originalText,
            isFallback: true
        } 
    });

  } catch (error) {
    console.error('Writing Eval General Error:', error);
    res.status(500).json({ success: false, message: 'Writing evaluation failed' });
  }
});

// @route   POST /api/content/submit-progress
// @desc    Kullanıcının verdiği cevaba göre ilerlemesini ve seviyesini günceller (Spaced Repetition & Level Up)
// @access  Public
router.post('/submit-progress', async (req, res) => {
  try {
    const { uuid, contentId, moduleType, isCorrect, score } = req.body;
    
    if (!uuid || !contentId || !moduleType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findOne({ uuid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1. Spaced Repetition (SuperMemo-2) Güncellemesi
    let progress = await UserProgress.findOne({ userUuid: uuid, contentId, moduleType });
    if (!progress) {
      progress = new UserProgress({ userUuid: uuid, contentId, moduleType });
    }

    // AI destekli modüller için score kontrolü (eğer gönderilmişse)
    const isSuccess = score !== undefined ? (score >= 70) : isCorrect;

    // SuperMemo-2 Mantığı ve Kullanıcının Özel Tekrar Kuralı
    // Kural: bugün 1 kez, yarın 1 kez, 3 gün sonra 1 kez, 1 hafta sonra 1 kez
    let q = isSuccess ? 4 : 0; // Quality of response
    if (isSuccess) {
      // Özel aralıklar:
      if (progress.repetitions === 0) progress.interval = 0; // Bugün 1 kez
      else if (progress.repetitions === 1) progress.interval = 1; // Yarın 1 kez
      else if (progress.repetitions === 2) progress.interval = 3; // 3 gün sonra
      else if (progress.repetitions === 3) progress.interval = 7; // 1 hafta sonra
      else progress.interval = Math.round(progress.interval * progress.easeFactor); // Sonrası SuperMemo-2
      
      progress.repetitions += 1;
      progress.correctCount += 1;
    } else {
      progress.repetitions = 0;
      progress.interval = 1;
      progress.incorrectCount += 1;
    }

    progress.easeFactor = progress.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (progress.easeFactor < 1.3) progress.easeFactor = 1.3;

    // Sonraki tekrar tarihini ayarla
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + progress.interval);
    progress.nextReviewDate = nextDate;
    if (score !== undefined) progress.lastScore = score;

    await progress.save();

    // 2. Seviye Atlama (Level Up) Mantığı
    let levelUpOccurred = false;
    let newLevel = user.level[moduleType];

    if (isSuccess) {
        const currentLevel = user.level[moduleType] || 'A1';
        
        // Kullanıcının kuralları:
        // A1'den A2'ye: 500 kelime öğrenmeli. A1 tekrar frekansı: ~15 kez. Toplam doğru cevap = 500 * 15 = 7500
        // A2'den B1'e: ~1000 yeni kelime. A2 tekrar frekansı: ~10 kez. Toplam = 1000 * 10 = 10000
        // B1'den B2'ye: ~1500 yeni kelime. B1 tekrar frekansı: ~8 kez. Toplam = 1500 * 8 = 12000
        // B2'den C1'e: ~2000 yeni kelime. B2 tekrar frekansı: ~5 kez. Toplam = 2000 * 5 = 10000
        // C1'den C2'ye: ~3000 yeni kelime. C1 tekrar frekansı: ~3 kez. Toplam = 3000 * 3 = 9000
        const levelIncrementMap = {
            'A1': 100 / 7500,  // %0.0133 artış
            'A2': 100 / 10000, // %0.01 artış
            'B1': 100 / 12000, // %0.0083 artış
            'B2': 100 / 10000, // %0.01 artış
            'C1': 100 / 9000,  // %0.011 artış
            'C2': 0          // Son seviye
        };
        
        const increment = levelIncrementMap[currentLevel] || 0;
        
        if (increment > 0) {
            user.progress[moduleType] = Math.min(100, (user.progress[moduleType] || 0) + increment);
            
            // Eğer %100 olduysa seviye atlat
            if (user.progress[moduleType] >= 100) {
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const currentIndex = levels.indexOf(currentLevel);
                if (currentIndex >= 0 && currentIndex < levels.length - 1) {
                    newLevel = levels[currentIndex + 1];
                    user.level[moduleType] = newLevel;
                    user.progress[moduleType] = 0; // Bir sonraki seviye için sıfırla
                    levelUpOccurred = true;
                }
            }
            await user.save();
        }
    }

    res.json({ 
        success: true, 
        message: 'Progress recorded', 
        nextReviewDate: progress.nextReviewDate,
        currentProgress: user.progress[moduleType],
        levelUpOccurred,
        newLevel
    });

  } catch (error) {
    console.error('Submit Progress Error:', error);
    res.status(500).json({ success: false, message: 'Failed to record progress' });
  }
});

module.exports = router;
