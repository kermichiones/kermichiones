"""Footer sahnesinin varliklarini uretir: iki dukkan cephesi + zemin levhasi.

Kaynaklar (bu klasorde): _src-him.jpg, _src-her.jpg -> 731x1024 dukkan cephesi
                         _src-background.jpg       -> 2730x1536 tepeden zemin
Adlar '_' ile basliyor ki Jekyll bu 3 MB'i yayina kopyalamasin.

Olcek nasil bulundu
-------------------
Karakter sprite'lari 26 oyun pikseli boyunda; bu sahnenin tek sabiti o.
Iki cephede de kapi, gorselin yuksekliginin %35-36'sini kapliyor (y %57-93).
Kapi karakterden biraz uzun olmali (~30 px), dolayisiyla cephe ~84 px:
    84 x 0.714 (731/1024) = 60 px genislik.

Zemin levhasinin olcegi ise yatayda kullanilabilir alandan cikiyor: kaynagin
sol ust kosesindeki kayalik ve alt soldaki gol dislaninca 1830 px kaliyor,
bu da 204 oyun pikseline denk (8.97 kaynak px = 1 oyun px). Ayni olcek
dikeyde de uygulanir, yoksa yol ezilir.

Uretilen dosyalar: shop-him.png (60x84), shop-her.png (60x84),
                   ground.png (204x96)
"""
import numpy as np
from PIL import Image
from collections import deque

SHOP_W, SHOP_H = 60, 84          # dukkan cephesi, oyun pikseli
STAGE_W, STAGE_H = 204, 96       # sahne, oyun pikseli
WHITE_T = 236                    # bunun uzeri "bos beyaz"
COVER = 0.42                     # cikti pikseli bu orandan fazlasi doluysa opak

# zemin kaynagindan kirpilacak alan: soldaki kayalik ve alttaki gol disarida
BG_X0, BG_Y1 = 900, 968
PATH_TOP_TARGET = 38             # yolun sahnedeki ust siniri (oyun px)


# --------------------------------------------------------------- yardimcilar
def key_white(im):
    """Kenardan ulasilabilen beyazi maskeler. Alt kenar haric -- cephe oraya
    dayaniyor. Icteki acik renkler (parsomen, cam) kapali oldugu icin kalir."""
    h, w = im.shape[:2]
    bg = (im > WHITE_T).all(axis=2)
    seen = np.zeros((h, w), bool)
    q = deque()
    for y in range(h):
        for x in (0, w - 1):
            if bg[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for x in range(w):
        if bg[0, x] and not seen[0, x]:
            seen[0, x] = True; q.append((0, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and bg[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return ~seen                                  # True = dolu


def shrink(im, opaque, ow, oh):
    """Alan medyani ile kucult. Medyan, ortalamanin aksine duz alanlari ve
    keskin kenarlari korur -- dogal piksel 3'e 1 azalirken onemli olan bu.
    Renk yalnizca dolu kaynak pikselleri uzerinden alinir, yoksa silueti
    beyaz bulastirir."""
    h, w = im.shape[:2]
    rgb = np.zeros((oh, ow, 3), np.uint8)
    alpha = np.zeros((oh, ow), np.uint8)
    ys = np.linspace(0, h, oh + 1)
    xs = np.linspace(0, w, ow + 1)
    for j in range(oh):
        a0, a1 = int(round(ys[j])), max(int(round(ys[j + 1])), int(round(ys[j])) + 1)
        for i in range(ow):
            b0, b1 = int(round(xs[i])), max(int(round(xs[i + 1])), int(round(xs[i])) + 1)
            m = opaque[a0:a1, b0:b1]
            if m.mean() < COVER:
                continue
            blk = im[a0:a1, b0:b1][m]
            rgb[j, i] = np.median(blk, axis=0)
            alpha[j, i] = 255
    return rgb, alpha


def outline_cut_edges(rgb, alpha, color):
    """Kaynakta cati yanlardan kesik; ciplak kesik yerine 1 px koyu kontur
    koyarsak kenar 'binanin kosesi' gibi okunur, 'kirpilmis' gibi degil."""
    h, w = alpha.shape
    for y in range(h):
        row = np.nonzero(alpha[y])[0]
        if not len(row):
            continue
        if row[0] == 0:
            rgb[y, 0] = color
        if row[-1] == w - 1:
            rgb[y, w - 1] = color
    top = np.nonzero(alpha[0])[0]
    for x in top:
        rgb[0, x] = color
    return rgb


def darkest(im, opaque):
    """Kontur rengi: binanin kendi en koyu tonlarinin medyani."""
    px = im[opaque]
    lum = px.astype(int).sum(axis=1)
    return np.median(px[lum <= np.percentile(lum, 1.5)], axis=0).astype(np.uint8)


# ------------------------------------------------------------------ dukkanlar
for src, out in (('_src-him.jpg', 'shop-him.png'), ('_src-her.jpg', 'shop-her.png')):
    im = np.asarray(Image.open(src).convert('RGB'))
    solid = key_white(im.astype(int))
    rgb, alpha = shrink(im, solid, SHOP_W, SHOP_H)
    rgb = outline_cut_edges(rgb, alpha, darkest(im, solid))
    Image.fromarray(np.dstack([rgb, alpha]), 'RGBA').save(out)
    ys = np.nonzero(alpha.any(axis=1))[0]
    print('%-14s %dx%d  dolu=%d px  govde y %d-%d' %
          (out, SHOP_W, SHOP_H, (alpha > 0).sum(), ys[0], ys[-1]))

# --------------------------------------------------------------------- zemin
bg = np.asarray(Image.open('_src-background.jpg').convert('RGB'))[:BG_Y1, BG_X0:]
sh, sw = bg.shape[:2]
scale = sw / STAGE_W                          # 1 oyun pikseli kac kaynak px
gh = int(round(sh / scale))
full = np.ones(bg.shape[:2], bool)
grd, _ = shrink(bg, full, STAGE_W, gh)

# kaynakta yol ustte; yolu ayak hattina indirmek icin ustune ayna cimen eklenir
r, g, b = grd[..., 0].astype(int), grd[..., 1].astype(int), grd[..., 2].astype(int)
dirt = ((r > g + 8) & (g > b + 20) & (r > 90)).mean(axis=1)
rows = np.nonzero(dirt > 0.35)[0]
path_top, path_bot = rows[0], rows[-1]
pad = PATH_TOP_TARGET - path_top
if pad > 0:
    donor = grd[path_bot + 14: path_bot + 14 + pad][::-1]      # alttan temiz cimen
    grd = np.vstack([donor, grd])
    path_top, path_bot = path_top + pad, path_bot + pad
grd = grd[:STAGE_H]
Image.fromarray(grd, 'RGB').save('ground.png')
print('ground.png     %dx%d  olcek=%.2f kaynak px/oyun px  yol y %d-%d'
      % (STAGE_W, STAGE_H, scale, path_top, path_bot))
print('               -> ayak hatti y=%d (yolun uzerinde)' % (path_bot - 2))
