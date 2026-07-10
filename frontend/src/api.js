export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function token(){ return localStorage.getItem("token")||""; }

async function istek(yol, opt={}){
  const res = await fetch(`${API_URL}${yol}`,{
    ...opt,
    headers:{
      "Content-Type":"application/json",
      ...(token()?{Authorization:`Bearer ${token()}`}:{}),
      ...(opt.headers||{})
    }
  });
  const veri = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(veri.mesaj||`İstek başarısız (${res.status})`);
  return veri;
}

export const api = {
  kayitOl:          (email,sifre)       => istek("/api/kayit",{method:"POST",body:JSON.stringify({email,sifre})}),
  dogrula:          (email,kod)         => istek("/api/dogrula",{method:"POST",body:JSON.stringify({email,kod})}),
  girisYap:         (email,sifre)       => istek("/api/giris",{method:"POST",body:JSON.stringify({email,sifre})}),
  oyDurumuGetir:    ()                  => istek("/api/oy-durumu"),
  oyKullan:         (bolge,ilce,secim)  => istek("/api/oy-kullan",{method:"POST",body:JSON.stringify({bolge,ilce,secim})}),
  sonuclarGetir:    (bolge)             => istek(`/api/sonuclar/${encodeURIComponent(bolge)}`),
  ulusalSonuclar:   ()                  => istek("/api/ulusal-sonuclar"),
  ilSonuclariGetir: (il) => istek(`/api/il-sonuclari/${encodeURIComponent(il)}`),
};
