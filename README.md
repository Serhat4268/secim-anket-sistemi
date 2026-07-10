# Seçim Anket Sistemi

React (frontend) + Flask (backend) ile yapılmış, e-posta doğrulamalı kayıt
sistemi ve Türkiye il haritası üzerinden seçim bölgesi seçimi içeren bir
anket/oylama uygulaması.

## Klasör yapısı

```
secim-anket-sistemi/
├── backend/        Flask API (kayıt, e-posta doğrulama, giriş, oylama)
└── frontend/        React arayüzü (harita, formlar, oylama ekranı)
```

## Kurulum — Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Sunucu `http://localhost:5000` adresinde çalışır ve ilk açılışta
`veritabani.db` adında bir SQLite dosyası oluşturur.

`.env` dosyası zaten gönderdiğiniz e-posta/uygulama şifresiyle dolduruldu.
Doğrulama kodu e-postaları bu hesaptan gönderilir.

## Kurulum — Frontend

```bash
cd frontend
npm install
npm run dev
```

Arayüz `http://localhost:5173` adresinde açılır ve API isteklerini
`http://localhost:5000` adresine yapar (bkz. `src/api.js`).

## Akış

1. **Harita** (`/`) → giriş yapmadan herkes görüntüleyebilir. Bir ile
   tıklanır; **Ankara, İstanbul veya İzmir**'e tıklanınca o ilin seçim
   bölgelerinden birini seçtiren ayrı bir ekran açılır, diğer iller
   doğrudan oylama ekranına yönlendirir.
2. **Oylama** (`/oylama/:bolge`) → bu sayfa giriş gerektirir. Giriş
   yapılmamışsa kullanıcı `/giris` sayfasına yönlendirilir; başarılı
   girişten sonra otomatik olarak kaldığı oylama ekranına geri döner.
   - Sol tarafta parti seçip oy kullanma formu (kullanıcı başına bir oy).
   - Sağ tarafta o bölgede o ana kadar kullanılan oylara göre **anlık
     sonuç tablosu**: her partinin oy yüzdesi ve D'Hondt yöntemiyle
     hesaplanan güncel milletvekili projeksiyonu. Tablo 5 saniyede bir
     kendiliğinden yenilenir.
3. **Kayıt ol** (`/kayit`) → e-posta + şifre girilir, 6 haneli kod e-postaya gönderilir.
4. **Doğrula** (`/dogrula`) → kod girilir, hesap aktifleşir.
5. **Giriş yap** (`/giris`) → token alınır, tarayıcıda saklanır.

## Parti listesi

Oylama ve sonuç tablosunda kullanılan partiler:
AK Parti, CHP, MHP, İYİ Parti, DEM Parti, Anahtar Parti, Zafer Partisi,
TİP, Yeniden Refah Partisi, Saadet Partisi.

Bu liste `backend/partiler.py` (doğrulama ve sandalye hesabı için) ve
`frontend/src/data/partiler.js` (arayüz + renkler için) dosyalarında
tutuluyor — ikisi aynı isimleri kullanmalı. Yeni parti eklemek/çıkarmak
isterseniz her iki dosyayı da güncelleyin.

Sandalye hesabı `backend/dhondt.py` içindeki D'Hondt fonksiyonuyla
yapılıyor (Türkiye'de gerçek seçimlerde kullanılan yöntemin aynısı).

## Önemli güvenlik notu

`backend/.env` dosyasına gerçek Gmail uygulama şifrenizi yazdım, ancak bu
dosyayı **asla** bir git deposuna veya herkese açık bir yere yüklemeyin:

- `backend/.gitignore` zaten `.env` dosyasını hariç tutuyor — kontrol edin.
- Gerçek bir web sitesine geçerken bu değerleri sunucunuzun ortam
  değişkenleri (environment variables) üzerinden verin, koda gömmeyin.
- Bu şifre paylaştığınız mesajda açık metin olarak görünüyor; isterseniz
  Google hesap ayarlarından bu uygulama şifresini iptal edip yenisini
  oluşturmanızı öneririm.
- Gmail SMTP, küçük ölçekli test/yerel kullanım için uygundur; gerçek
  siteye geçtiğinizde ve gönderim hacmi artınca (binlerce kullanıcı)
  Gmail'in günlük gönderim limitlerine takılabilirsiniz — o noktada
  SendGrid, Resend veya Amazon SES gibi bir e-posta servisine geçmeyi
  düşünebilirsiniz.

## Bölgeli iller (Ankara, İstanbul, İzmir)

Nüfusu fazla olan iller birden fazla seçim bölgesine ayrılır (YSK kuralı:
36+ vekil çıkaran iller 3 bölgeye, 19-35 arası vekil çıkaranlar 2 bölgeye
bölünür). Şu an sistemde tanımlı bölgeli iller:

- **Ankara** → 3 bölge (13 / 11 / 12 vekil)
- **İstanbul** → 3 bölge (35 / 27 / 36 vekil)
- **İzmir** → 2 bölge (14 / 14 vekil)

Bu liste `backend/vekil_sayilari.py` ve `frontend/src/data/vekilSayilari.js`
içindeki `BOLGELI_ILLER` nesnesinde tutuluyor — ikisi birbirinin aynısı
olmalı. Haritada bu illerden birine tıklanınca otomatik olarak bölge seçim
ekranı açılır; yeni bir bölgeli il eklemek isterseniz her iki dosyadaki
`BOLGELI_ILLER` ve `VEKIL_SAYILARI`'a ilgili bölge girişlerini eklemeniz
yeterli, kod tarafında başka bir değişiklik gerekmez.

**Not — İstanbul sayısı düzeltildi:** Gönderdiğiniz haritadaki ve YSK'nin
2023 resmî dağılımındaki rakamlar İstanbul için 35 + 27 + 36 = **98**
vekil gösteriyor; ilk taslaktaki tek "İstanbul: 96" değerini bu üçe böldüm.

**Not — Bursa da bölgeli:** Araştırırken fark ettim, Bursa da (20 vekil,
1. Bölge: 10 / 2. Bölge: 10) aynı kurala göre 2 bölgeye ayrılıyor, fakat
siz mesajınızda sadece Ankara/İstanbul/İzmir'i belirttiğiniz için şimdilik
eklemedim. İsterseniz aynı mantıkla Bursa'yı da `BOLGELI_ILLER`'a
ekleyebiliriz.

## Bilinen sınırlamalar / sırada ne var

- Harita, GeoJSON il sınırlarını her seferinde GitHub'dan canlı çekiyor
  (orijinal dosyanızdaki gibi). Kendi sunucunuzda barındırmak isterseniz
  dosyayı indirip `frontend/public/` altına koyup `TurkiyeHaritasi.jsx`
  içindeki `GEOJSON_URL`'i güncelleyin.
- GeoJSON'daki il isimleri ile `VEKIL_SAYILARI` anahtarları birebir
  uyuşmayabilir (ör. "Afyon" / "Afyonkarahisar"). Tarayıcı konsolunda
  "Eşleşmeyen il adı" uyarısı görürseniz `src/data/vekilSayilari.js`
  içindeki `TAKMA_ADLAR` listesine ekleyin.
- `/api/sonuclar/<bolge>` uç noktası girişsiz herkese açık (kimlik
  belirten bir veri içermediği için kasıtlı olarak böyle bıraktım); sadece
  oy kullanma uç noktası giriş gerektiriyor.
- Oturumlar (session token) basit bir SQLite tablosunda tutuluyor; "şifremi
  unuttum", oturum süresi sona erme, KVKK/aydınlatma metni gibi konular
  henüz eklenmedi — istediğiniz zaman söyleyin, birlikte ekleriz.
