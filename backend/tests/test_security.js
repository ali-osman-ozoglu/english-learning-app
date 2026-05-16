const crypto = require('crypto');

const API_URL = 'http://localhost:5000/api';
let testUUID = crypto.randomUUID();
let authToken = '';
let transferCode = '';

async function runTests() {
    console.log('--- GÜVENLİK TESTLERİ BAŞLIYOR ---\n');

    // 1. Yeni Cihaz Kaydı Testi
    console.log('1. [AUTH] Yeni cihaz kaydı deneniyor...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: testUUID })
    });
    const regData = await regRes.json();
    if (regData.success && regData.user.authToken) {
        console.log('✅ Başarılı: Kayıt yapıldı, AuthToken alındı.');
        authToken = regData.user.authToken;
    } else {
        console.error('❌ Başarısız: Kayıt yapılamadı.', regData);
        return;
    }

    // 2. Yetkisiz Erişim Testi (Token Yok)
    console.log('\n2. [AUTH] Token olmadan veri çekme deneniyor...');
    const noTokenRes = await fetch(`${API_URL}/content/vocabulary?uuid=${testUUID}`);
    if (noTokenRes.status === 401) {
        console.log('✅ Başarılı: Sistem yetkisiz erişimi engelledi (401).');
    } else {
        console.error(`❌ Başarısız: Engellenmedi! Status: ${noTokenRes.status}`);
    }

    // 3. Yetkili Erişim Testi
    console.log('\n3. [AUTH] Token ile veri çekme deneniyor...');
    const withTokenRes = await fetch(`${API_URL}/content/vocabulary?uuid=${testUUID}`, {
        headers: { 'x-auth-token': authToken }
    });
    if (withTokenRes.status === 200 || withTokenRes.status === 404) { // 404 is okay if no vocab exists
        console.log('✅ Başarılı: Geçerli token ile erişime izin verildi.');
    } else {
        console.error(`❌ Başarısız: İzin verilmedi! Status: ${withTokenRes.status}`);
    }

    // 4. Rate Limiting (DDoS) Testi
    console.log('\n4. [SECURITY] Rate Limit (DDoS Koruması) testi başlıyor... (205 istek atılacak)');
    let rateLimitTriggered = false;
    for (let i = 0; i < 205; i++) {
        // Hızlıca istek atıyoruz (aynı IP'den)
        const res = await fetch(`${API_URL}/content/vocabulary?uuid=${testUUID}`, {
            headers: { 'x-auth-token': authToken }
        });
        if (res.status === 429) {
            rateLimitTriggered = true;
            console.log(`✅ Başarılı: ${i}. istekte Rate Limit devreye girdi ve istek engellendi (429).`);
            break;
        }
    }
    if (!rateLimitTriggered) {
        console.warn('⚠️ Uyarı: Rate limit devreye girmedi. Test aracı limitleri veya sunucu yapılandırması kontrol edilmeli.');
    }

    // 5. Cihaz Transferi Güvenlik Testi
    console.log('\n5. [TRANSFER] Transfer kodu üretiliyor...');
    const genRes = await fetch(`${API_URL}/auth/generate-transfer-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': authToken },
        body: JSON.stringify({ uuid: testUUID })
    });
    const genData = await genRes.json();
    if (genData.success && genData.transferCode) {
        transferCode = genData.transferCode;
        console.log(`✅ Başarılı: Transfer kodu üretildi (${transferCode}).`);
    } else {
        console.error('❌ Başarısız: Transfer kodu üretilemedi.', genData);
    }

    // Sahte transfer kodu ile deneme
    console.log('\n6. [TRANSFER] Geçersiz kod ile transfer deneniyor...');
    let newUUID = crypto.randomUUID();
    const badTransRes = await fetch(`${API_URL}/auth/transfer-device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferCode: 'H4CK3R', newUuid: newUUID })
    });
    if (badTransRes.status === 400 || badTransRes.status === 404) {
         console.log('✅ Başarılı: Geçersiz kod ile transfer engellendi.');
    } else {
         console.error('❌ Başarısız: Geçersiz koda izin verildi!', badTransRes.status);
    }

    // Gerçek transfer
    console.log('\n7. [TRANSFER] Gerçek kod ile cihaz transferi deneniyor...');
    const transRes = await fetch(`${API_URL}/auth/transfer-device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferCode: transferCode, newUuid: newUUID })
    });
    const transData = await transRes.json();
    if (transData.success && transData.authToken) {
         console.log('✅ Başarılı: Transfer gerçekleşti. Yeni AuthToken:', transData.authToken);
         
         // Eski token'in iptal edildiğini doğrulama
         console.log('\n8. [AUTH] Eski token ile erişim deneniyor...');
         const oldTokenRes = await fetch(`${API_URL}/content/vocabulary?uuid=${testUUID}`, {
            headers: { 'x-auth-token': authToken }
         });
         if (oldTokenRes.status === 401) {
             console.log('✅ Başarılı: Transfer sonrası eski cihazın (token) yetkisi iptal edildi.');
         } else {
             console.error('❌ Başarısız: Eski cihaz hala erişim sağlayabiliyor!');
         }
    } else {
         console.error('❌ Başarısız: Transfer gerçekleştirilemedi.', transData);
    }

    console.log('\n--- GÜVENLİK TESTLERİ TAMAMLANDI ---');
}

runTests();
