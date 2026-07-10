import React, { useEffect, useState, useRef } from "react";
import { api } from "../api.js";
import { PARTI_LISTESI } from "../data/partiler.js";
import socket from "../socket.js";

const BOS = PARTI_LISTESI.map(p => ({ parti: p.ad, oy: 0, yuzde: 0, koltuk: 0 }));

function renk(ad) { return PARTI_LISTESI.find(p => p.ad === ad)?.renk || "#777"; }

export default function SonucTablosu({ bolge, yenilemeTetik }) {
  const [sonuc, setSonuc] = useState(null);
  const [hata,  setHata]  = useState("");

  async function getir() {
    try {
      const v = await api.sonuclarGetir(bolge);
      setSonuc(v); setHata("");
    } catch(e) { setHata(e.message); }
  }

  useEffect(() => {
    getir();

    // WebSocket: sadece bu bölge güncellendiğinde yenile
    function handler(data) { if (data.bolge === bolge) getir(); }
    socket.on("oy_guncellendi", handler);
    return () => socket.off("oy_guncellendi", handler);
  }, [bolge]);

  // Dışarıdan tetiklendiğinde de (kendi oyunu kullanınca) yenile
  useEffect(() => { if (yenilemeTetik > 0) getir(); }, [yenilemeTetik]);

  const satirlar = sonuc?.sonuclar || BOS;

  return (
    <aside className="sonuc-karti">
      <div className="oylama-ust">
        <h2>Anlık Sonuç</h2>
        <span className="vekil-rozeti">{sonuc?.toplam_oy ?? 0} oy</span>
      </div>
      {hata && <div className="hata-mesaji">{hata}</div>}
      <table className="sonuc-tablosu">
        <thead>
          <tr><th>Parti</th><th>Oy %</th><th>Vekil</th></tr>
        </thead>
        <tbody>
          {satirlar.map(s => (
            <tr key={s.parti}>
              <td><span className="parti-nokta" style={{ background: renk(s.parti) }} />{s.parti}</td>
              <td>%{s.yuzde}</td>
              <td>{s.koltuk}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sonuc-not">
        D'Hondt yöntemiyle hesaplanan anlık projeksiyon. Birisi oy
        kullandığı anda WebSocket ile kendiliğinden güncellenir.
      </p>
    </aside>
  );
}
