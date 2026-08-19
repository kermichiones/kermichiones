---
layout: post
title: "{{title}}"
date: {{date}}
description: "Kaydin ozeti: makale sayfasinda 'Ozet' bolumunde gorunur, arama sonuclarinda da kullanilir."
tags: [etiket-1, etiket-2]
highlights:
  - "Ilk one cikan bulgu veya cumle."
  - "Ikinci one cikan nokta."
---

<p class="drop-cap">Giris paragrafinizin ilk harfi otomatik olarak buyuk ve turuncu goruntulenir. Devam eden metni buraya yazabilirsiniz.</p>

Yazinin geri kalanini standart markdown ile yazabilirsiniz. `##` ile actiginiz basliklar makale sayfasinda **otomatik olarak numaralandirilir** (1., 2., ...) ve sol taraftaki "Icerik" anahatinda listelenir.

## Ilk bolum

Alt basliklar (`###`) 1.1., 1.2. seklinde numaralanir.

### Alt bolum

Metin, gorsel ve tablolari serbestce kullanabilirsiniz.

## Gorseller

Markdown ile eklenen her gorsel otomatik olarak "Sekil n." basligi alir; `alt` metni sekil aciklamasi olarak kullanilir:

![Sekil aciklamasi buraya yazilir, altyazi olarak gorunur.](/assets/images/resim_adi.png)

Kendi altyazinizi yazmak isterseniz:

<figure class="clean-figure">
    <img src="/assets/images/resim_adi.png" alt="Aciklama metni">
    <figcaption>Gorselin altindaki aciklama yazisi.</figcaption>
</figure>

## Vurgu bileşenleri

> "Hayat, spesifik seylerden spesifik bir hal bekleyemeyecek kadar kisa."
> — *Ahmet Arvas*

<div class="academic-card">
    <div class="academic-card-header">Not</div>
    Vurgulamak istediginiz bilgi kutusu. Sol kenarindaki turuncu cizgi ile one cikar.
</div>

## Tablo

| Deneme | Sonuc | Not |
|--------|-------|-----|
| 1      | 82 m  | stabil |
| 2      | 96 m  | hafif salinim |
