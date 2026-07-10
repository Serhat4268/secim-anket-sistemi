# Milletvekili dağılımı — kullanıcının sağladığı orijinal rakamlar korunmuştur.
# Toplam: 600 sandalye.
# Bölgeli iller: Ankara (13+11+12=36), İstanbul (35+27+34=96),
#                İzmir (14+14=28), Bursa (10+11=21)
# Not: İstanbul 3. Bölge için kaynaklar 36 veya 34 göstermektedir; orijinal
# İstanbul=96 toplamı korunmak üzere 34 kullanılmıştır (35+27+34=96).
VEKIL_SAYILARI = {
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
}

BOLGELI_ILLER = {
    "Ankara":   ["Ankara 1. Bölge",   "Ankara 2. Bölge",   "Ankara 3. Bölge"],
    "İstanbul": ["İstanbul 1. Bölge", "İstanbul 2. Bölge", "İstanbul 3. Bölge"],
    "İzmir":    ["İzmir 1. Bölge",    "İzmir 2. Bölge"],
    "Bursa":    ["Bursa 1. Bölge",    "Bursa 2. Bölge"],
}

ANKARA_BOLGELERI = BOLGELI_ILLER["Ankara"]
