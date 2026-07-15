# Seçim Anket Sistemi

React (frontend) + Flask (backend) ile yapılmış, e-posta doğrulamalı kayıt
sistemi ve Türkiye il haritası üzerinden seçim bölgesi seçimi içeren bir
anket/oylama uygulaması. Sonuçlar WebSocket üzerinden **anlık** olarak tüm
kullanıcılara yayınlanır.

## Klasör yapısı

```
secim-anket-sistemi/
├── backend/        Flask API (kayıt, e-posta doğrulama, giriş, şifre
│                    sıfırlama, oylama, WebSocket yayını) + PostgreSQL
└── frontend/        React arayüzü (harita, formlar, oylama ekranı,
                     ulusal sonuç paneli)
```

## Kurulum — Backend

Backend artık **PostgreSQL** kullanıyor (eskiden SQLite'tı). Önce yerel bir
PostgreSQL sunucusu çalışıyor olmalı ve `secim_anket` adında bir veritabanı
oluşturulmuş olmalı:

```bash
createdb secim_anket   # ya da psql içinden: CREATE DATABASE secim_anket;
```

Sonra:

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Uygulama başlarken tabloları (`kullanicilar`, `oturumlar`,
`bekleyen_dogrulamalar`, `sifre_sifirlama`, `oylar`) kendiliğinden oluşturur
(`init_db()`), o yüzden elle migrasyon çalıştırmanıza gerek yok. Sunucu
`http://localhost:5000` adresinde, hem normal HTTP hem de WebSocket
(Flask-SocketIO + eventlet) trafiğini aynı porttan karşılar.

`.env` dosyasında iki grup ayar var — `backend/.env.example` içinde şablonu
bulabilirsiniz:

- E-posta: `SISTEM_MAIL`, `SISTEM_SIFRE` (Gmail uygulama şifresi) —
  doğrulama ve şifre sıfırlama kodları bu hesaptan gönderilir.
- Veritabanı: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.

## Kurulum — Frontend

```bash
cd frontend
npm install
npm run dev
```

Arayüz `http://localhost:5173` adresinde açılır. API istekleri ve WebSocket
bağlantısı `http://localhost:5000` adresine yapılır (bkz. `src/api.js` ve
`src/socket.js`; `VITE_API_URL` ortam değişkeniyle değiştirilebilir).

## Akış

1. **Harita** (`/`) → giriş yapmadan herkes görüntüleyebilir.
   - Bir ile fare ile gelince (hover) o ilde/bölgede o ana kadar kullanılan
     oylara göre bir **tooltip** açılır: toplam oy, en çok oy alan ilk 3
     parti ve yüzdeleri (`/api/il-sonuclari/<il>`).
   - **Ankara, İstanbul, İzmir veya Bursa**'ya tıklanınca ilçenizi
     seçtiren bir ekran açılır (arama kutulu); seçilen ilçeye göre oy
     kullanacağınız seçim bölgesi otomatik belirlenir. Diğer iller
     doğrudan oylama ekranına yönlendirir.
   - Sağda katlanabilir **"Türkiye Geneli"** paneli, tüm ülkedeki toplam oy
     ve parti bazlı sandalye dağılımını (600 üzerinden) canlı gösterir.
   - Harita GeoJSON'u artık `frontend/public/turkiye-iller.json` içinden
     yerelden yüklenir (eskiden GitHub'dan canlı çekiliyordu).
2. **Oylama** (`/oylama/:bolge?ilce=...`) → bu sayfa giriş gerektirir.
   Giriş yapılmamışsa kullanıcı `/giris` sayfasına yönlendirilir; başarılı
   girişten sonra otomatik olarak kaldığı oylama ekranına geri döner.
   - Sol tarafta parti seçip oy kullanma formu (kullanıcı başına bir oy).
     Kullanıcı daha önce oy kullanmışsa formun yerine kullandığı oy
     gösterilir.
   - Sağ tarafta o bölgede o ana kadar kullanılan oylara göre **anlık
     sonuç tablosu**: her partinin oy yüzdesi ve D'Hondt yöntemiyle
     hesaplanan güncel milletvekili projeksiyonu. Tablo periyodik olarak
     değil, **WebSocket** üzerinden (`oy_guncellendi` / `ulusal_guncellendi`
     olayları) birisi oy kullandığı anda kendiliğinden güncellenir.
3. **Kayıt ol** (`/kayit`) → e-posta + şifre girilir, 6 haneli kod e-postaya gönderilir.
4. **Doğrula** (`/dogrula`) → kod girilir, hesap aktifleşir.
5. **Giriş yap** (`/giris`) → token alınır, tarayıcıda saklanır; oturum
   token'ı **24 saat** geçerlidir.
6. **Şifremi unuttum** (`/sifre-sifirla`) → e-posta girilir, 6 haneli kod
   gönderilir; kod + yeni şifre ile hesap şifresi güncellenir (tüm mevcut
   oturumlar bu işlemde geçersiz kılınır).

## Parti listesi

Oylama ve sonuç tablosunda kullanılan partiler:
AK Parti, CHP, MHP, İYİ Parti, DEM Parti, Anahtar Parti, Zafer Partisi,
TİP, Yeniden Refah Partisi, Saadet Partisi, BBP.

Bu liste `backend/partiler.py` (doğrulama ve sandalye hesabı için) ve
`frontend/src/data/partiler.js` (arayüz + renkler için) dosyalarında
tutuluyor — ikisi aynı isimleri kullanmalı. Yeni parti eklemek/çıkarmak
isterseniz her iki dosyayı da güncelleyin.

Sandalye hesabı `backend/dhondt.py` içindeki D'Hondt fonksiyonuyla
yapılıyor (Türkiye'de gerçek seçimlerde kullanılan yöntemin aynısı).

## Önemli güvenlik notu

`backend/.env` dosyasına gerçek Gmail uygulama şifresi ve PostgreSQL
bağlantı bilgileri yazılıyor, bu dosyayı **asla** bir git deposuna veya
herkese açık bir yere yüklemeyin:

- `backend/.gitignore` zaten `.env` dosyasını hariç tutuyor — kontrol edin.
- Gerçek bir web sitesine geçerken bu değerleri sunucunuzun ortam
  değişkenleri (environment variables) üzerinden verin, koda gömmeyin.
- Bu şifre paylaştığınız mesajda açık metin olarak görünüyorsa, isterseniz
  Google hesap ayarlarından bu uygulama şifresini iptal edip yenisini
  oluşturmanızı öneririm.
- Gmail SMTP, küçük ölçekli test/yerel kullanım için uygundur; gerçek
  siteye geçtiğinizde ve gönderim hacmi artınca (binlerce kullanıcı)
  Gmail'in günlük gönderim limitlerine takılabilirsiniz — o noktada
  SendGrid, Resend veya Amazon SES gibi bir e-posta servisine geçmeyi
  düşünebilirsiniz.
- `SECRET_KEY` ortam değişkeni verilmezse her başlatmada rastgele
  üretilir; bu, sunucu her yeniden başladığında oturum imzalarının
  geçersiz kalacağı anlamına gelmez (token'lar veritabanında saklanıyor,
  imza olarak kullanılmıyor) ama üretimde sabit bir `SECRET_KEY`
  tanımlamanız yine de önerilir.

## Bölgeli iller (Ankara, İstanbul, İzmir, Bursa)

Nüfusu fazla olan iller birden fazla seçim bölgesine ayrılır (YSK kuralı:
36+ vekil çıkaran iller 3 bölgeye, 19-35 arası vekil çıkaranlar 2 bölgeye
bölünür). Şu an sistemde tanımlı bölgeli iller:

- **Ankara** → 3 bölge (13 / 11 / 12 vekil)
- **İstanbul** → 3 bölge (35 / 27 / 34 vekil = 96 toplam)
- **İzmir** → 2 bölge (14 / 14 vekil)
- **Bursa** → 2 bölge (10 / 11 vekil)

Bu iller için artık sadece bölge seçtirilmiyor, **ilçe bazlı** bir eşleştirme
var: `backend/ilce_bolge.py` içindeki `ILCE_BOLGE` sözlüğü her ilçeyi YSK'nin
resmî bölge kararına göre doğru seçim bölgesine eşler
(`frontend/src/data/vekilSayilari.js` içinde aynı isimle tekrarlanır).
Haritada bu illerden birine tıklanınca ilçe arama ekranı açılır, ilçe
seçilince bölge otomatik hesaplanır — `backend/app.py`'deki `/api/oy-kullan`
uç noktası da `ilce` gönderilirse `ILCE_BOLGE` üzerinden bölgeyi kendisi
çözer.

Genel `VEKIL_SAYILARI` / `BOLGELI_ILLER` listesi hâlâ
`backend/vekil_sayilari.py` ve `frontend/src/data/vekilSayilari.js`
içinde tutuluyor — ikisi birbirinin aynısı olmalı. Yeni bir bölgeli il
eklemek isterseniz her iki dosyadaki `BOLGELI_ILLER` / `VEKIL_SAYILARI`'a
bölge girişlerini, `ilce_bolge.py` ve `vekilSayilari.js` içine de
ilçe → bölge eşlemelerini eklemeniz gerekir.

## API uç noktaları (özet)

| Uç nokta | Yöntem | Giriş gerekir mi | Açıklama |
| --- | --- | --- | --- |
| `/api/kayit` | POST | Hayır | E-posta + şifre, doğrulama kodu gönderir |
| `/api/dogrula` | POST | Hayır | Kod doğrular, hesabı aktifleştirir |
| `/api/giris` | POST | Hayır | Token döner (24 saat geçerli) |
| `/api/sifre-sifirla-iste` | POST | Hayır | Şifre sıfırlama kodu gönderir |
| `/api/sifre-sifirla` | POST | Hayır | Kod + yeni şifre ile şifreyi günceller |
| `/api/vekil-sayilari` | GET | Hayır | Bölge/ilçe/parti sabitlerini döner |
| `/api/oy-durumu` | GET | Evet | Kullanıcının oy kullanıp kullanmadığını döner |
| `/api/oy-kullan` | POST | Evet | Oyu kaydeder, WebSocket ile yayınlar |
| `/api/sonuclar/<bolge>` | GET | Hayır | Bölge bazlı anlık sonuç + D'Hondt projeksiyonu |
| `/api/il-sonuclari/<il>` | GET | Hayır | İl bazlı (bölgeleri toplayan) anlık sonuç |
| `/api/ulusal-sonuclar` | GET | Hayır | Türkiye geneli toplam oy + sandalye dağılımı |

WebSocket olayları (Socket.IO): `oy_guncellendi` (`{bolge}` ile birlikte,
ilgili bölgenin sonuç tablosunu tetikler) ve `ulusal_guncellendi` (ulusal
paneli tetikler) — her oy kullanımında ikisi de yayınlanır.

## Bilinen sınırlamalar / sırada ne var

- GeoJSON'daki il isimleri ile `VEKIL_SAYILARI` anahtarları birebir
  uyuşmayabilir (ör. "Afyon" / "Afyonkarahisar"). Tarayıcı konsolunda
  "eşleştirilemedi" uyarısı görürseniz `src/data/vekilSayilari.js`
  içindeki `TAKMA_ADLAR` listesine ekleyin.
- `TurkiyeHaritasi.jsx` içinde hover olayında bırakılmış bir
  `console.log("hover:", eslesen)` satırı var; zararsız ama üretime
  geçmeden temizlenmesi iyi olur.
- `/api/sonuclar/<bolge>`, `/api/il-sonuclari/<il>` ve
  `/api/ulusal-sonuclar` uç noktaları girişsiz herkese açık (kimlik
  belirten bir veri içermediği için kasıtlı olarak böyle bırakıldı);
  sadece oy kullanma ve oy durumu uç noktaları giriş gerektiriyor.
- KVKK/aydınlatma metni, e-posta değiştirme, hesap silme gibi konular
  henüz eklenmedi — istediğiniz zaman söyleyin, birlikte ekleriz.
