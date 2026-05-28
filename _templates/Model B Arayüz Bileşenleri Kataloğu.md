# 🎨 Model B Arayüz Bileşenleri Kataloğu

Bu katalog, sitenizin yeni **Model B (Aldine Split-Screen Renaissance)** tasarımıyla tam uyumlu, zengin ve premium HTML bileşenlerini içerir. Yazılarınızı yazarken dilediğiniz bileşeni buradan kopyalayıp doğrudan notunuzun içine yapıştırabilirsiniz.

---

## 1. 🔠 Görkemli Giriş Harfi (Drop Cap)
Paragrafınızın ilk harfini klasik matbaa tarzında büyük ve crimson/gold renginde başlatır.

### Kod Şablonu:
```html
<p class="drop-cap">Paragrafınızın ilk harfi buraya, kelimenin geri kalanı ise buraya gelecek...</p>
```

---

## 2. 💡 Akademik Bilgi ve Vurgu Kartı (Academic Card)
Özel notları, uyarıları veya önemli referansları metinden ayırarak şık bir kart içerisinde vurgular.

### Kod Şablonu:
```html
<div class="academic-card">
    <div class="academic-card-header">💡 BAŞLIK BURAYA</div>
    Kartın içerik metnini buraya yazabilirsiniz. Tema-uyumlu arka planı ve sol vurgu çizgisi ile dikkat çeker.
</div>
```

---

## 3. 🏷️ Kontrast Vurgu Başlığı (Highlight Header)
Hakkımda sayfasındaki donanım başlıklarında kullanılan, yüksek kontrastlı ve tema renginde (Crimson/Gold) arka plana sahip şık etiket başlığı.

### Kod Şablonu:
```html
<div class="highlight-header">🛠️ BÖLÜM ETİKETİ</div>
```

---

## 4. 📈 Proje Zaman Çizelgesi (Academic Timeline)
Projelerinizin aşamalarını, geliştirme süreçlerini veya günlük loglarını estetik bir dikey çizgi ve halkalarla sergilemenizi sağlar.

### Kod Şablonu:
```html
<div class="academic-timeline">
    <div class="timeline-item">
        <div class="timeline-date">AŞAMA 1 — TARİH VEYA ETİKET</div>
        <div class="timeline-title">Aşama Başlığı</div>
        <p>Aşamanın detaylı açıklaması ve yapılan geliştirmeler buraya gelir.</p>
    </div>
    <div class="timeline-item">
        <div class="timeline-date">AŞAMA 2 — TARİH VEYA ETİKET</div>
        <div class="timeline-title">Aşama Başlığı</div>
        <p>Aşamanın detaylı açıklaması ve yapılan geliştirmeler buraya gelir.</p>
    </div>
</div>
```

---

## 📸 5. Estetik Görsel Çerçevesi (Clean Figure)
Jekyll sitenizdeki görsel dosyalarınıza ince sepia sınır çizgileri, dengeli dış boşluklar ve italik alt açıklamalar kazandırır.

### Kod Şablonu:
```html
<figure class="clean-figure">
    <img src="/assets/images/resim_dosya_adi.png" alt="Açıklama">
    <figcaption>Görselin altında görüntülenecek estetik alt açıklama metni.</figcaption>
</figure>
```

---

## 🎥 6. Premium Video Oynatıcı (Clean Video)
Videolarınızı web sitenizin serif tarzına uygun ince sınır çizgileri ve yumuşak kenar gölgeleriyle oynatır.

### Kod Şablonu:
```html
<div style="text-align: center; margin: 30px 0;">
    <video controls style="max-width: 100%; width: 650px; height: auto; border-radius: 8px; box-shadow: 0 8px 24px rgba(143, 58, 43, 0.12); border: 1px solid var(--border-color);">
        <source src="/assets/videos/video_dosya_adi.mp4" type="video/mp4">
        Tarayıcınız video oynatmayı desteklemiyor.
    </video>
</div>
```
