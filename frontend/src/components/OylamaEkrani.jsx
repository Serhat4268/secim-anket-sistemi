import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { VEKIL_SAYILARI } from "../data/vekilSayilari.js";
import { PARTI_LISTESI } from "../data/partiler.js";
import SonucTablosu from "./SonucTablosu.jsx";

function renkBul(ad) {
  return PARTI_LISTESI.find(p => p.ad === ad)?.renk || "#777";
}

export default function OylamaEkrani() {
  const { bolge }           = useParams();
  const [sp]                = useSearchParams();
  const ilce                = sp.get("ilce") || "";
  const [secilen, setSecilen] = useState("");
  const [hata,    setHata]    = useState("");
  const [gonder,  setGonder]  = useState(false);
  const [kontrol, setKontrol] = useState(true);
  const [mevcutOy, setMevcutOy] = useState(null); // null = henüz bilmiyoruz
  const [tetik,   setTetik]   = useState(0);

  const vekilSayisi = VEKIL_SAYILARI[bolge];

  useEffect(() => {
    api.oyDurumuGetir()
      .then(r => setMevcutOy(r.oy_kullandi ? r.oy : false))
      .catch(() => setMevcutOy(false))
      .finally(() => setKontrol(false));
  }, []);

  async function oyVer(e) {
    e.preventDefault();
    if (!secilen) { setHata("Lütfen bir parti seçin."); return; }
    setHata(""); setGonder(true);
    try {
      await api.oyKullan(
        ilce ? null  : bolge,
        ilce || null,
        secilen
      );
      setMevcutOy({ bolge, ilce: ilce || null, secim: secilen });
      setTetik(n => n + 1);
    } catch (err) {
      setHata(err.message);
    } finally {
      setGonder(false);
    }
  }

  if (!vekilSayisi) return (
    <main className="sayfa">
      <h1 className="sayfa-baslik">Bölge bulunamadı</h1>
      <p className="sayfa-aciklama">"{bolge}" geçerli bir seçim bölgesi değil.</p>
      <Link to="/" className="ikincil-link">Haritaya dön</Link>
    </main>
  );

  return (
    <main className="sayfa">
      <h1 className="sayfa-baslik">{bolge}</h1>
      <p className="sayfa-aciklama">
        {ilce && <><strong>{ilce}</strong> ilçesi · </>}
        Bu bölgeden <strong>{vekilSayisi}</strong> milletvekili seçilecek.
      </p>

      <div className="oylama-grid">
        <form className="oylama-karti" onSubmit={oyVer}>
          <div className="oylama-ust">
            <h2>Oyunuzu kullanın</h2>
            <span className="vekil-rozeti">{vekilSayisi} vekil</span>
          </div>

          {hata && <div className="hata-mesaji">{hata}</div>}

          {kontrol ? (
            <p className="sayfa-aciklama" style={{ margin: 0 }}>Kontrol ediliyor…</p>
          ) : mevcutOy ? (
            /* ── Kullanıcı daha önce oy kullanmış — oyunu göster ── */
            <div className="kendi-oy-kutusu">
              <p className="kendi-oy-baslik">Kullandığınız oy</p>
              <div className="kendi-oy-parti">
                <span
                  className="parti-nokta"
                  style={{ background: renkBul(mevcutOy.secim), width: 14, height: 14 }}
                />
                <strong>{mevcutOy.secim}</strong>
              </div>
              <div className="kendi-oy-detay">
                <span>{mevcutOy.bolge}</span>
                {mevcutOy.ilce && <span>{mevcutOy.ilce}</span>}
              </div>
              <Link to="/" className="ikincil-link" style={{ marginTop: 18 }}>
                Haritaya dön
              </Link>
            </div>
          ) : (
            /* ── Oy kullanma formu ── */
            <>
              <div className="secim-listesi">
                {PARTI_LISTESI.map(p => (
                  <label key={p.ad} className={`secim-secenegi ${secilen === p.ad ? "secili" : ""}`}>
                    <input type="radio" name="secim" value={p.ad}
                      checked={secilen === p.ad} onChange={() => setSecilen(p.ad)} />
                    <span className="parti-nokta" style={{ background: p.renk }} />
                    {p.ad}
                  </label>
                ))}
              </div>
              <button className="ana-dugme" type="submit" disabled={gonder}>
                {gonder ? "Kaydediliyor…" : "Oyumu kullan"}
              </button>
            </>
          )}
        </form>

        <SonucTablosu bolge={bolge} yenilemeTetik={tetik} />
      </div>
    </main>
  );
}
