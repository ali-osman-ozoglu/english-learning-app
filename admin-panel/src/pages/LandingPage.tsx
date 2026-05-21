import { motion } from 'framer-motion';
import { Sparkles, Brain, Mic, Download, ShieldCheck, FileText, Lock } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar glass-nav">
        <div className="nav-brand">
          <Sparkles className="brand-icon" />
          <span className="brand-name">myLanguage</span>
        </div>
        <div className="nav-links">
          <a href="#assessment">Seviye Tespiti</a>
          <a href="#modules">Modüller</a>
          <a href="#ai">Sanal Öğretmen</a>
          <a href="#privacy">Gizlilik</a>
          <a href="#download" className="nav-cta">Hemen İndir</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="badge">✨ Yapay Zeka ile Kendi Hızınızda Öğrenin</div>
          <h1 className="hero-title">
            Ezberlemeyin, <br />
            <span className="gradient-text">Hissederek Öğrenin</span>
          </h1>
          <p className="hero-subtitle">
            myLanguage sadece bir uygulama değil, sizi anlayan, ruh halinize göre ders planlayan ve her hatanızı size özel Türkçe notlarla düzelten kişisel İngilizce öğretmeninizdir.
          </p>
          <div className="hero-buttons">
            <a href="#download" className="btn-primary">
              <Download size={20} /> Uygulamayı İndir
            </a>
            <a href="#assessment" className="btn-secondary">
              Nasıl Çalışır?
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-image-container"
          style={{ display: 'flex', gap: '20px', position: 'relative' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glow-effect" style={{ width: '150%', height: '150%', top: '-25%', left: '-25%' }}></div>
          <img src="/screenshots/1.jpg" alt="Hoş Geldiniz" className="hero-mockup" style={{ zIndex: 2 }} />
          <img src="/screenshots/2.jpg" alt="Dil Seçimi" className="hero-mockup" style={{ zIndex: 1, transform: 'scale(0.9) translateX(-40%)', opacity: 0.8 }} />
        </motion.div>
      </section>

      {/* AI Assessment Section */}
      <section id="assessment" className="features-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '100px 0' }}>
        <motion.div className="section-header" {...fadeIn}>
          <h2>Sizi Gerçekten Tanıyan Uygulama</h2>
          <p>Klasik "Seviyeniz nedir?" sorusunu unutun. 37 soruluk yapay zeka analizimizle İngilizce geçmişinizi, psikolojinizi ve gelecek planlarınızı öğreniyoruz.</p>
        </motion.div>

        <motion.div 
          className="features-grid" 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '50px' }}
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          <motion.div className="feature-card" variants={fadeIn}>
            <img src="/screenshots/3.jpg" alt="Eğitim Geçmişi" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />
            <h3>Eğitim Geçmişiniz</h3>
            <p>Hangi okullardan mezun olduğunuzu, İngilizceyle olan bağınızı analiz eder.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeIn}>
            <img src="/screenshots/4.jpg" alt="Öğrenme Stili" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />
            <h3>Öğrenme Stiliniz</h3>
            <p>Zorunlu ders mi, özel kurs mu yoksa kendi kendinize mi öğrendiğinizi belirler.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeIn}>
            <img src="/screenshots/5.jpg" alt="Ruh Hali" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />
            <h3>Anlık Ruh Haliniz</h3>
            <p>Açık uçlu sorularla anlık motivasyonunuzu ve İngilizce ifade yeteneğinizi ölçer.</p>
          </motion.div>
          <motion.div className="feature-card" variants={fadeIn}>
            <img src="/screenshots/6.jpg" alt="Gelecek Planları" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />
            <h3>Gelecek Planları</h3>
            <p>Öğrenme hedeflerinizi anlayarak müfredatı sizin hayallerinize göre optimize eder.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Modules Section */}
      <section id="modules" className="features-section">
        <motion.div className="section-header" {...fadeIn}>
          <h2>Dört Temel Beceride Uzmanlaşın</h2>
          <p>Okuma, yazma, konuşma ve kelime ezberleme pratikleri tek bir ekranda elinizin altında.</p>
        </motion.div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '50px', marginTop: '40px' }}>
          <motion.img 
            src="/screenshots/7.jpg" 
            alt="Modüller Menüsü" 
            style={{ width: '300px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            {...fadeIn}
          />
          <motion.div style={{ flex: '1', minWidth: '300px', maxWidth: '500px' }} variants={staggerContainer} initial="initial" whileInView="whileInView">
            <motion.div className="feature-card" style={{ marginBottom: '20px' }} variants={fadeIn}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div className="feature-icon bg-blue" style={{ margin: 0 }}><Brain size={20} /></div>
                <h3 style={{ margin: 0 }}>Akıllı Kelime Hazinesi</h3>
              </div>
              <p>Bağlama göre doğru anlamı seçme becerinizi geliştirin. Kelimeleri unutma eğrinize göre tam zamanında tekrar edin.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <img src="/screenshots/8.jpg" alt="Kelime 1" style={{ width: '48%', borderRadius: '8px' }} />
                <img src="/screenshots/9.jpg" alt="Kelime 2" style={{ width: '48%', borderRadius: '8px' }} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Showcase Section (Pronunciation & Writing) */}
      <section id="ai" className="ai-showcase" style={{ margin: '50px 0' }}>
        <div className="ai-content">
          <motion.h2 {...fadeIn}>
            Google Gemini ile<br />Sanal İngilizce Öğretmeniniz
          </motion.h2>
          <div className="ai-features">
            <motion.div className="ai-item" {...fadeIn}>
              <Mic className="ai-icon" />
              <div>
                <h4>Mikro Hata Tespiti (Telaffuz)</h4>
                <p>Sesinizi dinler. Sadece doğru/yanlış demez. "W ve N seslerini çıkarmakta zorlanmışsın" gibi inanılmaz detaylı akustik analizler sunar.</p>
              </div>
            </motion.div>
            <motion.div className="ai-item" {...fadeIn}>
              <FileText className="ai-icon" />
              <div>
                <h4>Gramer ve Anlam Bütünlüğü (Dikte/Çeviri)</h4>
                <p>Siz yazdıkça, büyük/küçük harf hatalarınızdan cümle yapısındaki anlamsal kaymalara kadar her detayı açıklayarak doğrular.</p>
              </div>
            </motion.div>
            <motion.div className="ai-item" {...fadeIn}>
              <ShieldCheck className="ai-icon" />
              <div>
                <h4>Kesintisiz Öğrenim (Yerel NLP)</h4>
                <p>Yapay zeka kotası dolsa bile durmak yok! Uygulama içindeki Yerel Doğal Dil İşleme motoru ile puanlama ve analizler devam eder.</p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="ai-image-wrapper" style={{ display: 'flex', gap: '20px' }}>
          <div className="ai-glow"></div>
          <motion.img src="/screenshots/10.jpg" alt="Telaffuz Geri Bildirimi" className="ai-mockup" {...fadeIn} />
          <motion.img src="/screenshots/13.jpg" alt="Dikte Geri Bildirimi" className="ai-mockup" style={{ transform: 'translateY(40px)' }} {...fadeIn} />
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="features-section" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '100px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', justifyContent: 'center', gap: '50px' }}>
          <motion.div style={{ flex: '1', minWidth: '300px', maxWidth: '500px' }} {...fadeIn}>
            <div className="feature-icon bg-purple" style={{ marginBottom: '20px' }}><Lock size={32} /></div>
            <h2>Kayıt Yok, Tamamen Anonim Özgürlük</h2>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '1.8', marginBottom: '30px' }}>
              E-posta, şifre veya telefon numarası istemiyoruz. Öğrenme verileriniz cihazınızda, tamamen anonim olarak saklanır.
            </p>
            <div className="feature-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Cihazımı Değiştir / Veri Aktar</h3>
              <p style={{ margin: 0 }}>Telefonunuzu mu değiştirdiniz? Sadece 6 haneli güvenli transfer kodunuzu üreterek tüm gelişiminizi yeni cihazınıza anında aktarabilirsiniz.</p>
            </div>
          </motion.div>
          <motion.img 
            src="/screenshots/17.jpg" 
            alt="Cihaz Değiştirme ve Gizlilik" 
            style={{ width: '300px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            {...fadeIn}
          />
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="download-section">
        <motion.div 
          className="download-box glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Hazır Mısınız?</h2>
          <p>İngilizce öğrenme serüveninize bugün başlayın. Kurulum tamamen ücretsizdir.</p>
          <div className="store-buttons">
            <a href="#" className="store-btn android">
              <div className="store-icon">🤖</div>
              <div className="store-text">
                <span className="small">İndir</span>
                <span className="big">Android APK</span>
              </div>
            </a>
            <a href="#" className="store-btn ios disabled">
              <div className="store-icon">🍎</div>
              <div className="store-text">
                <span className="small">Çok Yakında</span>
                <span className="big">App Store</span>
              </div>
            </a>
          </div>
          <p className="note">* Mobil uygulama henüz geliştirme aşamasındadır. Android APK linki yakında eklenecektir.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="brand">
            <Sparkles size={20} /> myLanguage
          </div>
          <p>© 2026 Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
