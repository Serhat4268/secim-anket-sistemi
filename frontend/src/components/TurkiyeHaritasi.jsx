import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import BolgeSecimi from "./BolgeSecimi.jsx";
import UlusalSonuclar from "./UlusalSonuclar.jsx";
import { ilAdiniEsle, ilceli, VEKIL_SAYILARI, BOLGELI_ILLER } from "../data/vekilSayilari.js";
import { PARTI_LISTESI } from "../data/partiler.js";
import { API_URL } from "../api.js";

const GEOJSON_URL = "https://raw.githubusercontent.com/alpers/Turkey-Maps-GeoJSON/master/tr-cities.json";
const W = 1000, H = 500;

function renkBul(ad) {
  return PARTI_LISTESI.find(p => p.ad === ad)?.renk || "#777";
}

export default function TurkiyeHaritasi() {
  const wrapRef     = useRef(null);
  const ttRef       = useRef(null);
  const svgDrawnRef = useRef(false);
  const hoverTimer  = useRef(null);
  const sonucCache  = useRef({});

  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata,       setHata]       = useState("");
  const [modalIl,    setModalIl]    = useState(null);
  const [ttSonuc,    setTtSonuc]    = useState(null); // { il, toplam_oy, sonuclar }
  const [ttIl,       setTtIl]       = useState("");
  const [ttPos,      setTtPos]      = useState({ x: 0, y: 0 });
  const [ttGorunur,  setTtGorunur]  = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(g  => { setYukleniyor(false); ciz(g); })
      .catch(e => { setYukleniyor(false); setHata("Harita yüklenemedi: " + e.message); });
  }, []);

  async function sonuclariGetir(il) {
    if (sonucCache.current[il]) return sonucCache.current[il];
    try {
      const res  = await fetch(`${API_URL}/api/il-sonuclari/${encodeURIComponent(il)}`);
      const veri = await res.json();
      if (veri.basarili) {
        sonucCache.current[il] = veri;
        return veri;
      }
    } catch {}
    return null;
  }

  function ilTiklandi(eslesen) {
    if (ilceli(eslesen)) { setModalIl(eslesen); return; }
    navigate(`/oylama/${encodeURIComponent(eslesen)}`);
  }

  function ciz(geo) {
    if (svgDrawnRef.current) return;
    svgDrawnRef.current = true;
    const svg  = d3.select(wrapRef.current).append("svg").attr("viewBox", `0 0 ${W} ${H}`);
    const proj = d3.geoMercator().fitSize([W, H], geo);
    const path = d3.geoPath().projection(proj);

    svg.append("g").selectAll("path").data(geo.features).enter().append("path")
      .attr("class", "il").attr("d", path)
      .on("mousemove", (ev, d) => {
        const eslesen = ilAdiniEsle(d.properties.name);
        if (!eslesen) return;

        const rect = wrapRef.current.getBoundingClientRect();
        setTtPos({ x: ev.clientX - rect.left, y: ev.clientY - rect.top });
        setTtIl(eslesen);
        setTtGorunur(true);
        console.log("hover:", eslesen); 

        // Önce cache'e bak, yoksa 300ms bekleyip getir (çok hızlı geçişlerde gereksiz istek atmamak için)
        clearTimeout(hoverTimer.current);
        if (sonucCache.current[eslesen]) {
          setTtSonuc(sonucCache.current[eslesen]);
        } else {
          setTtSonuc(null);
          hoverTimer.current = setTimeout(async () => {
            const veri = await sonuclariGetir(eslesen);
            setTtSonuc(veri);
          }, 300);
        }
      })
      .on("mouseleave", () => {
        clearTimeout(hoverTimer.current);
        setTtGorunur(false);
        setTtSonuc(null);
      })
      .on("click", (_, d) => {
        const eslesen = ilAdiniEsle(d.properties.name);
        if (!eslesen) { alert(`"${d.properties.name}" eşleştirilemedi.`); return; }
        ilTiklandi(eslesen);
      });
  }

  // Tooltip içeriği
  const bolgeli     = ttIl && ilceli(ttIl);
  const toplamVekil = ttIl
    ? bolgeli
      ? (BOLGELI_ILLER[ttIl] || []).reduce((s, b) => s + (VEKIL_SAYILARI[b] || 0), 0)
      : (VEKIL_SAYILARI[ttIl] || 0)
    : 0;

  const ilkUcSonuc = ttSonuc?.sonuclar?.filter(s => s.oy > 0).slice(0, 3) || [];

  return (
    <div className="harita-sayfa">
      <main className="sayfa harita-main">
        <h1 className="sayfa-baslik">Seçim Bölgesi Seçin</h1>
        <p className="sayfa-aciklama">
          İlinize tıklayın. Ankara, İstanbul, İzmir ve Bursa için ilçenizi
          seçmeniz istenecek; bölgeniz otomatik belirlenir.
        </p>

        <div className="harita-kapsayici" ref={wrapRef}>
          {yukleniyor && <div className="yukleniyor">Harita yükleniyor…</div>}
          {hata       && <div className="yukleniyor">{hata}</div>}

          {/* Özel React tooltip — eski #tooltip div'i yerine */}
          {ttGorunur && (
            <div
              className="harita-tooltip"
              style={{ left: ttPos.x, top: ttPos.y }}
            >
              <div className="ht-baslik">
                {ttIl}
                <span className="ht-vekil">{toplamVekil} vekil</span>
              </div>

              {ttSonuc && ttSonuc.toplam_oy > 0 ? (
                <>
                  <div className="ht-meta">{ttSonuc.toplam_oy} oy kullanıldı</div>
                  {ilkUcSonuc.map(s => (
                    <div key={s.parti} className="ht-satir">
                      <span className="ht-nokta" style={{ background: renkBul(s.parti) }} />
                      <span className="ht-parti">{s.parti}</span>
                      <span className="ht-yuzde">%{s.yuzde}</span>
                      <span className="ht-koltuk">{s.koltuk} sandalye</span>
                    </div>
                  ))}
                  {(ttSonuc.sonuclar?.filter(s => s.oy > 0).length || 0) > 3 && (
                    <div className="ht-devami">+ diğerleri · tıkla için detay</div>
                  )}
                </>
              ) : ttSonuc ? (
                <div className="ht-meta">Henüz oy kullanılmadı</div>
              ) : (
                <div className="ht-meta">Yükleniyor…</div>
              )}

              <div className="ht-ipucu">
                {bolgeli ? "Tıkla → ilçe seç" : "Tıkla → oy kullan"}
              </div>
            </div>
          )}
        </div>
      </main>

      <UlusalSonuclar />

      {modalIl && (
        <BolgeSecimi
          il={modalIl}
          onSec={(ilce, bolge) => {
            setModalIl(null);
            navigate(`/oylama/${encodeURIComponent(bolge)}?ilce=${encodeURIComponent(ilce)}`);
          }}
          onKapat={() => setModalIl(null)}
        />
      )}
    </div>
  );
}