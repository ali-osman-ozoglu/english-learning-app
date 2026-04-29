const { GoogleGenAI } = require('@google/genai');

/**
 * Gemini API Key rotasyonu ve içerik üretimi sağlayan yardımcı sınıf
 */
class AIRotator {
    constructor() {
        this.keys = process.env.GEMINI_API_KEYS 
            ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) 
            : [process.env.GEMINI_API_KEY];
        
        this.currentIndex = 0;
    }

    /**
     * Sıradaki API anahtarını alır
     */
    getNextKey() {
        if (!this.keys || this.keys.length === 0) {
            throw new Error('GEMINI_API_KEYS veya GEMINI_API_KEY bulunamadı.');
        }

        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    }

    /**
     * Gemini API ile içerik üretir (Rotasyon ve hata yönetimi ile)
     */
    async generateContent(prompt, mimeType = "application/json") {
        let lastError = null;
        
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.getNextKey();
            
            // Placeholder anahtarları atla
            if (!key || !key.startsWith('AIza')) {
                console.log(`[AI] Geçersiz anahtar atlandı (Index: ${this.currentIndex})`);
                continue;
            }

            try {
                console.log(`[AI] Anahtar deneniyor (Index: ${this.currentIndex}, Key: ${key.substring(0, 8)}...)`);
                const genAI = new GoogleGenAI({ apiKey: key }); // Varsayılana bırak
                const response = await genAI.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: mimeType,
                    },
                });

                return response.text;
            } catch (error) {
                lastError = error;
                const statusCode = error.status || (error.response ? error.response.status : null);
                console.error(`[AI] Anahtar hatası (Index: ${this.currentIndex}, Status: ${statusCode}):`, error.message);
                console.log('Hata Detayı:', JSON.stringify(error));
                
                // Eğer hata 429, 503 veya 404 ise diğerini dene
                if (statusCode === 429 || statusCode === 503 || statusCode === 404 || error.message?.includes('429') || error.message?.includes('503')) {
                    console.log(`[AI] Kota/Yoğunluk hatası, 1 saniye bekleniyor...`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
                    continue;
                } else {
                    break;
                }
            }
        }
        throw lastError || new Error('Tüm API anahtarları denendi ama başarılı olunamadı.');
    }
}

const aiRotator = new AIRotator();

module.exports = { aiRotator };
