# UTF-8 encoding configuration
$OutputEncoding = [System.Text.Encoding]::UTF8

# Clear console
Clear-Host

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "         ✨ JEKYLL YAZI VE PROJE OLUŞTURUCU ✨   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Yazı Başlığı Alınır
$title = Read-Host "📝 Yazı Başlığını Girin (Örn: Pin 1988 Film İncelemesi)"
if ([string]::IsNullOrWhiteSpace($title)) {
    Write-Host "❌ Hata: Başlık boş olamaz!" -ForegroundColor Red
    Write-Host "Çıkış yapılıyor..."
    Start-Sleep -Seconds 3
    exit
}

# 2. Yazı Türü Seçilir
Write-Host ""
Write-Host "📂 Yazı Türünü Seçin:" -ForegroundColor Yellow
Write-Host "  [1] Günlük Yazısı (Post - _posts/ klasörüne gider)"
Write-Host "  [2] Proje Yazısı (Project - _projects/ klasörüne gider)"
$choice = Read-Host "Seçiminiz [Varsayılan: 1]"

if ($choice -eq "2") {
    $dir = "_projects"
    $templatePath = "_templates/Yeni Proje Yazısı (Project).md"
    $typeLabel = "Proje Yazısı"
} else {
    $dir = "_posts"
    $templatePath = "_templates/Yeni Günlük Yazısı (Post).md"
    $typeLabel = "Günlük Yazısı"
}

# 3. Tarih Alınır
$date = Get-Date -Format "yyyy-MM-dd"

# 4. Slugify (Türkçe karakterleri dönüştürerek temiz dosya adı oluşturma)
$slug = $title.ToLower()
$slug = $slug -replace 'ı','i' -replace 'ş','s' -replace 'ğ','g' -replace 'ö','o' -replace 'ü','u' -replace 'ç','c'
$slug = $slug -replace '[^a-z0-9\s-]',''
$slug = $slug -replace '[\s-]+','-'
$slug = $slug.Trim('-')

if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "yazi"
}

$filename = "$date-$slug.md"
$targetPath = Join-Path $dir $filename

# 5. Dosya Kontrolü
if (Test-Path $targetPath) {
    Write-Host "❌ Hata: Bu isimde bir yazı zaten mevcut! ($targetPath)" -ForegroundColor Red
    Start-Sleep -Seconds 5
    exit
}

# 6. Klasör Yoksa Oluştur
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

# 7. Şablonu Oku ve Değişkenleri Yaz
if (Test-Path $templatePath) {
    $content = Get-Content $templatePath -Raw -Encoding utf8
    $content = $content -replace '\{\{title\}\}', $title
    $content = $content -replace '\{\{date\}\}', $date
    
    # Dosyayı UTF-8 (BOM'suz) kaydet
    [System.IO.File]::WriteAllLines((Resolve-Path .).Path + "/$dir/$filename", $content, (New-Object System.Text.UTF8Encoding($false)))
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  🎉 BAŞARIYLA OLUŞTURULDU!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  📂 Tür: $typeLabel"
    Write-Host "  📄 Konum: $targetPath"
    Write-Host "  🏷️ Başlık: $title"
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    
    # Dosyayı sistemin varsayılan Markdown editörüyle (Obsidian) açmayı dene
    Start-Process $targetPath
} else {
    Write-Host "❌ Hata: Şablon bulunamadı! ($templatePath)" -ForegroundColor Red
    Start-Sleep -Seconds 5
    exit
}

Start-Sleep -Seconds 3
