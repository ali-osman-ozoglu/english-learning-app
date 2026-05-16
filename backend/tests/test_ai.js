require('dotenv').config();
const { aiRotator } = require('./utils/aiClient');

async function testAI() {
    console.log('--- AI DAYANIKLILIK TESTİ BAŞLIYOR ---\n');

    // Geçici olarak bilerek bozuk anahtarlar ekliyoruz (İlk 2 anahtar)
    aiRotator.keys = ['AIza_BozukAnahtar1', 'AIza_BozukAnahtar2', ...aiRotator.keys];
    
    console.log(`[TEST] Havuza kasıtlı olarak 2 bozuk anahtar eklendi. Toplam ${aiRotator.keys.length} anahtar var.`);
    console.log('[TEST] Sistem, bozuk anahtarları atlayıp sağlam anahtara geçiş yapmalı...\n');

    try {
        const prompt = "Just reply with the word: SUCCESS";
        const result = await aiRotator.generateContent(prompt, "text/plain");
        
        console.log('\n✅ Başarılı: AI Yanıt Döndü!');
        console.log(`Yanıt: ${result}`);
        
    } catch (error) {
        console.error('❌ Başarısız: AI yanıt dönemedi.', error);
    }
}

testAI();
