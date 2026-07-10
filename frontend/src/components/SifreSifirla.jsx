import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api.js";

async function istek(yol, body) {
  const res = await fetch(`${API_URL}${yol}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const veri = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(veri.mesaj || "Hata oluştu.");
  return veri;
}

export default function SifreSifirla() {
  const [adim,       setAdim]       = useState(1); // 1: e-posta, 2: kod + yeni şifre
  const [email,      setEmail]      = useState("");
  const [kod,        setKod]        = useState("");
  const [yeniSifre,  setYeniSifre]  = useState("");
  const [tekrar,     setTekrar]     = useState("");
  const [hata,       setHata]       = useState("");
  const [basari,     setBasari]     = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kodeIste(e) {
    e.preventDefault();
    setHata(""); setYukleniyor(true);
    try {
      await istek("/api/sifre-sifirla-iste", { email });
      setBasari("Kod e-postanıza gönderildi.");
      setAdim(2);
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  }

  async function sifreDegistir(e) {
    e.preventDefault();
    setHata("");
    if (yeniSifre !== tekrar) { setHata("Şifreler eşleşmiyor."); return; }
    if (yeniSifre.length < 6) { setHata("Şifre en az 6 karakter olmalı."); return; }
    setYukleniyor(true);
    try {
      await istek("/api/sifre-sifirla", { email, kod, yeni_sifre: yeniSifre });
      setBasari("Şifreniz güncellendi. Giriş yapabilirsiniz.");
      setAdim(3);
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="sayfa">
      <h1 className="sayfa-baslik">Şifremi Unuttum</h1>
      <p className="sayfa-aciklama">
        {adim === 1 && "Kayıtlı e-posta adresinizi girin, şifre sıfırlama kodu gönderelim."}
        {adim === 2 && `${email} adresine gönderilen kodu ve yeni şifrenizi girin.`}
        {adim === 3 && "İşlem tamamlandı."}
      </p>

      {adim === 1 && (
        <form className="kart" onSubmit={kodeIste}>
          <div className="muhur">✉</div>
          {hata   && <div className="hata-mesaji">{hata}</div>}
          {basari && <div className="basari-mesaji">{basari}</div>}
          <div className="alan">
            <label>E-posta</label>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className="ana-dugme" type="submit" disabled={yukleniyor}>
            {yukleniyor ? "Gönderiliyor…" : "Kod gönder"}
          </button>
          <Link to="/giris" className="ikincil-link">Giriş sayfasına dön</Link>
        </form>
      )}

      {adim === 2 && (
        <form className="kart" onSubmit={sifreDegistir}>
          <div className="muhur">#</div>
          {hata   && <div className="hata-mesaji">{hata}</div>}
          {basari && <div className="basari-mesaji">{basari}</div>}
          <div className="alan">
            <label>Doğrulama kodu</label>
            <input className="kod-girisi" inputMode="numeric" maxLength={6}
              value={kod} onChange={e => setKod(e.target.value.replace(/\D/g, ""))}
              placeholder="000000" required />
          </div>
          <div className="alan">
            <label>Yeni şifre</label>
            <input type="password" value={yeniSifre}
              onChange={e => setYeniSifre(e.target.value)}
              placeholder="En az 6 karakter" required />
          </div>
          <div className="alan">
            <label>Yeni şifre (tekrar)</label>
            <input type="password" value={tekrar}
              onChange={e => setTekrar(e.target.value)} required />
          </div>
          <button className="ana-dugme" type="submit" disabled={yukleniyor}>
            {yukleniyor ? "Güncelleniyor…" : "Şifremi güncelle"}
          </button>
          <button type="button" className="ikincil-link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => { setAdim(1); setHata(""); setBasari(""); }}>
            Farklı e-posta dene
          </button>
        </form>
      )}

      {adim === 3 && (
        <div className="kart" style={{ textAlign: "center" }}>
          <div className="muhur">✓</div>
          <div className="basari-mesaji">{basari}</div>
          <Link to="/giris" className="ana-dugme"
            style={{ display: "block", textDecoration: "none", textAlign: "center", marginTop: 8 }}>
            Giriş yap
          </Link>
        </div>
      )}
    </main>
  );
}
