const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// Basit güvenlik: Şimdilik Header üzerinden basit bir kontrol yapıyoruz.
// Gerçek ortamda JWT kullanılabilir, ancak MVP için yeterlidir.
const requireAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    if (secret !== 'super-secret-admin-key') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

// @route   GET /api/admin/content
// @desc    Tüm içerikleri getirir (veya type/level filtresiyle)
router.get('/content', requireAdmin, async (req, res) => {
    try {
        const { type, level } = req.query;
        let query = {};
        if (type) query.type = type;
        if (level) query.level = level;

        const contents = await Content.find(query).sort({ createdAt: -1 });
        res.json({ success: true, contents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/admin/content/bulk
// @desc    JSON formatında toplu içerik ekler
router.post('/content/bulk', requireAdmin, async (req, res) => {
    try {
        const items = req.body; // Gelen JSON array
        
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Geçersiz format, JSON dizisi bekleniyor.' });
        }

        const newContents = items.map(item => {
            // Kullanıcının formatı: { id: 1, value: { en: "...", tr: "...", level: "A1" } }
            // Veya direkt format: { englishText: "...", turkishTranslation: "...", level: "A1", type: "word" }
            
            const enText = (item.value?.en || item.englishText || '').trim();
            const trText = (item.value?.tr || item.turkishTranslation || '').trim();
            let itemLevel = (item.value?.level || item.level || 'A1').trim();
            
            // Eğer veride kazara boşluk veya geçersiz seviye (örn: A3) varsa A1'e çek
            const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            if (!validLevels.includes(itemLevel)) itemLevel = 'A1';

            let itemType = item.type;

            if (!itemType) {
                // Tipi metin uzunluğundan tahmin et
                if (!enText.includes(' ') && enText.length < 20) {
                    itemType = 'word';
                } else if (enText.length > 200) {
                    itemType = 'paragraph';
                } else {
                    itemType = 'sentence';
                }
            }

            // Çoklu çeviriyi array'e çevir
            const translationsArray = trText.split(',').map(s => s.trim()).filter(s => s.length > 0);

            return {
                type: itemType,
                level: itemLevel,
                englishText: enText,
                turkishTranslations: translationsArray,
                wordType: item.wordType || null,
                priority: 1
            };
        });

        // Geçerli olanları filtrele (boş olanları atla)
        const validContents = newContents.filter(c => c.englishText && c.turkishTranslations.length > 0);

        await Content.insertMany(validContents);
        res.status(201).json({ success: true, count: validContents.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/admin/content
// @desc    Yeni bir içerik (kelime, cümle, paragraf) ekler
router.post('/content', requireAdmin, async (req, res) => {
    try {
        const { type, level, englishText, turkishTranslation, wordType, priority } = req.body;
        
        const translationsArray = turkishTranslation.split(',').map(s => s.trim()).filter(s => s.length > 0);

        const newContent = new Content({
            type, level, englishText, turkishTranslations: translationsArray, wordType, priority
        });

        await newContent.save();
        res.status(201).json({ success: true, content: newContent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/content/:id
// @desc    İçeriği günceller (öncelik, metin vs.)
router.put('/content/:id', requireAdmin, async (req, res) => {
    try {
        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json({ success: true, content: updatedContent });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/admin/content/:id
// @desc    İçeriği siler
router.delete('/content/:id', requireAdmin, async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/admin/content-all
// @desc    Tüm içerikleri siler (Tehlikeli!)
router.delete('/content-all', requireAdmin, async (req, res) => {
    try {
        const result = await Content.deleteMany({});
        res.json({ success: true, message: `${result.deletedCount} adet içerik başarıyla silindi.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
