require('dotenv').config({ path: '../.env' });
const { GoogleGenAI } = require('./aiClient'); // Re-using the class logic if possible, or just standard SDK
const { GoogleGenAI: GGenAI } = require('@google/genai');

const keys = process.env.GEMINI_API_KEYS 
    ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) 
    : [process.env.GEMINI_API_KEY];

async function testKeys() {
    console.log(`Checking ${keys.length} API keys for gemini-1.5-flash support...\n`);
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key || !key.startsWith('AIza')) {
            console.log(`[Key ${i}] Skipping invalid key.`);
            continue;
        }

        try {
            const genAI = new GGenAI({ apiKey: key });
            const response = await genAI.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ role: 'user', parts: [{ text: "Hi, respond with 'OK' if you can hear me." }] }],
                generationConfig: {
                    responseMimeType: "text/plain",
                },
            });

            console.log(`[Key ${i}] (Index: ${i}, Key: ${key.substring(0, 8)}...) -> SUCCESS: ${response.text.trim()}`);
        } catch (error) {
            const statusCode = error.status || (error.response ? error.response.status : 'Unknown');
            console.error(`[Key ${i}] (Index: ${i}, Key: ${key.substring(0, 8)}...) -> FAILED (Status: ${statusCode}): ${error.message.split('\n')[0]}`);
        }
    }
}

testKeys();
