import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

export default function Kayit() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const navigate = useNavigate();

  async function gonder(e) {
    e.preventDefault();
    setHata("");

    if (sifre !== sifreTekrar) {
      setHata("Şifreler eşleşmiyor.");
      return;
    }
    if (sifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalı.");
      return;
    }

    setYukleniyor(true);
    try {
      await api.kayitOl(email, sifre);
      navigate("/dogrula", { state: { email } });
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="sayfa">
      <h1 className="sayfa-baslik">Kayıt Ol</h1>
      <p className="sayfa-aciklama">
        E-posta adresinize 6 haneli bir doğrulama kodu göndereceğiz.
      </p>

      <form className="kart" onSubmit={gonder}>
        <div className="muhur">✓</div>

        {hata && <div className="hata-mesaji">{hata}</div>}

        <div className="alan">
          <label htmlFor="email">E-posta</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@eposta.com"
            required
          />
        </div>

        <div className="alan">
          <label htmlFor="sifre">Şifre</label>
          <input
            id="sifre"
            type="password"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            placeholder="En az 6 karakter"
            required
          />
        </div>

        <div className="alan">
          <label htmlFor="sifreTekrar">Şifre (tekrar)</label>
          <input
            id="sifreTekrar"
            type="password"
            value={sifreTekrar}
            onChange={(e) => setSifreTekrar(e.target.value)}
            required
          />
        </div>

        <button className="ana-dugme" type="submit" disabled={yukleniyor}>
          {yukleniyor ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
        </button>

        <Link to="/giris" className="ikincil-link">
          Zaten hesabınız var mı? Giriş yapın
        </Link>
      </form>
    </main>
  );
}
