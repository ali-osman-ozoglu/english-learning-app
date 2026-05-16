require('dotenv').config({ path: '../.env' });
const { GoogleGenAI } = require('@google/genai');

const keys = process.env.GEMINI_API_KEYS 
    ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) 
    : [process.env.GEMINI_API_KEY];

async function checkAllKeys() {
    console.log(`Checking ${keys.length} API keys...\n`);
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key || !key.startsWith('AIza')) continue;

        try {
            console.log(`[Key ${i}] Testing: ${key.substring(0, 8)}...`);
            const ai = new GoogleGenAI({ apiKey: key });
            
            // Try to list models
            const modelsPager = await ai.models.list();
            const modelNames = [];
            for await (const model of modelsPager) {
                modelNames.push(model.name);
            }
            
            console.log(`[Key ${i}] SUCCESS! Found ${modelNames.length} models.`);
            console.log(`[Key ${i}] Sample models: ${modelNames.slice(0, 5).join(', ')}`);
            
            const hasFlash = modelNames.some(m => m.includes('gemini-1.5-flash'));
            console.log(`[Key ${i}] Supports gemini-1.5-flash: ${hasFlash ? 'YES' : 'NO'}`);
            
        } catch (error) {
            console.error(`[Key ${i}] FAILED: ${error.message}`);
        }
        console.log('-------------------');
    }
}

checkAllKeys();
