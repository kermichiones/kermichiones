import numpy as np
from PIL import Image
from collections import deque

CW      = 296          # source cell width  (1184 / 4)
FW, FH  = 16, 32       # output frame
INK_T   = 232          # source: below this on any channel = ink
BG_T    = 228          # result: at/above this on all channels = page white
NB      = 72

# the three clean rows of each sheet: front / profile / back
# Kaynak: AI ile uretilmis 1184x3482 sayfalar (bu klasorde).
# Adlar '_' ile basliyor ki Jekyll bu dosyalari yayina kopyalamasin.
# ROWS  = her sayfadaki temiz uc satirin dikey siniri (on / profil / arka)
# PERIOD = o sayfanin dogal piksel blogu; olculdu, tahmin degil
SRC    = {'a': '_src-sheet-him.jpg', 'b': '_src-sheet-her.jpg'}
ROWS   = {'a': [(93,624),(747,1277),(1399,1926)],
          'b': [(88,590),(707,1209),(1324,1827)]}
PERIOD = {'a': 20.40, 'b': 19.32}
OUT    = {'a': 'ahmet', 'b': 'sevgili'}

# ---------------------------------------------------------------- grid helpers
def edge_profile(im, axis):
    d = np.abs(np.diff(im, axis=axis)).sum(axis=(1-axis, 2)).astype(float)
    m = np.zeros_like(d, bool)
    m[1:-1] = (d[1:-1] >= d[:-2]) & (d[1:-1] >= d[2:])
    d = np.where(m, d, 0.0)
    return d / (d.max() or 1.0)

def phase_of(prof, p):
    """sub-pixel offset of the native pixel grid inside this strip"""
    nz  = np.nonzero(prof)[0]
    if len(nz) < 3: return 0.0
    idx = nz.astype(float) + 0.5
    b   = ((idx % p) / p * NB).astype(int) % NB
    h   = np.bincount(b, weights=prof[nz], minlength=NB)
    k   = np.array([.5,1.,.5]); k /= k.sum()
    h   = np.convolve(np.r_[h[-1:], h, h[:1]], k, 'same')[1:-1]
    return (h.argmax() + 0.5) / NB * p

def bbox(mask):
    ys, xs = np.nonzero(mask)
    return (xs.min(), xs.max(), ys.min(), ys.max()) if len(ys) else None

# ------------------------------------------------------- native-grid resample
def native(cell, p):
    """Hucreyi dogal piksel blogunun merkezinden ornekle.

    Izgara fazi (px/py) sifir degilse hucrenin kenarindaki blok yarim kalir.
    O yarim bloklar da ornege dahil edilir -- aksi halde sacin en ust sirasi
    kareye gore bazen dusup bazen kalir ve yuruyuste kafa kirpilir.
    """
    ch, cw = cell.shape[:2]
    px = phase_of(edge_profile(cell, 1), p)
    py = phase_of(edge_profile(cell, 0), p)
    inset = p * 0.25                              # ic yarinin medyani
    MIN = p * 0.4                                 # bundan ince kenar blogu atlanir

    def band(n, phase, limit):
        """kullanilabilir blok araligi + ornekleme penceresi listesi"""
        out = []
        j = int(np.floor(-phase / p)) - 1
        while phase + j * p < limit:
            lo, hi = phase + j*p, phase + (j+1)*p
            c0, c1 = max(0.0, lo), min(float(limit), hi)
            if c1 - c0 >= MIN:
                s0 = int(round(max(c0, lo + inset)))
                s1 = int(round(min(c1, hi - inset)))
                out.append((max(0, s0), min(limit, max(s0 + 1, s1))))
            j += 1
        return out

    rows = band(ch, py, ch)
    cols = band(cw, px, cw)
    rgb = np.zeros((len(rows), len(cols), 3), np.uint8)
    for j,(a0,a1) in enumerate(rows):
        for i,(b0,b1) in enumerate(cols):
            rgb[j, i] = np.median(cell[a0:a1, b0:b1].reshape(-1, 3), axis=0)
    return rgb

def flood_bg(rgb):
    """alpha 0 for page-white reachable from the border (keeps eye whites)"""
    h, w = rgb.shape[:2]
    isbg = (rgb >= BG_T).all(axis=2)
    alpha = np.full((h, w), 255, np.uint8)
    seen = np.zeros((h, w), bool); q = deque()
    for y in range(h):
        for x in (0, w-1):
            if isbg[y,x] and not seen[y,x]: seen[y,x]=True; q.append((y,x))
    for x in range(w):
        for y in (0, h-1):
            if isbg[y,x] and not seen[y,x]: seen[y,x]=True; q.append((y,x))
    while q:
        y,x = q.popleft(); alpha[y,x] = 0
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny_,nx_ = y+dy, x+dx
            if 0<=ny_<h and 0<=nx_<w and isbg[ny_,nx_] and not seen[ny_,nx_]:
                seen[ny_,nx_]=True; q.append((ny_,nx_))
    return alpha

def largest_blob(alpha):
    """Sadece en buyuk bagli lekeyi tut.

    Hucre kenarindaki yarim bloklar komsu karakterden birkac piksel
    kopya alabiliyor; bunlar figure bagli olmadigi icin burada dusuyor.
    """
    h, w = alpha.shape
    seen = np.zeros((h, w), np.int32)
    best, best_n = 0, 0
    lab = 0
    for sy in range(h):
        for sx in range(w):
            if alpha[sy, sx] == 0 or seen[sy, sx]: continue
            lab += 1; n = 0
            q = deque([(sy, sx)]); seen[sy, sx] = lab
            while q:
                y, x = q.popleft(); n += 1
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny_, nx_ = y+dy, x+dx
                        if 0 <= ny_ < h and 0 <= nx_ < w and alpha[ny_, nx_] and not seen[ny_, nx_]:
                            seen[ny_, nx_] = lab; q.append((ny_, nx_))
            if n > best_n: best, best_n = lab, n
    return np.where(seen == best, alpha, np.uint8(0))


def place(spr):
    """16x32 kareye yerlestir: ayaklar en alt satirda, kafa merkezi yatayda ortada"""
    sh, sw = spr.shape[:2]
    hb = bbox(spr[:max(1, sh//4), :, 3] > 0)      # kafa = figurun ust ceyregi
    head_cx = (hb[0] + hb[1] + 1) / 2.0
    ox = int(round(FW/2 - head_cx))
    oy = FH - sh                                  # ayaklar en alt satira
    ox = max(0, min(FW - sw, ox)); oy = max(0, oy)
    dst = np.zeros((FH, FW, 4), np.uint8)
    dst[oy:oy+min(sh,FH-oy), ox:ox+min(sw,FW-ox)] = spr[:FH-oy, :FW-ox]
    return dst

# ------------------------------------------------------------------- assemble
def build(name):
    src = np.asarray(Image.open(SRC[name]).convert('RGB')).astype(np.int32)
    p    = PERIOD[name]
    sheet = np.zeros((FH*4, FW*4, 4), np.uint8)
    stats, profile_sprites = [], {}
    for ri,(y0,y1) in enumerate(ROWS[name]):
        for ci in range(4):
            cell = src[y0:y1+1, ci*CW:(ci+1)*CW]
            rgb  = native(cell, p)
            a    = largest_blob(flood_bg(rgb))
            bb   = bbox(a > 0)
            if bb is None: continue
            x0,x1,ny0,ny1 = bb
            spr  = np.dstack([rgb, a])[ny0:ny1+1, x0:x1+1]
            sheet[ri*FH:(ri+1)*FH, ci*FW:(ci+1)*FW] = place(spr)
            stats.append((ri, ci, spr.shape[1], spr.shape[0]))
            if ri == 1: profile_sprites[ci] = spr

    # Satir 3 = sol profil: satir 1'in aynasi. Her kare TEK TEK aynalanir --
    # tum seridi birden aynalamak sutun sirasini da ters cevirirdi (0<->3, 1<->2),
    # yani "dik durus" karesi adim karesine kayardi.
    for ci, spr in profile_sprites.items():
        sheet[3*FH:4*FH, ci*FW:(ci+1)*FW] = place(spr[:, ::-1])
    return sheet, stats

for n in ('a','b'):
    sheet, stats = build(n)
    Image.fromarray(sheet,'RGBA').save(OUT[n]+'.png')
    print('==', OUT[n]+'.png  64x128  (satir,sutun,genislik,yukseklik):')
    print('  ', stats)
