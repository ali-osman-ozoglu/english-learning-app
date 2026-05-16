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
            
            if (!key || !key.startsWith('AIza')) {
                continue;
            }

            // Her bir anahtar için birincil ve yedek modelleri dene
            const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
            
            for (const modelName of modelsToTry) {
                try {
                    console.log(`[AI] Deneniyor: Key Index ${this.currentIndex}, Model: ${modelName}`);
                    const genAI = new GoogleGenAI({ apiKey: key });
                    const response = await genAI.models.generateContent({
                        model: modelName,
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: mimeType,
                        },
                    });

                    console.log(`[AI] Yanıt objesi (Keys):`, Object.keys(response));
                    if (response && response.text) {
                        return response.text;
                    }
                } catch (error) {
                    lastError = error;
                    const statusCode = error.status || (error.response ? error.response.status : null);
                    console.error(`[AI] Hata (Model: ${modelName}, Status: ${statusCode}):`, error.message);
                    
                    // Eğer hata 404 ise, bu model desteklenmiyor demektir; AYNI anahtar için sıradaki modeli dene
                    if (statusCode === 404) continue;
                    
                    // Eğer hata 429 veya 503 ise, kısa süre bekle ve SIRADAKİ ANAHTAR'a geç
                    if (statusCode === 429 || statusCode === 503) {
                        console.log(`[AI] Kota/Yoğunluk, bir sonraki anahtara geçiliyor...`);
                        break; // İç döngüden çık, dış döngüdeki bir sonraki anahtara geçer
                    }
                }
            }
        }
        throw lastError || new Error('Tüm API anahtarları ve modeller denendi ama başarılı olunamadı.');
    }
}

const aiRotator = new AIRotator();

module.exports = { aiRotator };
