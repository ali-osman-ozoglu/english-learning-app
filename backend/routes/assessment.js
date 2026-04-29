const express = require('express');
const router = express.Router();
const { aiRotator } = require('../utils/aiClient');
const User = require('../models/User');

// @route   POST /api/assessment/evaluate
// @desc    Kullanıcının anket cevaplarına göre Gemini ile seviyesini belirler
// @access  Public
router.post('/evaluate', async (req, res) => {
  try {
    const { uuid, answers } = req.body;
    
    if (!uuid || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'UUID and valid answers array are required' });
    }

    const prompt = `
    Sen uzman bir İngilizce öğretmenisin. Bir kullanıcının İngilizce seviyesini belirlemek için verdiği cevapları analiz et.
    Kullanıcının cevapları:
    ${JSON.stringify(answers, null, 2)}
    
    Lütfen kullanıcının Kelime Bilgisi (vocabulary), Okuma (reading), Yazma (writing) ve Dinleme (listening) seviyelerini (A1, A2, B1, B2, C1, C2) belirle.
    Dinleme yeteneğini diğer yeteneklerden yola çıkarak mantıklı bir şekilde tahmin et.
    Sadece aşağıdaki formatta geçerli bir JSON döndür (markdown veya başka hiçbir metin ekleme, doğrudan JSON):
    {
      "vocabulary": "A2",
      "reading": "B1",
      "writing": "A1",
      "listening": "A2",
      "explanation": "Kısa bir Türkçe değerlendirme özeti..."
    }
    `;

    const responseText = await aiRotator.generateContent(prompt);
    const evaluation = JSON.parse(responseText);

    // Update User
    const user = await User.findOne({ uuid });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.level = {
      vocabulary: evaluation.vocabulary || 'A1',
      reading: evaluation.reading || 'A1',
      writing: evaluation.writing || 'A1',
      listening: evaluation.listening || 'A1'
    };
    
    await user.save();

    res.json({ success: true, evaluation, user });
  } catch (error) {
    console.error('Assessment Error (Fallback triggers):', error.message);
    
    // FALLBACK: Eğer AI hata verirse (Kota vb.), kullanıcıyı A1 seviyesinden başlat
    try {
        const { uuid } = req.body;
        const user = await User.findOne({ uuid });
        if (user) {
            user.level = { vocabulary: 'A1', reading: 'A1', writing: 'A1', listening: 'A1' };
            await user.save();
            return res.json({ 
                success: true, 
                isFallback: true,
                evaluation: { explanation: "AI yoğunluğu nedeniyle başlangıç seviyesinden başlatıldınız. İlerledikçe seviyeniz güncellenecektir." },
                user 
            });
        }
    } catch (fallbackError) {
        console.error('Fallback Error:', fallbackError);
    }

    res.status(500).json({ success: false, message: 'Assessment failed and fallback failed.' });
  }
});

module.exports = router;
