import { motion } from 'framer-motion';
import { Sparkles, Brain, Mic, Keyboard, Download, ShieldCheck, Bot } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
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
          <a href="#features">Özellikler</a>
          <a href="#ai">Yapay Zeka</a>
          <a href="/admin" className="admin-link">Yönetim</a>
          <a href="#download" className="nav-cta">Hemen İndir</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="badge">✨ Yeni Nesil İngilizce Öğrenimi</div>
          <h1 className="hero-title">
            Yapay Zeka ile <br />
            <span className="gradient-text">İngilizcenizi Konuşturun</span>
          </h1>
          <p className="hero-subtitle">
            Geleneksel kursları unutun. Gemini AI destekli akıllı modüllerimizle okuma, yazma, konuşma ve kelime ezberleme pratiklerini gerçek bir öğretmenle yapıyormuş gibi deneyimleyin.
          </p>
          <div className="hero-buttons">
            <a href="#download" className="btn-primary">
              <Download size={20} /> Uygulamayı İndir
            </a>
            <a href="#features" className="btn-secondary">
              Keşfet
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-image-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="glow-effect"></div>
          {/* Main App Screenshot */}
          <img src="/screenshots/screen1.png" alt="App Interface" className="hero-mockup" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <motion.div 
          className="section-header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2>4 Temel Beceride Uzmanlaşın</h2>
          <p>Her seviyeye uygun, Spaced Repetition (Aralıklı Tekrar) destekli modüller.</p>
        </motion.div>

        <div className="features-grid">
          <motion.div className="feature-card" whileHover={{ y: -10 }}>
            <div className="feature-icon bg-blue"><Brain size={24} /></div>
            <h3>Akıllı Kelime Haznesi</h3>
            <p>Seviyenize uygun kelimeleri, unutma eğrinize göre tam zamanında tekrar ederek kalıcı hafızanıza alın.</p>
            <img src="/screenshots/screen2.png" alt="Vocabulary Module" className="feature-screenshot" />
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -10 }}>
            <div className="feature-icon bg-green"><Mic size={24} /></div>
            <h3>Telaffuz Analizi</h3>
            <p>Sesli okuma pratiği yapın. Yapay zeka sesinizi dinlesin, hatalı telaffuz ettiğiniz kelimeleri anında işaretlesin.</p>
            <img src="/screenshots/screen3.png" alt="Pronunciation Module" className="feature-screenshot" />
          </motion.div>

          <motion.div className="feature-card" whileHover={{ y: -10 }}>
            <div className="feature-icon bg-purple"><Keyboard size={24} /></div>
            <h3>Çeviri ve Dikte</h3>
            <p>Duyduğunuzu yazın veya Türkçe cümleleri çevirin. Gramer ve anlam bütünlüğü anında değerlendirilsin.</p>
            <img src="/screenshots/screen4.png" alt="Writing Module" className="feature-screenshot" />
          </motion.div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section id="ai" className="ai-showcase">
        <div className="ai-content">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            Google Gemini ile<br />Sanal İngilizce Öğretmeniniz
          </motion.h2>
          <div className="ai-features">
            <div className="ai-item">
              <Bot className="ai-icon" />
              <div>
                <h4>Mikro Hata Tespiti ve Detaylı Notlar</h4>
                <p>Sadece puan vermekle kalmaz. Telaffuzda zorlandığınız 'w' ve 'n' sesleri gibi spesifik detayları veya yazımdaki küçük/büyük harf hatalarınızı bile fark edip Türkçe açıklar.</p>
              </div>
            </div>
            <div className="ai-item">
              <ShieldCheck className="ai-icon" />
              <div>
                <h4>Kesintisiz Öğrenim (Yerel NLP)</h4>
                <p>Yapay zeka analiz kotanız dolsa bile durmak yok! Uygulama içine entegre edilmiş Yerel NLP (Doğal Dil İşleme) motoru ile çevirileriniz anında değerlendirilmeye devam eder.</p>
              </div>
            </div>
            <div className="ai-item">
              <Sparkles className="ai-icon" />
              <div>
                <h4>Kayıt Yok, Tamamen Anonim</h4>
                <p>Kişisel veri veya e-posta istemiyoruz! İlerlemeniz cihazınızda anonim tutulur. Cihaz değiştirdiğinizde ise sadece 6 haneli güvenli bir transfer kodu ile tüm verilerinizi yeni telefonunuza aktarabilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="ai-image-wrapper">
          <div className="ai-glow"></div>
          {/* Reusing screen3 as it has AI feedback */}
          <img src="/screenshots/screen3.png" alt="AI Feedback" className="ai-mockup" />
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
