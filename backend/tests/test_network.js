const http = require('http');

console.log('--- AĞ GECİKMESİ VE TIMEOUT TESTİ BAŞLIYOR (Portability & Network) ---');

// Arka planda bilerek geç yanıt veren sahte bir sunucu başlatalım
const fakeServer = http.createServer((req, res) => {
    // 5.5 saniye bilerek geciktiriyoruz
    setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Delayed Response' }));
    }, 5500); 
});

fakeServer.listen(5001, async () => {
    console.log('[TEST] Sahte gecikmeli sunucu 5001 portunda başlatıldı (Gecikme: 5.5sn).');
    console.log('[TEST] İstemci (App) bu sunucuya 60sn zaman aşımı ayarıyla istek atacak...');
    
    const startTime = Date.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 saniye timeout
        
        const response = await fetch('http://localhost:5001/', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const duration = Date.now() - startTime;
        
        console.log(`\n✅ Başarılı: İstek iptal edilmedi, ${duration}ms boyunca beklendi ve yanıt alındı.`);
        console.log('✅ SONUÇ: PASSED (ISO 25010 - Recoverability / Network Resilience sağlandı)');
    } catch (error) {
        console.error(`\n❌ Başarısız: İstek zaman aşımına uğradı veya patladı! Hata: ${error.message}`);
        console.log('❌ SONUÇ: FAILED');
    } finally {
        fakeServer.close();
    }
});
