const User = require('../models/User');

/**
 * API Güvenliği için Kimlik Doğrulama Middleware'i
 * İsteklerde X-Auth-Token header'ını ve gövdedeki uuid'yi kontrol eder.
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['x-auth-token'];
        // Bazı isteklerde uuid query parametresi olarak gelebilir (GET istekleri)
        const uuid = (req.body && req.body.uuid) || req.query.uuid;

        // Admin rotaları veya kayıt rotası için istisnalar eklenebilir
        // Ancak bu middleware sadece korumalı rotalara eklenecektir.

        if (!token || !uuid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Yetkisiz erişim: UUID veya Güvenlik Tokanı eksik.' 
            });
        }

        const user = await User.findOne({ uuid, authToken: token });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Yetkisiz erişim: Geçersiz güvenlik tokanı.' 
            });
        }

        // Kullanıcı nesnesini req içine ekle ki sonraki aşamalarda tekrar DB'ye gitmeyelim
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu Hatası' });
    }
};

module.exports = authMiddleware;
