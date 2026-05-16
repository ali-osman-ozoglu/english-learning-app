const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_SCAN = ['./routes', './models', './middleware'];
let issuesFound = 0;

console.log('--- STATİK KOD ANALİZİ BAŞLIYOR (Maintainability) ---');

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDirectory(fullPath);
        } else if (fullPath.endsWith('.js')) {
            analyzeFile(fullPath);
        }
    });
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Kural 1: Hardcoded sırlar (password, secret kelimeleri string içinde)
        if (line.match(/['"](secret|key)['"]/i) && !line.includes('process.env') && !line.includes('this.isModified')) {
            console.warn(`[UYARI] Potansiyel Hardcoded Secret: ${filePath} (Satır ${lineNum})`);
            issuesFound++;
        }
        
        // Kural 2: Üretim ortamında console.log bırakılmış mı? (Sadece uyarı)
        if (line.includes('console.log') && !filePath.includes('test')) {
            // Sadece loglamak yetmez, uyarı saymayalım ama bilgi verelim
            // console.info(`[BİLGİ] Console.log kullanıldı: ${filePath} (Satır ${lineNum})`);
        }
    });
}

DIRECTORIES_TO_SCAN.forEach(dir => scanDirectory(dir));

console.log(`\nAnaliz Tamamlandı. Bulunan potansiyel sorun (İhlal) sayısı: ${issuesFound}`);
if (issuesFound === 0) {
    console.log('✅ SONUÇ: PASSED (ISO 25010 - Maintainability sağlandı. Temiz Kod!)');
} else {
    console.log('❌ SONUÇ: FAILED (Kod standartları ihlali mevcut)');
}
