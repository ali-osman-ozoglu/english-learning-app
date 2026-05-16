require('dotenv').config({ path: '../.env' });
const { GoogleGenAI } = require('@google/genai');

const key = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        console.log(`Listing models for key: ${key.substring(0, 8)}...`);
        const genAI = new GoogleGenAI({ apiKey: key });
        // The @google/genai package might have a different way to list models.
        // Let's try to see the available models by triggering a specific error or using a discovery method if it exists.
        // Or just try a few variations.
        
        const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
        
        for (const model of models) {
            try {
                const response = await genAI.models.generateContent({
                    model: model,
                    contents: [{ role: 'user', parts: [{ text: "test" }] }],
                });
                console.log(`Model ${model} is supported!`);
            } catch (e) {
                console.log(`Model ${model} failed: ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
