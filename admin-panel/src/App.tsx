import React, { useEffect, useState } from 'react';
import { getContents, createContent, bulkCreateContent, deleteContent, deleteAllContent, loginAdmin, logoutAdmin } from './api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
  const [adminRole, setAdminRole] = useState(localStorage.getItem('adminRole') || '');
  const [username, setUsername] = useState('');
  // Şifreyi state yerine ref ile tutuyoruz (Inspector'da value olarak gözükmemesi için)
  const passwordRef = React.useRef<HTMLInputElement>(null);
  
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Durumları
  const [type, setType] = useState('word');
  const [level, setLevel] = useState('A1');
  const [englishText, setEnglishText] = useState('');
  const [turkishTranslation, setTurkishTranslation] = useState('');
  const [wordType, setWordType] = useState('');
  const [priority, setPriority] = useState(1);

  // Toplu Yükleme Durumu
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = passwordRef.current?.value || '';
    try {
      const res = await loginAdmin(username, password);
      setIsLoggedIn(true);
      setAdminRole(res.role.toString());
      // Alanları temizle
      setUsername('');
      if (passwordRef.current) passwordRef.current.value = '';
    } catch (error: any) {
      alert('Giriş başarısız: ' + (error?.response?.data?.message || 'Şifre hatalı.'));
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsLoggedIn(false);
    // Çıkış yapıldığında form alanlarını sıfırla
    setUsername('');
    if (passwordRef.current) passwordRef.current.value = '';
  };

  const fetchData = async () => {
    try {
      const data = await getContents();
      setContents(data);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 401) {
        handleLogout();
      } else {
        alert('Veriler alınamadı. Lütfen bağlantınızı kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContent({ type, level, englishText, turkishTranslation, wordType, priority });
      setEnglishText('');
      setTurkishTranslation('');
      setWordType('');
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert('İçerik eklenemedi: ' + (error?.response?.data?.message || error.message));
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dataArray;
      try {
        dataArray = JSON.parse(bulkJson);
      } catch (e) {
        alert('Geçersiz JSON formatı. Lütfen JSON verinizi kontrol edin.');
        return;
      }
      
      if (!Array.isArray(dataArray)) {
        alert('JSON verisi bir dizi (array) formatında olmalıdır: [ { ... }, { ... } ]');
        return;
      }

      const res = await bulkCreateContent(dataArray);
      alert(res.count + ' adet içerik başarıyla eklendi!');
      setBulkJson('');
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert('Toplu ekleme başarısız: ' + (error?.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu içeriği kalıcı olarak silmek istediğinize emin misiniz?')) {
      try {
        await deleteContent(id);
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Silme başarısız.');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('DİKKAT: Veritabanındaki TÜM içerikler kalıcı olarak silinecektir. Bu işlem geri alınamaz. Emin misiniz?')) {
      try {
        const res = await deleteAllContent();
        alert(res.message);
        fetchData();
      } catch (error: any) {
        console.error(error);
        alert('Tümünü silme işlemi başarısız: ' + (error?.response?.data?.message || error.message));
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box glass-container">
          <div className="header">
            <h1>Admin Girişi</h1>
            <p style={{color: '#94a3b8'}}>Devam etmek için kimliğinizi doğrulayın</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="admin"
                required
              />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <input 
                type="password" 
                ref={passwordRef}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" style={{marginTop: '1rem'}}>Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-container">
      <div className="header" style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1>Admin Paneli</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>İngilizce İçerik Yönetimi</div>
            <span className="badge" style={{ backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8' }}>
              Yetki Seviyesi: {adminRole}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="danger" style={{padding: '0.6rem 1.2rem', width: 'auto'}}>Çıkış Yap</button>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>İçerik Tipi</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="word">Kelime (Vocabulary)</option>
            <option value="sentence">Cümle (Reading/Sentence)</option>
            <option value="paragraph">Paragraf (Reading/Advanced)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Hedef Seviye</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="A1">A1 - Başlangıç</option>
            <option value="A2">A2 - Temel</option>
            <option value="B1">B1 - Orta</option>
            <option value="B2">B2 - Üst Orta</option>
            <option value="C1">C1 - İleri</option>
            <option value="C2">C2 - Yetkin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Kelime Türü (Opsiyonel)</label>
          <select value={wordType} onChange={(e) => setWordType(e.target.value)}>
            <option value="">Belirtilmemiş</option>
            <option value="verb">Fiil (Verb)</option>
            <option value="noun">İsim (Noun)</option>
            <option value="adjective">Sıfat (Adjective)</option>
            <option value="adverb">Zarf (Adverb)</option>
            <option value="preposition">Edat (Preposition)</option>
            <option value="conjunction">Bağlaç (Conjunction)</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Öncelik (0-5) [0 ise kullanıcıya gösterilmez]</label>
          <input 
            type="number" 
            min="0" 
            max="5" 
            value={priority} 
            onChange={(e) => setPriority(Number(e.target.value))} 
            style={{ maxWidth: '150px' }}
          />
        </div>

        <div className="form-group full-width">
          <label>İngilizce Metin</label>
          <textarea 
            required 
            value={englishText} 
            onChange={(e) => setEnglishText(e.target.value)} 
            placeholder="Örn: Evren, Apple, veya okuma için uzun bir metin..." 
          />
        </div>

        <div className="form-group full-width">
          <label>Türkçe Çeviri (Birden fazla ise virgülle ayırın)</label>
          <textarea 
            required 
            value={turkishTranslation} 
            onChange={(e) => setTurkishTranslation(e.target.value)} 
            placeholder="Örn: almak, anlamak, elde etmek" 
          />
        </div>

        <div className="form-group full-width">
          <button type="submit">İçeriği Veritabanına Ekle</button>
        </div>
      </form>

      <div className="header" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>JSON ile Toplu Ekleme</h2>
        <button className="danger" onClick={handleClearAll} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>⚠️ Tüm Verileri Sil</button>
      </div>
      <form onSubmit={handleBulkSubmit} className="form-grid">
        <div className="form-group full-width">
          <label>JSON Verisi</label>
          <textarea 
            required 
            value={bulkJson} 
            onChange={(e) => setBulkJson(e.target.value)} 
            placeholder={'Örnek format:\n[\n  { "id": 1, "value": { "en": "I am a student.", "tr": "Ben bir öğrenciyim.", "level": "A1" } }\n]'} 
            style={{ minHeight: '150px', fontFamily: 'monospace' }}
          />
        </div>
        <div className="form-group full-width">
          <button type="submit" style={{ background: '#10b981' }}>Toplu Verileri Yükle</button>
        </div>
      </form>

      {loading ? (
        <p style={{ color: '#38bdf8', fontSize: '1.2rem', textAlign: 'center', marginTop: '2rem' }}>Yükleniyor...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Tip</th>
                <th>Seviye</th>
                <th>Kelime Türü</th>
                <th>Öncelik</th>
                <th>İngilizce</th>
                <th>Türkçe</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((item) => (
                <tr key={item._id}>
                  <td><span className={`badge ${item.type}`}>{item.type}</span></td>
                  <td><span className={`badge ${item.level}`}>{item.level}</span></td>
                  <td>{item.wordType ? <span className="badge" style={{backgroundColor: '#64748b'}}>{item.wordType}</span> : '-'}</td>
                  <td style={{ textAlign: 'center' }}>{item.priority}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#e2e8f0' }}>{item.englishText}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#94a3b8' }}>{item.turkishTranslations?.join(', ') || ''}</td>
                  <td>
                    <button className="danger" onClick={() => handleDelete(item._id)}>Sil</button>
                  </td>
                </tr>
              ))}
              {contents.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Veritabanında henüz içerik bulunmuyor. Lütfen yukarıdan ekleyin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
