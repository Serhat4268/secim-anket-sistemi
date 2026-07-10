"""D'Hondt (Türkiye'de kullanılan) sandalye dağıtım yöntemi.

Türkiye'deki milletvekili seçimlerinde her seçim bölgesindeki koltuklar
D'Hondt yöntemiyle dağıtılır: her partinin oyu sırasıyla 1, 2, 3, ...
sayılarına bölünür, çıkan tüm bölüm değerleri büyükten küçüğe sıralanır
ve en büyük "toplam koltuk" kadar bölüm değerine sahip parti o koltuğu
kazanır.
"""


def dhondt_dagit(oy_sayilari: dict, toplam_koltuk: int) -> dict:
    """
    oy_sayilari: {"AK Parti": 1200, "CHP": 900, ...}
    toplam_koltuk: bu bölgeden çıkacak toplam milletvekili sayısı

    Dönüş: {"AK Parti": 3, "CHP": 2, ...} (oy_sayilari ile aynı anahtarlar,
    oy almayanlar da dahil olmak üzere 0 ile başlar)
    """
    sonuc = {parti: 0 for parti in oy_sayilari}

    if toplam_koltuk <= 0:
        return sonuc

    bolumler = []
    for parti, oy in oy_sayilari.items():
        if oy <= 0:
            continue
        for bolen in range(1, toplam_koltuk + 1):
            bolumler.append((oy / bolen, parti))

    bolumler.sort(key=lambda x: x[0], reverse=True)

    for _, parti in bolumler[:toplam_koltuk]:
        sonuc[parti] += 1

    return sonuc
