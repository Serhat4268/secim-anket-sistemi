"""
Seçim Anket Sistemi - Backend (Flask + PostgreSQL + WebSocket)
Yenilikler: oturum süresi (24 saat), şifre sıfırlama
"""

import os, re, random, smtplib, secrets
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from collections import defaultdict

import psycopg2
import psycopg2.pool
import psycopg2.extras
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from vekil_sayilari import VEKIL_SAYILARI, BOLGELI_ILLER
from partiler import PARTI_LISTESI
from dhondt import dhondt_dagit
from ilce_bolge import ILCE_BOLGE, ILCELI_ILLER

load_dotenv()

SISTEM_MAIL  = os.environ.get("SISTEM_MAIL")
SISTEM_SIFRE = os.environ.get("SISTEM_SIFRE")
KOD_GECERLILIK_DAKIKA = 10
TOKEN_GECERLILIK_SAAT = 24

DB_CONFIG = {
    "host":     os.environ.get("DB_HOST", "localhost"),
    "port":     int(os.environ.get("DB_PORT", 5432)),
    "dbname":   os.environ.get("DB_NAME", "secim_anket"),
    "user":     os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASS", "postgres"),
}

if not SISTEM_MAIL or not SISTEM_SIFRE:
    raise RuntimeError("SISTEM_MAIL / SISTEM_SIFRE .env dosyasında bulunamadı.")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", secrets.token_hex(32))
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(minconn=1, maxconn=10, **DB_CONFIG)
    return _pool

def get_db():
    if "db" not in g:
        g.db = get_pool().getconn()
        g.db.autocommit = False
    return g.db

@app.teardown_appcontext
def close_db(exc=None):
    db = g.pop("db", None)
    if db:
        db.rollback() if exc else db.commit()
        get_pool().putconn(db)

def cursor():
    return get_db().cursor(cursor_factory=psycopg2.extras.RealDictCursor)

SCHEMA = """
CREATE TABLE IF NOT EXISTS kullanicilar (
    id                 SERIAL PRIMARY KEY,
    email              TEXT UNIQUE NOT NULL,
    sifre_hash         TEXT NOT NULL,
    olusturulma_tarihi TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bekleyen_dogrulamalar (
    email            TEXT PRIMARY KEY,
    sifre_hash       TEXT NOT NULL,
    kod              TEXT NOT NULL,
    son_gecerlilik   TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS oturumlar (
    token              TEXT PRIMARY KEY,
    kullanici_id       INTEGER NOT NULL REFERENCES kullanicilar(id),
    olusturulma_tarihi TIMESTAMPTZ DEFAULT NOW(),
    son_gecerlilik     TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS oylar (
    id               SERIAL PRIMARY KEY,
    kullanici_id     INTEGER UNIQUE NOT NULL REFERENCES kullanicilar(id),
    bolge            TEXT NOT NULL,
    ilce             TEXT,
    secim            TEXT NOT NULL,
    oy_tarihi        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sifre_sifirlama (
    email            TEXT PRIMARY KEY,
    kod              TEXT NOT NULL,
    son_gecerlilik   TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oylar_bolge ON oylar(bolge);
CREATE INDEX IF NOT EXISTS idx_oylar_secim ON oylar(secim);
"""

def init_db():
    conn = psycopg2.connect(**DB_CONFIG)
    with conn.cursor() as c:
        c.execute(SCHEMA)
        # Eski kurulumda son_gecerlilik kolonu yoksa ekle
        c.execute("""
            ALTER TABLE oturumlar
            ADD COLUMN IF NOT EXISTS son_gecerlilik TIMESTAMPTZ
            DEFAULT (NOW() + INTERVAL '24 hours')
        """)
    conn.commit()
    conn.close()
    print("Veritabanı şeması hazır.")

def mail_gonder(alici, konu, icerik):
    msg = MIMEText(icerik)
    msg["Subject"] = konu
    msg["From"]    = SISTEM_MAIL
    msg["To"]      = alici
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(SISTEM_MAIL, SISTEM_SIFRE)
        s.sendmail(SISTEM_MAIL, [alici], msg.as_string())

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def token_dogrula():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return None
    tok = auth.split(" ", 1)[1].strip()
    with cursor() as c:
        c.execute(
            "SELECT k.id, k.email FROM oturumlar o "
            "JOIN kullanicilar k ON k.id = o.kullanici_id "
            "WHERE o.token = %s AND o.son_gecerlilik > NOW()",
            (tok,)
        )
        row = c.fetchone()
    return dict(row) if row else None

@app.route("/api/kayit", methods=["POST"])
def kayit():
    v     = request.get_json(silent=True) or {}
    email = (v.get("email") or "").strip().lower()
    sifre = v.get("sifre") or ""
    if not EMAIL_RE.match(email):
        return jsonify({"basarili": False, "mesaj": "Geçerli e-posta girin."}), 400
    if len(sifre) < 6:
        return jsonify({"basarili": False, "mesaj": "Şifre en az 6 karakter olmalı."}), 400
    with cursor() as c:
        c.execute("SELECT id FROM kullanicilar WHERE email = %s", (email,))
        if c.fetchone():
            return jsonify({"basarili": False, "mesaj": "Bu e-posta zaten kayıtlı."}), 409
        kod = f"{random.randint(0, 999999):06d}"
        son = datetime.utcnow() + timedelta(minutes=KOD_GECERLILIK_DAKIKA)
        c.execute("""
            INSERT INTO bekleyen_dogrulamalar(email, sifre_hash, kod, son_gecerlilik)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT(email) DO UPDATE SET
                sifre_hash=EXCLUDED.sifre_hash,
                kod=EXCLUDED.kod,
                son_gecerlilik=EXCLUDED.son_gecerlilik
        """, (email, generate_password_hash(sifre), kod, son))
    try:
        mail_gonder(email, "Doğrulama Kodunuz",
            f"Kayıt doğrulama kodunuz: {kod}\n\nBu kod {KOD_GECERLILIK_DAKIKA} dakika geçerlidir.")
    except Exception as e:
        return jsonify({"basarili": False, "mesaj": f"E-posta gönderilemedi: {e}"}), 500
    return jsonify({"basarili": True, "mesaj": "Doğrulama kodu e-postanıza gönderildi."})

@app.route("/api/dogrula", methods=["POST"])
def dogrula():
    v     = request.get_json(silent=True) or {}
    email = (v.get("email") or "").strip().lower()
    kod   = (v.get("kod")   or "").strip()
    with cursor() as c:
        c.execute("SELECT * FROM bekleyen_dogrulamalar WHERE email = %s", (email,))
        row = c.fetchone()
        if not row:
            return jsonify({"basarili": False, "mesaj": "Bekleyen doğrulama yok."}), 404
        if datetime.utcnow() > row["son_gecerlilik"].replace(tzinfo=None):
            c.execute("DELETE FROM bekleyen_dogrulamalar WHERE email = %s", (email,))
            return jsonify({"basarili": False, "mesaj": "Kodun süresi doldu."}), 410
        if kod != row["kod"]:
            return jsonify({"basarili": False, "mesaj": "Kod hatalı."}), 400
        c.execute("INSERT INTO kullanicilar(email, sifre_hash) VALUES (%s, %s)",
                  (email, row["sifre_hash"]))
        c.execute("DELETE FROM bekleyen_dogrulamalar WHERE email = %s", (email,))
    return jsonify({"basarili": True, "mesaj": "Hesabınız doğrulandı."})

@app.route("/api/giris", methods=["POST"])
def giris():
    v     = request.get_json(silent=True) or {}
    email = (v.get("email") or "").strip().lower()
    sifre = v.get("sifre") or ""
    with cursor() as c:
        c.execute("SELECT * FROM kullanicilar WHERE email = %s", (email,))
        k = c.fetchone()
        if not k or not check_password_hash(k["sifre_hash"], sifre):
            return jsonify({"basarili": False, "mesaj": "E-posta veya şifre hatalı."}), 401
        tok = secrets.token_hex(32)
        son = datetime.utcnow() + timedelta(hours=TOKEN_GECERLILIK_SAAT)
        c.execute("INSERT INTO oturumlar(token, kullanici_id, son_gecerlilik) VALUES (%s, %s, %s)",
                  (tok, k["id"], son))
    return jsonify({"basarili": True, "token": tok, "email": k["email"]})

@app.route("/api/sifre-sifirla-iste", methods=["POST"])
def sifre_sifirla_iste():
    v     = request.get_json(silent=True) or {}
    email = (v.get("email") or "").strip().lower()
    with cursor() as c:
        c.execute("SELECT id FROM kullanicilar WHERE email = %s", (email,))
        if not c.fetchone():
            return jsonify({"basarili": True, "mesaj": "Kod gönderildi (kayıtlıysa)."})
        kod = f"{random.randint(0, 999999):06d}"
        son = datetime.utcnow() + timedelta(minutes=KOD_GECERLILIK_DAKIKA)
        c.execute("""
            INSERT INTO sifre_sifirlama(email, kod, son_gecerlilik)
            VALUES (%s, %s, %s)
            ON CONFLICT(email) DO UPDATE SET
                kod=EXCLUDED.kod, son_gecerlilik=EXCLUDED.son_gecerlilik
        """, (email, kod, son))
    try:
        mail_gonder(email, "Şifre Sıfırlama Kodunuz",
            f"Şifre sıfırlama kodunuz: {kod}\n\nBu kod {KOD_GECERLILIK_DAKIKA} dakika geçerlidir.\n"
            f"Bu işlemi siz başlatmadıysanız bu e-postayı yok sayın.")
    except Exception as e:
        return jsonify({"basarili": False, "mesaj": f"E-posta gönderilemedi: {e}"}), 500
    return jsonify({"basarili": True, "mesaj": "Kod e-postanıza gönderildi."})

@app.route("/api/sifre-sifirla", methods=["POST"])
def sifre_sifirla():
    v          = request.get_json(silent=True) or {}
    email      = (v.get("email")      or "").strip().lower()
    kod        = (v.get("kod")        or "").strip()
    yeni_sifre =  v.get("yeni_sifre") or ""
    if len(yeni_sifre) < 6:
        return jsonify({"basarili": False, "mesaj": "Şifre en az 6 karakter olmalı."}), 400
    with cursor() as c:
        c.execute("SELECT * FROM sifre_sifirlama WHERE email = %s", (email,))
        row = c.fetchone()
        if not row:
            return jsonify({"basarili": False, "mesaj": "Önce kod isteyin."}), 404
        if datetime.utcnow() > row["son_gecerlilik"].replace(tzinfo=None):
            c.execute("DELETE FROM sifre_sifirlama WHERE email = %s", (email,))
            return jsonify({"basarili": False, "mesaj": "Kodun süresi doldu."}), 410
        if kod != row["kod"]:
            return jsonify({"basarili": False, "mesaj": "Kod hatalı."}), 400
        c.execute("UPDATE kullanicilar SET sifre_hash = %s WHERE email = %s",
                  (generate_password_hash(yeni_sifre), email))
        c.execute("DELETE FROM sifre_sifirlama WHERE email = %s", (email,))
        c.execute("DELETE FROM oturumlar WHERE kullanici_id = "
                  "(SELECT id FROM kullanicilar WHERE email = %s)", (email,))
    return jsonify({"basarili": True, "mesaj": "Şifreniz güncellendi. Giriş yapabilirsiniz."})

@app.route("/api/vekil-sayilari")
def vekil_sayilari_ep():
    return jsonify({
        "vekil_sayilari": VEKIL_SAYILARI,
        "bolgeli_iller":  BOLGELI_ILLER,
        "ilce_bolge":     ILCE_BOLGE,
        "ilceli_iller":   ILCELI_ILLER,
        "partiler":       PARTI_LISTESI,
    })

@app.route("/api/oy-durumu")
def oy_durumu():
    k = token_dogrula()
    if not k:
        return jsonify({"basarili": False, "mesaj": "Giriş yapmalısınız."}), 401
    with cursor() as c:
        c.execute("SELECT bolge, ilce, secim FROM oylar WHERE kullanici_id = %s", (k["id"],))
        oy = c.fetchone()
    return jsonify({"basarili": True, "oy_kullandi": bool(oy), "oy": dict(oy) if oy else None})

@app.route("/api/oy-kullan", methods=["POST"])
def oy_kullan():
    k = token_dogrula()
    if not k:
        return jsonify({"basarili": False, "mesaj": "Giriş yapmalısınız."}), 401
    v     = request.get_json(silent=True) or {}
    ilce  = (v.get("ilce")  or "").strip()
    bolge = (v.get("bolge") or "").strip()
    if ilce:
        cozulen = ILCE_BOLGE.get(ilce)
        if not cozulen:
            return jsonify({"basarili": False, "mesaj": f"'{ilce}' ilçesi tanımlanamadı."}), 400
        bolge = cozulen
    if bolge not in VEKIL_SAYILARI:
        return jsonify({"basarili": False, "mesaj": "Geçersiz seçim bölgesi."}), 400
    secim = v.get("secim") or ""
    if secim not in PARTI_LISTESI:
        return jsonify({"basarili": False, "mesaj": "Geçersiz parti."}), 400
    with cursor() as c:
        c.execute("SELECT id FROM oylar WHERE kullanici_id = %s", (k["id"],))
        if c.fetchone():
            return jsonify({"basarili": False, "mesaj": "Zaten oy kullandınız."}), 409
        c.execute("INSERT INTO oylar(kullanici_id, bolge, ilce, secim) VALUES (%s,%s,%s,%s)",
                  (k["id"], bolge, ilce or None, secim))
    socketio.emit("oy_guncellendi",    {"bolge": bolge})
    socketio.emit("ulusal_guncellendi", {})
    return jsonify({"basarili": True, "mesaj": "Oyunuz kaydedildi."})

def _sonuc_hesapla(rows, vekil_sayisi):
    oy_sayilari = {p: 0 for p in PARTI_LISTESI}
    for r in rows:
        if r["secim"] in oy_sayilari:
            oy_sayilari[r["secim"]] = r["adet"]
    toplam    = sum(oy_sayilari.values())
    koltuklar = dhondt_dagit(oy_sayilari, vekil_sayisi)
    liste = []
    for p in PARTI_LISTESI:
        oy = oy_sayilari[p]
        liste.append({"parti": p, "oy": oy,
                      "yuzde": round(oy/toplam*100, 1) if toplam else 0,
                      "koltuk": koltuklar.get(p, 0)})
    liste.sort(key=lambda x: (-x["koltuk"], -x["oy"]))
    return toplam, liste

@app.route("/api/sonuclar/<bolge>")
def sonuclar(bolge):
    if bolge not in VEKIL_SAYILARI:
        return jsonify({"basarili": False, "mesaj": "Geçersiz bölge."}), 404
    with cursor() as c:
        c.execute("SELECT secim, COUNT(*) AS adet FROM oylar WHERE bolge=%s GROUP BY secim", (bolge,))
        rows = c.fetchall()
    toplam, liste = _sonuc_hesapla(rows, VEKIL_SAYILARI[bolge])
    return jsonify({"basarili": True, "bolge": bolge,
                    "vekil_sayisi": VEKIL_SAYILARI[bolge],
                    "toplam_oy": toplam, "sonuclar": liste})

@app.route("/api/ulusal-sonuclar")
def ulusal_sonuclar():
    with cursor() as c:
        c.execute("SELECT bolge, secim, COUNT(*) AS adet FROM oylar GROUP BY bolge, secim")
        rows = c.fetchall()
    bolge_oylar = defaultdict(list)
    for r in rows:
        bolge_oylar[r["bolge"]].append(r)
    parti_koltuk = {p: 0 for p in PARTI_LISTESI}
    parti_oy     = {p: 0 for p in PARTI_LISTESI}
    toplam_oy    = 0
    for bolge, bolge_rows in bolge_oylar.items():
        if bolge not in VEKIL_SAYILARI: continue
        t, liste = _sonuc_hesapla(bolge_rows, VEKIL_SAYILARI[bolge])
        toplam_oy += t
        for item in liste:
            parti_koltuk[item["parti"]] += item["koltuk"]
            parti_oy[item["parti"]]     += item["oy"]
    sonuc = []
    for p in PARTI_LISTESI:
        oy = parti_oy[p]
        sonuc.append({"parti": p, "oy": oy,
                      "yuzde": round(oy/toplam_oy*100, 1) if toplam_oy else 0,
                      "koltuk": parti_koltuk[p]})
    sonuc.sort(key=lambda x: (-x["koltuk"], -x["oy"]))
    return jsonify({"basarili": True, "toplam_oy": toplam_oy, "sonuclar": sonuc})

@socketio.on("connect")
def on_connect(): pass

@socketio.on("disconnect")
def on_disconnect(): pass
@app.route("/api/il-sonuclari/<il>")
def il_sonuclari(il):
    from vekil_sayilari import BOLGELI_ILLER
    # Bölgeli il mi kontrol et
    if il in BOLGELI_ILLER:
        bolgeler = BOLGELI_ILLER[il]
    elif il in VEKIL_SAYILARI:
        bolgeler = [il]
    else:
        return jsonify({"basarili": False, "mesaj": "Geçersiz il."}), 404

    with cursor() as c:
        c.execute(
            "SELECT secim, COUNT(*) AS adet FROM oylar "
            "WHERE bolge = ANY(%s) GROUP BY secim",
            (bolgeler,)
        )
        rows = c.fetchall()

    toplam_vekil = sum(VEKIL_SAYILARI[b] for b in bolgeler)
    toplam, liste = _sonuc_hesapla(rows, toplam_vekil)
    return jsonify({"basarili": True, "il": il,
                    "toplam_oy": toplam, "sonuclar": liste})

if __name__ == "__main__":
    init_db()
    socketio.run(app, debug=True, port=5000)