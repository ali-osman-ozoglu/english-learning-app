const axios = require('axios');

async function testLocaltunnel() {
    try {
        const res = await fetch('https://tired-ways-arrive.loca.lt/api/content/vocabulary');
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Data (first 100 chars):', text.substring(0, 100));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
testLocaltunnel();
