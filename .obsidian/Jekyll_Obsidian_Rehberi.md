# 🖋️ Obsidian & Jekyll Blog Yazma Rehberi

Bu blog projesi için Obsidian ayarlarınız **kusursuz ve en hızlı iş akışını sağlayacak şekilde** optimize edildi! Artık yazı yazmak, görsel eklemek ve bunları yayınlamak son derece kolay.

---

## 🚀 Öne Çıkan Kolaylıklar

### 1. 📂 Otomatik Görsel ve Dosya Yönetimi
*   Obsidian editörüne **sürükleyip bıraktığınız veya yapıştırdığınız (Ctrl+V)** tüm resimler, ekran görüntüleri veya fotoğraflar otomatik olarak `assets/images/` klasörünün altına kaydedilir.
*   Linkleme formatı Jekyll ile tam uyumlu standart Markdown formatında (`[Görsel](path)`) otomatik dönüştürülür.
*   **İpucu:** Yazılarınızda resimlerin ve videoların yeni **Model B (Serif Dark Academia)** tasarımıyla (estetik gölgeler, yumuşak kenarlar) uyumlu görünmesi için şablonlardaki HTML bloklarını kullanabilirsiniz.

### 2. 📝 Yeni Yazıların Otomatik Klasörlenmesi
*   Obsidian'da oluşturduğunuz her yeni not, hiçbir şey yapmanıza gerek kalmadan doğrudan **`_posts/`** klasörü altında oluşturulur.
*   **Önemli Kural:** Jekyll'ın yazıyı tanıyabilmesi için oluşturduğunuz dosya ismini **`YYYY-MM-DD-yazi-basligi.md`** formatında (örneğin: `2026-05-28-yeni-deneyimler.md`) adlandırmanız gerekir.

### 3. ⚡ Hazır Jekyll Şablonları (Templates)
Yeni bir yazıya başlarken boş sayfa doldurmak yerine hazır şablonları kullanabilirsiniz:
1.  Boş bir not oluşturun (dosya adını `YYYY-MM-DD-yazi.md` yapın).
2.  Obsidian sol menüdeki **Templates** simgesine tıklayın (veya `Alt + T` kısayolunu kullanın ya da `Ctrl + P` basıp `Templates: Insert template` aratın).
3.  Karşınıza gelen seçeneklerden birini seçin:
    *   **Yeni Günlük Yazısı (Post):** Standart günlük yazıları için ön yazı bilgileri (front-matter) ve estetik görsel/video HTML şablonları içerir.
    *   **Yeni Proje Yazısı (Project):** Donanım (Pico, ESP32 vb.), yazılım, kod inceleme linki ve proje mottosu eklemek için optimize edilmiş kapsamlı portfolyo şablonudur.

---

## 🎨 Model B Estetiğine Uygun Medya Ekleme Şablonları

Şablonlarda da ekli olan aşağıdaki kod blokları sayesinde resimlerinizi ve videolarınızı sitenizde harika bir şekilde sergileyebilirsiniz:

### Uyumlu Resim Şablonu:
```html
<div style="text-align: center; margin: 30px 0;">
    <img src="/assets/images/resim_adi.png" alt="Açıklama" style="max-width: 100%; width: 550px; height: auto; border-radius: 8px; box-shadow: 0 8px 24px rgba(143, 58, 43, 0.12); border: 1px solid var(--border-color);">
</div>
```

### Uyumlu Video Şablonu:
```html
<div style="text-align: center; margin: 30px 0;">
    <video controls style="max-width: 100%; width: 650px; height: auto; border-radius: 8px; box-shadow: 0 8px 24px rgba(143, 58, 43, 0.12); border: 1px solid var(--border-color);">
        <source src="/assets/videos/video_adi.mp4" type="video/mp4">
        Tarayıcınız video etiketini desteklemiyor.
    </video>
</div>
```

---

## 📤 Yazıyı Yayına Almak İçin Son Adımlar
Yazınızı Obsidian'da tamamladıktan sonra terminalden veya VS Code/Git aracından şu komutları koşturmanız yeterlidir:
```bash
git add .
git commit -m "yeni yazi: yazi basligi"
git push origin main
```
Web siteniz saniyeler içinde yeni yazınızla birlikte güncellenecektir! 🚀
