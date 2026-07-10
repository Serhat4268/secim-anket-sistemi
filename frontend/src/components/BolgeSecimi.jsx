import React, { useState } from "react";
import { ILCELI_ILLER, ILCE_BOLGE, VEKIL_SAYILARI } from "../data/vekilSayilari.js";

export default function BolgeSecimi({ il, onSec, onKapat }) {
  const ilceler = ILCELI_ILLER[il] || [];
  const [ara, setAra] = useState("");

  const filtreli = ara.trim()
    ? ilceler.filter(i => i.toLocaleLowerCase("tr-TR").includes(ara.toLocaleLowerCase("tr-TR")))
    : ilceler;

  function secIlce(ilce) {
    const bolge = ILCE_BOLGE[ilce];
    onSec(ilce, bolge);
  }

  return (
    <div className="modal-arkaplan" onClick={onKapat}>
      <div className="modal-kutu modal-genis" onClick={e => e.stopPropagation()}>
        <h2>{il} — İlçenizi Seçin</h2>
        <p>
          Seçtiğiniz ilçeye göre oy kullanacağınız seçim bölgesi otomatik
          belirlenir.
        </p>

        <input
          className="ilce-arama"
          type="text"
          placeholder="İlçe ara…"
          value={ara}
          onChange={e => setAra(e.target.value)}
          autoFocus
        />

        <div className="ilce-grid">
          {filtreli.map(ilce => {
            const bolge  = ILCE_BOLGE[ilce];
            const vekil  = bolge ? VEKIL_SAYILARI[bolge] : "—";
            const bolgeNo = bolge ? bolge.match(/\d+/)?.[0] : "";
            return (
              <button key={ilce} className="ilce-karti" onClick={() => secIlce(ilce)}>
                <span className="ilce-ad">{ilce}</span>
                <span className="ilce-bolge">{bolgeNo}. Bölge</span>
              </button>
            );
          })}
          {filtreli.length === 0 && (
            <p className="ilce-bos">"{ara}" ile eşleşen ilçe bulunamadı.</p>
          )}
        </div>

        <button className="kapat-dugmesi" onClick={onKapat}>Vazgeç</button>
      </div>
    </div>
  );
}
