import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../api.js";
import { useKimlik } from "../App.jsx";

export default function Giris() {
  const [email,      setEmail]      = useState("");
  const [sifre,      setSifre]      = useState("");
  const [hata,       setHata]       = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const { girisYap }  = useKimlik();
  const navigate      = useNavigate();
  const location      = useLocation();
  const hedefSayfa    = location.state?.from?.pathname || "/";

  async function gonder(e) {
    e.preventDefault();
    setHata(""); setYukleniyor(true);
    try {
      const sonuc = await api.girisYap(email, sifre);
      girisYap(sonuc.email, sonuc.token);
      navigate(hedefSayfa, { replace: true });
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="sayfa">
      <h1 className="sayfa-baslik">Giriş Yap</h1>
      <p className="sayfa-aciklama">
        {hedefSayfa.startsWith("/oylama")
          ? "Oy kullanmak için giriş yapmalısınız."
          : "Haritadan seçim bölgenizi seçip oyunuzu kullanın."}
      </p>

      <form className="kart" onSubmit={gonder}>
        <div className="muhur">★</div>
        {hata && <div className="hata-mesaji">{hata}</div>}

        <div className="alan">
          <label>E-posta</label>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="alan">
          <label>Şifre</label>
          <input type="password" value={sifre}
            onChange={e => setSifre(e.target.value)} required />
        </div>

        <button className="ana-dugme" type="submit" disabled={yukleniyor}>
          {yukleniyor ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>

        <Link to="/sifre-sifirla" className="ikincil-link">Şifremi unuttum</Link>
        <Link to="/kayit"         className="ikincil-link">Hesabınız yok mu? Kayıt olun</Link>
      </form>
    </main>
  );
}
