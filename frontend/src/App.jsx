import React, { createContext, useContext, useState, useCallback } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import "./OyKutusu.css";

import TurkiyeHaritasi from "./components/TurkiyeHaritasi.jsx";
import Kayit           from "./components/Kayit.jsx";
import Dogrulama       from "./components/Dogrulama.jsx";
import Giris           from "./components/Giris.jsx";
import OylamaEkrani    from "./components/OylamaEkrani.jsx";
import SifreSifirla    from "./components/SifreSifirla.jsx";
import IlDetaylari     from "./components/IlDetaylari.jsx";

const KimlikContext = createContext(null);
export const useKimlik = () => useContext(KimlikContext);

function KimlikSaglayici({ children }) {
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const girisYap = useCallback((yeniEmail, yeniToken) => {
    localStorage.setItem("email", yeniEmail);
    localStorage.setItem("token", yeniToken);
    setEmail(yeniEmail); setToken(yeniToken);
  }, []);

  const cikisYap = useCallback(() => {
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    setEmail(""); setToken("");
  }, []);

  return (
    <KimlikContext.Provider value={{ email, token, girisYap, cikisYap }}>
      {children}
    </KimlikContext.Provider>
  );
}

function KorumaliRota({ children }) {
  const { token } = useKimlik();
  const location  = useLocation();
  if (!token) return <Navigate to="/giris" replace state={{ from: location }} />;
  return children;
}

function UstSerit() {
  const { token, email, cikisYap } = useKimlik();
  const navigate = useNavigate();
  return (
    <header className="ust-serit">
      <div className="ust-serit-sol">
        <Link to="/" className="marka">
          Seçim Anket Sistemi <small>Türkiye</small>
        </Link>
        <Link to="/il-detaylari" className="il-detay-dugmesi">
          İllerin Detaylı Sonuçları
        </Link>
      </div>
      <div className="ust-serit-sag">
        {token ? (
          <>
            <span>{email}</span>
            <button className="cikis-dugmesi" onClick={() => { cikisYap(); navigate("/giris"); }}>
              Çıkış yap
            </button>
          </>
        ) : (
          <Link to="/giris" className="ikincil-link" style={{ margin: 0 }}>Giriş yap</Link>
        )}
      </div>
    </header>
  );
}

export default function App() {
  return (
    <KimlikSaglayici>
      <div className="uygulama">
        <UstSerit />
        <Routes>
          <Route path="/kayit"         element={<Kayit />} />
          <Route path="/dogrula"       element={<Dogrulama />} />
          <Route path="/giris"         element={<Giris />} />
          <Route path="/sifre-sifirla" element={<SifreSifirla />} />
          <Route path="/"              element={<TurkiyeHaritasi />} />
          <Route path="/il-detaylari"  element={<IlDetaylari />} />
          <Route path="/oylama/:bolge" element={
            <KorumaliRota><OylamaEkrani /></KorumaliRota>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </KimlikSaglayici>
  );
}
