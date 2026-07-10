import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

export default function Dogrulama() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder(e) {
    e.preventDefault();
    setHata("");
    setBasari("");
    setYukleniyor(true);
    try {
      await api.dogrula(email, kod);
      setBasari("Hesabınız doğrulandı. Giriş ekranına yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/giris"), 1200);
    } catch (err) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <main className="sayfa">
      <h1 className="sayfa-baslik">E-postanızı Doğrulayın</h1>
      <p className="sayfa-aciklama">
        {email ? <><strong>{email}</strong> adresine gönderilen 6 haneli kodu girin.</> : "E-postanıza gönderilen 6 haneli kodu girin."}
      </p>

      <form className="kart" onSubmit={gonder}>
        <div className="muhur">#</div>

        {hata && <div className="hata-mesaji">{hata}</div>}
        {basari && <div className="basari-mesaji">{basari}</div>}

        {!location.state?.email && (
          <div className="alan">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="alan">
          <label htmlFor="kod">Doğrulama kodu</label>
          <input
            id="kod"
            className="kod-girisi"
            inputMode="numeric"
            maxLength={6}
            value={kod}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
          />
        </div>

        <button className="ana-dugme" type="submit" disabled={yukleniyor}>
          {yukleniyor ? "Doğrulanıyor..." : "Doğrula"}
        </button>

        <Link to="/kayit" className="ikincil-link">
          Kod gelmedi mi? Tekrar kayıt olun
        </Link>
      </form>
    </main>
  );
}
