export const VEKIL_SAYILARI = {
  "Adana": 15, "Adıyaman": 5, "Afyonkarahisar": 6, "Ağrı": 4, "Amasya": 3,
  "Ankara 1. Bölge": 13, "Ankara 2. Bölge": 11, "Ankara 3. Bölge": 12,
  "Antalya": 17, "Artvin": 2, "Aydın": 8, "Balıkesir": 9, "Bilecik": 2,
  "Bingöl": 3, "Bitlis": 3, "Bolu": 3, "Burdur": 3,
  "Bursa 1. Bölge": 10, "Bursa 2. Bölge": 11,
  "Çanakkale": 4, "Çankırı": 2, "Çorum": 4, "Denizli": 7, "Diyarbakır": 12,
  "Edirne": 4, "Elazığ": 5, "Erzincan": 2, "Erzurum": 6, "Eskişehir": 7,
  "Gaziantep": 14, "Giresun": 4, "Gümüşhane": 2, "Hakkari": 3, "Hatay": 11,
  "Isparta": 4, "Mersin": 13,
  "İstanbul 1. Bölge": 35, "İstanbul 2. Bölge": 27, "İstanbul 3. Bölge": 34,
  "İzmir 1. Bölge": 14, "İzmir 2. Bölge": 14,
  "Kars": 3, "Kastamonu": 3, "Kayseri": 10, "Kırklareli": 3, "Kırşehir": 2,
  "Kocaeli": 14, "Konya": 15, "Kütahya": 5, "Malatya": 6, "Manisa": 10,
  "Kahramanmaraş": 8, "Mardin": 6, "Muğla": 8, "Muş": 3, "Nevşehir": 3,
  "Niğde": 3, "Ordu": 6, "Rize": 3, "Sakarya": 8, "Samsun": 9, "Siirt": 3,
  "Sinop": 2, "Sivas": 5, "Tekirdağ": 8, "Tokat": 5, "Trabzon": 6,
  "Tunceli": 1, "Şanlıurfa": 15, "Uşak": 3, "Van": 8, "Yozgat": 3,
  "Zonguldak": 5, "Aksaray": 4, "Bayburt": 1, "Karaman": 3, "Kırıkkale": 3,
  "Batman": 5, "Şırnak": 4, "Bartın": 2, "Ardahan": 2, "Iğdır": 2,
  "Yalova": 3, "Karabük": 2, "Kilis": 2, "Osmaniye": 4, "Düzce": 3
};

export const BOLGELI_ILLER = {
  "Ankara":   ["Ankara 1. Bölge",   "Ankara 2. Bölge",   "Ankara 3. Bölge"],
  "İstanbul": ["İstanbul 1. Bölge", "İstanbul 2. Bölge", "İstanbul 3. Bölge"],
  "İzmir":    ["İzmir 1. Bölge",    "İzmir 2. Bölge"],
  "Bursa":    ["Bursa 1. Bölge",    "Bursa 2. Bölge"],
};

/** Haritada tek poligon görünen ama ilçe seçimi gerektiren iller */
export const ILCELI_ILLER = {
  "Ankara": [
    "Bala","Çankaya","Elmadağ","Evren","Gölbaşı","Haymana","Mamak","Polatlı","Şereflikoçhisar",
    "Akyurt","Altındağ","Çamlıdere","Çubuk","Güdül","Kahramankazan","Kalecik","Keçiören","Kızılcahamam","Pursaklar",
    "Ayaş","Beypazarı","Etimesgut","Nallıhan","Sincan","Yenimahalle"
  ],
  "İstanbul": [
    "Adalar","Ataşehir","Beykoz","Çekmeköy","Kadıköy","Kartal","Maltepe","Pendik","Sancaktepe","Sultanbeyli","Şile","Tuzla","Ümraniye","Üsküdar",
    "Bayrampaşa","Beşiktaş","Beyoğlu","Esenler","Eyüpsultan","Fatih","Gaziosmanpaşa","Kağıthane","Sarıyer","Sultangazi","Şişli","Zeytinburnu",
    "Arnavutköy","Avcılar","Bağcılar","Bahçelievler","Bakırköy","Başakşehir","Beylikdüzü","Büyükçekmece","Çatalca","Esenyurt","Güngören","Küçükçekmece","Silivri"
  ],
  "İzmir": [
    "Balçova","Buca","Çeşme","Gaziemir","Güzelbahçe","Karabağlar","Karaburun","Konak","Menderes","Narlıdere","Seferihisar","Selçuk","Torbalı","Urla",
    "Aliağa","Bayındır","Bayraklı","Bergama","Beydağ","Bornova","Çiğli","Dikili","Foça","Karşıyaka","Kemalpaşa","Kınık","Kiraz","Menemen","Ödemiş","Tire"
  ],
  "Bursa": [
    "Büyükorhan","Karacabey","Mustafakemalpaşa","Nilüfer","Orhaneli","Osmangazi",
    "Gemlik","Gürsu","Harmancık","İnegöl","İznik","Keles","Kestel","Mudanya","Orhangazi","Yenişehir","Yıldırım"
  ]
};

/** YSK ilçe→bölge eşleşmesi (frontend kopyası, backend tarafından da doğrulanır) */
export const ILCE_BOLGE = {
  // ANKARA
  "Bala":"Ankara 1. Bölge","Çankaya":"Ankara 1. Bölge","Elmadağ":"Ankara 1. Bölge",
  "Evren":"Ankara 1. Bölge","Gölbaşı":"Ankara 1. Bölge","Haymana":"Ankara 1. Bölge",
  "Mamak":"Ankara 1. Bölge","Polatlı":"Ankara 1. Bölge","Şereflikoçhisar":"Ankara 1. Bölge",
  "Akyurt":"Ankara 2. Bölge","Altındağ":"Ankara 2. Bölge","Çamlıdere":"Ankara 2. Bölge",
  "Çubuk":"Ankara 2. Bölge","Güdül":"Ankara 2. Bölge","Kahramankazan":"Ankara 2. Bölge",
  "Kalecik":"Ankara 2. Bölge","Keçiören":"Ankara 2. Bölge","Kızılcahamam":"Ankara 2. Bölge",
  "Pursaklar":"Ankara 2. Bölge","Ayaş":"Ankara 3. Bölge","Beypazarı":"Ankara 3. Bölge",
  "Etimesgut":"Ankara 3. Bölge","Nallıhan":"Ankara 3. Bölge","Sincan":"Ankara 3. Bölge",
  "Yenimahalle":"Ankara 3. Bölge",
  // İSTANBUL
  "Adalar":"İstanbul 1. Bölge","Ataşehir":"İstanbul 1. Bölge","Beykoz":"İstanbul 1. Bölge",
  "Çekmeköy":"İstanbul 1. Bölge","Kadıköy":"İstanbul 1. Bölge","Kartal":"İstanbul 1. Bölge",
  "Maltepe":"İstanbul 1. Bölge","Pendik":"İstanbul 1. Bölge","Sancaktepe":"İstanbul 1. Bölge",
  "Sultanbeyli":"İstanbul 1. Bölge","Şile":"İstanbul 1. Bölge","Tuzla":"İstanbul 1. Bölge",
  "Ümraniye":"İstanbul 1. Bölge","Üsküdar":"İstanbul 1. Bölge",
  "Bayrampaşa":"İstanbul 2. Bölge","Beşiktaş":"İstanbul 2. Bölge","Beyoğlu":"İstanbul 2. Bölge",
  "Esenler":"İstanbul 2. Bölge","Eyüpsultan":"İstanbul 2. Bölge","Fatih":"İstanbul 2. Bölge",
  "Gaziosmanpaşa":"İstanbul 2. Bölge","Kağıthane":"İstanbul 2. Bölge","Sarıyer":"İstanbul 2. Bölge",
  "Sultangazi":"İstanbul 2. Bölge","Şişli":"İstanbul 2. Bölge","Zeytinburnu":"İstanbul 2. Bölge",
  "Arnavutköy":"İstanbul 3. Bölge","Avcılar":"İstanbul 3. Bölge","Bağcılar":"İstanbul 3. Bölge",
  "Bahçelievler":"İstanbul 3. Bölge","Bakırköy":"İstanbul 3. Bölge","Başakşehir":"İstanbul 3. Bölge",
  "Beylikdüzü":"İstanbul 3. Bölge","Büyükçekmece":"İstanbul 3. Bölge","Çatalca":"İstanbul 3. Bölge",
  "Esenyurt":"İstanbul 3. Bölge","Güngören":"İstanbul 3. Bölge","Küçükçekmece":"İstanbul 3. Bölge",
  "Silivri":"İstanbul 3. Bölge",
  // İZMİR
  "Balçova":"İzmir 1. Bölge","Buca":"İzmir 1. Bölge","Çeşme":"İzmir 1. Bölge",
  "Gaziemir":"İzmir 1. Bölge","Güzelbahçe":"İzmir 1. Bölge","Karabağlar":"İzmir 1. Bölge",
  "Karaburun":"İzmir 1. Bölge","Konak":"İzmir 1. Bölge","Menderes":"İzmir 1. Bölge",
  "Narlıdere":"İzmir 1. Bölge","Seferihisar":"İzmir 1. Bölge","Selçuk":"İzmir 1. Bölge",
  "Torbalı":"İzmir 1. Bölge","Urla":"İzmir 1. Bölge",
  "Aliağa":"İzmir 2. Bölge","Bayındır":"İzmir 2. Bölge","Bayraklı":"İzmir 2. Bölge",
  "Bergama":"İzmir 2. Bölge","Beydağ":"İzmir 2. Bölge","Bornova":"İzmir 2. Bölge",
  "Çiğli":"İzmir 2. Bölge","Dikili":"İzmir 2. Bölge","Foça":"İzmir 2. Bölge",
  "Karşıyaka":"İzmir 2. Bölge","Kemalpaşa":"İzmir 2. Bölge","Kınık":"İzmir 2. Bölge",
  "Kiraz":"İzmir 2. Bölge","Menemen":"İzmir 2. Bölge","Ödemiş":"İzmir 2. Bölge",
  "Tire":"İzmir 2. Bölge",
  // BURSA
  "Büyükorhan":"Bursa 1. Bölge","Karacabey":"Bursa 1. Bölge","Mustafakemalpaşa":"Bursa 1. Bölge",
  "Nilüfer":"Bursa 1. Bölge","Orhaneli":"Bursa 1. Bölge","Osmangazi":"Bursa 1. Bölge",
  "Gemlik":"Bursa 2. Bölge","Gürsu":"Bursa 2. Bölge","Harmancık":"Bursa 2. Bölge",
  "İnegöl":"Bursa 2. Bölge","İznik":"Bursa 2. Bölge","Keles":"Bursa 2. Bölge",
  "Kestel":"Bursa 2. Bölge","Mudanya":"Bursa 2. Bölge","Orhangazi":"Bursa 2. Bölge",
  "Yenişehir":"Bursa 2. Bölge","Yıldırım":"Bursa 2. Bölge"
};

const TAKMA_ADLAR = {
  "Afyon":"Afyonkarahisar","Urfa":"Şanlıurfa","Maraş":"Kahramanmaraş",
  "K.Maraş":"Kahramanmaraş","İçel":"Mersin","Hakkâri":"Hakkari"
};

function sad(s){ return (s||"").trim().toLocaleLowerCase("tr-TR").replace(/i̇/g,"i"); }

const ILCELI_IL_KEYS = Object.keys(ILCELI_ILLER);

export function ilAdiniEsle(geoAdi){
  const ik = ILCELI_IL_KEYS.find(il => sad(il)===sad(geoAdi));
  if(ik) return ik;
  const aday = TAKMA_ADLAR[geoAdi]||geoAdi;
  return Object.keys(VEKIL_SAYILARI).find(k=>sad(k)===sad(aday))||null;
}

export function ilceli(eslesen){
  return Object.prototype.hasOwnProperty.call(ILCELI_ILLER, eslesen);
}
