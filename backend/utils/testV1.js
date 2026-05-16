require('dotenv').config({ path: '../.env' });
const { GoogleGenAI } = require('@google/genai');

const key = process.env.GEMINI_API_KEY;

async function testV1() {
    try {
        console.log(`Testing with v1 and gemini-1.5-flash...`);
        const genAI = new GoogleGenAI({ apiKey: key, apiVersion: 'v1' });
        
        const response = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: 'user', parts: [{ text: "Hi" }] }],
        });
        console.log(`SUCCESS with v1: ${response.text}`);
    } catch (e) {
        console.log(`FAILED with v1: ${e.message}`);
    }
}

testV1();
