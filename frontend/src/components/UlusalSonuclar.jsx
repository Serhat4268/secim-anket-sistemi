import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { PARTI_LISTESI } from "../data/partiler.js";
import socket from "../socket.js";

function renk(ad) { return PARTI_LISTESI.find(p => p.ad === ad)?.renk || "#777"; }

export default function UlusalSonuclar() {
  const [acik,       setAcik]       = useState(true);
  const [sonuc,      setSonuc]      = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  async function getir() {
    try {
      const v = await api.ulusalSonuclar();
      setSonuc(v); setYukleniyor(false);
    } catch { setYukleniyor(false); }
  }

  useEffect(() => {
    getir();

    // WebSocket: herhangi bir oy kullanılınca ulusal tabloyu güncelle
    socket.on("ulusal_guncellendi", getir);
    return () => socket.off("ulusal_guncellendi", getir);
  }, []);

  const satirlar = sonuc?.sonuclar || PARTI_LISTESI.map(p => ({
    parti: p.ad, oy: 0, yuzde: 0, koltuk: 0
  }));
  const toplamKoltuk = satirlar.reduce((s, r) => s + r.koltuk, 0);

  return (
    <aside className={`ulusal-panel ${acik ? "acik" : "kapali"}`}>
      <div className="ulusal-baslik" onClick={() => setAcik(a => !a)}>
        <span>🇹🇷 Türkiye Geneli</span>
        <button className="kucult-dugme" title={acik ? "Küçült" : "Aç"}>
          {acik ? "◀" : "▶"}
        </button>
      </div>

      {acik && (
        <div className="ulusal-icerik">
          <div className="ulusal-meta">
            <span>{(sonuc?.toplam_oy || 0).toLocaleString("tr-TR")} oy</span>
            <span>{toplamKoltuk} / 600 sandalye</span>
          </div>

          {yukleniyor ? (
            <p className="ulusal-yukl">Yükleniyor…</p>
          ) : (
            <table className="sonuc-tablosu">
              <thead>
                <tr><th>Parti</th><th>%</th><th>Sandalye</th></tr>
              </thead>
              <tbody>
                {satirlar.map(s => (
                  <tr key={s.parti}>
                    <td>
                      <span className="parti-nokta" style={{ background: renk(s.parti) }} />
                      {s.parti}
                    </td>
                    <td>%{s.yuzde}</td>
                    <td>{s.koltuk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </aside>
  );
}
