import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { PARTI_LISTESI } from "../data/partiler.js";
import socket from "../socket.js";

const BOS_SONUC = PARTI_LISTESI.map(p => ({ parti: p.ad, oy: 0, yuzde: 0, koltuk: 0 }));

export default function IlDetaylari() {
  const [iller,      setIller]      = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata,       setHata]       = useState("");

  async function getir() {
    try {
      const v = await api.tumIlSonuclari();
      setIller(v.iller || []);
      setHata("");
    } catch (e) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  }

  useEffect(() => {
    getir();

    // Herhangi bir oy kullanılınca tabloyu kendiliğinden güncelle
    socket.on("ulusal_guncellendi", getir);
    return () => socket.off("ulusal_guncellendi", getir);
  }, []);

  const siraliIller = [...iller].sort((a, b) => a.il.localeCompare(b.il, "tr"));

  return (
    <div className="sayfa il-detay-sayfa">
      <h1 className="sayfa-baslik">İllerin Detaylı Sonuçları</h1>
      <p className="sayfa-aciklama">
        81 ilin anlık oy oranı ve vekil sayısı. Bir kullanıcı oy kullandığı
        anda tablo kendiliğinden güncellenir.
      </p>

      {hata && <div className="hata-mesaji">{hata}</div>}

      {yukleniyor ? (
        <p className="yukleniyor">Yükleniyor…</p>
      ) : (
        <div className="il-detay-sarmalayici">
          <table className="il-detay-tablosu">
            <thead>
              <tr>
                <th className="il-detay-il-basligi">İl</th>
                {PARTI_LISTESI.map(p => (
                  <th key={p.ad}>
                    <span className="parti-nokta" style={{ background: p.renk }} />
                    {p.ad}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {siraliIller.map(satir => {
                const sonuclar = satir.sonuclar?.length ? satir.sonuclar : BOS_SONUC;
                return (
                  <tr key={satir.il}>
                    <td className="il-detay-il-adi">
                      {satir.il}
                      <span className="il-detay-vekil">[{satir.vekil_sayisi}]</span>
                    </td>
                    {PARTI_LISTESI.map(p => {
                      const s = sonuclar.find(x => x.parti === p.ad);
                      const yuzde = (s?.yuzde ?? 0).toString().replace(".", ",");
                      return (
                        <td key={p.ad}>
                          %{yuzde}
                          <span className="il-detay-koltuk">[{s?.koltuk ?? 0}]</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
