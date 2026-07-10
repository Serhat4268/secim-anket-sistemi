"""
YSK 2023 seçimlerine göre ilçe → seçim bölgesi eşleştirmesi.

Yalnızca birden fazla seçim bölgesine ayrılan iller (Ankara, İstanbul,
İzmir, Bursa) burada listelenir. Diğer iller için il adı doğrudan
bölge adıdır.

Kaynak: YSK 28. Dönem Milletvekili Genel Seçimleri resmi bölge kararı.
"""

ILCE_BOLGE: dict[str, str] = {
    # ── ANKARA ─────────────────────────────────────────────────────
    "Bala":                "Ankara 1. Bölge",
    "Çankaya":             "Ankara 1. Bölge",
    "Elmadağ":             "Ankara 1. Bölge",
    "Evren":               "Ankara 1. Bölge",
    "Gölbaşı":             "Ankara 1. Bölge",
    "Haymana":             "Ankara 1. Bölge",
    "Mamak":               "Ankara 1. Bölge",
    "Polatlı":             "Ankara 1. Bölge",
    "Şereflikoçhisar":    "Ankara 1. Bölge",

    "Akyurt":              "Ankara 2. Bölge",
    "Altındağ":            "Ankara 2. Bölge",
    "Çamlıdere":           "Ankara 2. Bölge",
    "Çubuk":               "Ankara 2. Bölge",
    "Güdül":               "Ankara 2. Bölge",
    "Kahramankazan":       "Ankara 2. Bölge",
    "Kalecik":             "Ankara 2. Bölge",
    "Keçiören":            "Ankara 2. Bölge",
    "Kızılcahamam":        "Ankara 2. Bölge",
    "Pursaklar":           "Ankara 2. Bölge",

    "Ayaş":                "Ankara 3. Bölge",
    "Beypazarı":           "Ankara 3. Bölge",
    "Etimesgut":           "Ankara 3. Bölge",
    "Nallıhan":            "Ankara 3. Bölge",
    "Sincan":              "Ankara 3. Bölge",
    "Yenimahalle":         "Ankara 3. Bölge",

    # ── İSTANBUL ───────────────────────────────────────────────────
    # 1. Bölge – Anadolu yakası  (35 vekil)
    "Adalar":              "İstanbul 1. Bölge",
    "Ataşehir":            "İstanbul 1. Bölge",
    "Beykoz":              "İstanbul 1. Bölge",
    "Çekmeköy":            "İstanbul 1. Bölge",
    "Kadıköy":             "İstanbul 1. Bölge",
    "Kartal":              "İstanbul 1. Bölge",
    "Maltepe":             "İstanbul 1. Bölge",
    "Pendik":              "İstanbul 1. Bölge",
    "Sancaktepe":          "İstanbul 1. Bölge",
    "Sultanbeyli":         "İstanbul 1. Bölge",
    "Şile":                "İstanbul 1. Bölge",
    "Tuzla":               "İstanbul 1. Bölge",
    "Ümraniye":            "İstanbul 1. Bölge",
    "Üsküdar":             "İstanbul 1. Bölge",

    # 2. Bölge – Avrupa yakası doğu  (27 vekil)
    "Bayrampaşa":          "İstanbul 2. Bölge",
    "Beşiktaş":            "İstanbul 2. Bölge",
    "Beyoğlu":             "İstanbul 2. Bölge",
    "Esenler":             "İstanbul 2. Bölge",
    "Eyüpsultan":          "İstanbul 2. Bölge",
    "Fatih":               "İstanbul 2. Bölge",
    "Gaziosmanpaşa":       "İstanbul 2. Bölge",
    "Kağıthane":           "İstanbul 2. Bölge",
    "Sarıyer":             "İstanbul 2. Bölge",
    "Sultangazi":          "İstanbul 2. Bölge",
    "Şişli":               "İstanbul 2. Bölge",
    "Zeytinburnu":         "İstanbul 2. Bölge",

    # 3. Bölge – Avrupa yakası batı  (36 vekil)
    "Arnavutköy":          "İstanbul 3. Bölge",
    "Avcılar":             "İstanbul 3. Bölge",
    "Bağcılar":            "İstanbul 3. Bölge",
    "Bahçelievler":        "İstanbul 3. Bölge",
    "Bakırköy":            "İstanbul 3. Bölge",
    "Başakşehir":          "İstanbul 3. Bölge",
    "Beylikdüzü":          "İstanbul 3. Bölge",
    "Büyükçekmece":        "İstanbul 3. Bölge",
    "Çatalca":             "İstanbul 3. Bölge",
    "Esenyurt":            "İstanbul 3. Bölge",
    "Güngören":            "İstanbul 3. Bölge",
    "Küçükçekmece":        "İstanbul 3. Bölge",
    "Silivri":             "İstanbul 3. Bölge",

    # ── İZMİR ──────────────────────────────────────────────────────
    # 1. Bölge – Güney  (14 vekil)
    "Balçova":             "İzmir 1. Bölge",
    "Buca":                "İzmir 1. Bölge",
    "Çeşme":               "İzmir 1. Bölge",
    "Gaziemir":            "İzmir 1. Bölge",
    "Güzelbahçe":          "İzmir 1. Bölge",
    "Karabağlar":          "İzmir 1. Bölge",
    "Karaburun":           "İzmir 1. Bölge",
    "Konak":               "İzmir 1. Bölge",
    "Menderes":            "İzmir 1. Bölge",
    "Narlıdere":           "İzmir 1. Bölge",
    "Seferihisar":         "İzmir 1. Bölge",
    "Selçuk":              "İzmir 1. Bölge",
    "Torbalı":             "İzmir 1. Bölge",
    "Urla":                "İzmir 1. Bölge",

    # 2. Bölge – Kuzey  (14 vekil)
    "Aliağa":              "İzmir 2. Bölge",
    "Bayındır":            "İzmir 2. Bölge",
    "Bayraklı":            "İzmir 2. Bölge",
    "Bergama":             "İzmir 2. Bölge",
    "Beydağ":              "İzmir 2. Bölge",
    "Bornova":             "İzmir 2. Bölge",
    "Çiğli":               "İzmir 2. Bölge",
    "Dikili":              "İzmir 2. Bölge",
    "Foça":                "İzmir 2. Bölge",
    "Karşıyaka":           "İzmir 2. Bölge",
    "Kemalpaşa":           "İzmir 2. Bölge",
    "Kınık":               "İzmir 2. Bölge",
    "Kiraz":               "İzmir 2. Bölge",
    "Menemen":             "İzmir 2. Bölge",
    "Ödemiş":              "İzmir 2. Bölge",
    "Tire":                "İzmir 2. Bölge",

    # ── BURSA ──────────────────────────────────────────────────────
    # 1. Bölge – Batı  (10 vekil)
    "Büyükorhan":          "Bursa 1. Bölge",
    "Karacabey":           "Bursa 1. Bölge",
    "M.Kemalpaşa":         "Bursa 1. Bölge",
    "Mustafakemalpaşa":    "Bursa 1. Bölge",  # tam yazım için alias
    "Nilüfer":             "Bursa 1. Bölge",
    "Orhaneli":            "Bursa 1. Bölge",
    "Osmangazi":           "Bursa 1. Bölge",

    # 2. Bölge – Doğu  (11 vekil)
    "Gemlik":              "Bursa 2. Bölge",
    "Gürsu":               "Bursa 2. Bölge",
    "Harmancık":           "Bursa 2. Bölge",
    "İnegöl":              "Bursa 2. Bölge",
    "İznik":               "Bursa 2. Bölge",
    "Keles":               "Bursa 2. Bölge",
    "Kestel":              "Bursa 2. Bölge",
    "Mudanya":             "Bursa 2. Bölge",
    "Orhangazi":           "Bursa 2. Bölge",
    "Yenişehir":           "Bursa 2. Bölge",
    "Yıldırım":            "Bursa 2. Bölge",
}

# Hangi üst-il adının (GeoJSON'da görünen) bölgeli olduğunu belirtir.
# Bu dict'teki iller haritaya tıklanınca ilçe seçim ekranı açılır.
ILCELI_ILLER: dict[str, list[str]] = {
    "Ankara":   sorted({b for b in ILCE_BOLGE.values() if b.startswith("Ankara")}),
    "İstanbul": sorted({b for b in ILCE_BOLGE.values() if b.startswith("İstanbul")}),
    "İzmir":    sorted({b for b in ILCE_BOLGE.values() if b.startswith("İzmir")}),
    "Bursa":    sorted({b for b in ILCE_BOLGE.values() if b.startswith("Bursa")}),
}

def ilce_den_bolge(ilce: str) -> str | None:
    """İlçe adından seçim bölgesi döndürür. Bilinmiyorsa None."""
    return ILCE_BOLGE.get(ilce)
