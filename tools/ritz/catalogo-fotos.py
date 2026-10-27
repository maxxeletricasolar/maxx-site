# Extrai as fotos do Catalogo de Produtos Ritz (PDF) para img/catalogo/r<pag>-<n>.webp, em resolucao original e com fundo branco.
# Registra em tools/ritz/fotos-<grupo>.json a pagina, o tamanho e a REFERENCIA da coluna logo abaixo de cada foto (quando houver).
# Precisa de: pip install pymupdf pillow. Uso: python3 tools/ritz/catalogo-fotos.py <catalogo.pdf> <grupo> <pag-inicial> <pag-final> [proporcao-maxima]
# proporcao-maxima (padrao 4): use 14 em linhas com bastoes compridos (ex.: B); acima de 4:1 o lado menor pode ter so 40 px.
import fitz, re, json, hashlib, sys, os
from PIL import Image
pdf, grupo, p0, p1 = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
MAXA = float(sys.argv[5]) if len(sys.argv) > 5 else 4.0
doc = fitz.open(pdf)
RE_REF = re.compile(r'^(?:[A-Z]{2,4}\d{3,6}[A-Z]?(?:-\d+[A-Z]*)?|CT[AC]-\d+|[A-Z]{2,4}/[A-Z-]+)$')
os.makedirs('img/catalogo', exist_ok=True)
out, vistos, pagrefs = [], {}, {}
for pn in range(p0, p1 + 1):
    pg = doc[pn - 1]; W, H = pg.rect.width, pg.rect.height
    refs = [w for w in pg.get_text('words') if RE_REF.match(w[4].strip(',;()'))]
    pagrefs[pn] = sorted({w[4].strip(',;()') for w in refs})
    n = 0
    for info in sorted(pg.get_images(full=True), key=lambda i: (round((pg.get_image_rects(i[0]) or [fitz.Rect(0,0,0,0)])[0].y0 / 40), (pg.get_image_rects(i[0]) or [fitz.Rect(0,0,0,0)])[0].x0)):
        xref, smask = info[0], info[1]
        rects = pg.get_image_rects(xref)
        if not rects: continue
        r = rects[0]
        try:
            pix = fitz.Pixmap(doc, xref)
            if smask:
                m = fitz.Pixmap(doc, smask)
                if (m.width, m.height) == (pix.width, pix.height): pix = fitz.Pixmap(pix, m)
            if pix.colorspace is None or pix.colorspace.n not in (1, 3): pix = fitz.Pixmap(fitz.csRGB, pix)
            im = Image.frombytes('RGBA' if pix.alpha else ('L' if pix.n == 1 else 'RGB'), (pix.width, pix.height), pix.samples)
        except Exception:
            continue
        w, h = im.size
        asp = max(w / h, h / w)
        if min(w, h) < (40 if asp > 4 else 80) or asp > MAXA or r.width * r.height > 0.6 * W * H: continue
        if im.mode in ('RGBA', 'LA'):
            bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
        else:
            im = im.convert('RGB')
        hs = hashlib.md5(im.tobytes()).hexdigest()
        if hs in vistos:  # mesma foto repetida em outra pagina
            continue
        cx = (r.x0 + r.x1) / 2
        cand = [t for t in refs if r.y1 - 2 <= t[1] <= r.y1 + 330 and t[0] - 10 <= r.x1 and t[2] + 10 >= r.x0]
        cand.sort(key=lambda t: (abs((t[0] + t[2]) / 2 - cx), t[1]))
        ref = cand[0][4].strip(',;()') if cand and abs((cand[0][0] + cand[0][2]) / 2 - cx) < max(60, r.width) else ''
        n += 1
        arq = f'img/catalogo/r{pn:03d}-{n}.webp'
        im.save(arq, 'WEBP', quality=88, method=6)
        vistos[hs] = arq
        out.append({'pag': pn, 'arq': arq, 'w': w, 'h': h, 'ref': ref, 'y': round(r.y0), 'x': round(r.x0)})
json.dump({'fotos': out, 'paginas': pagrefs}, open(f'tools/ritz/fotos-{grupo}.json', 'w'), ensure_ascii=False, indent=0)
print(len(out), 'fotos;', sum(1 for o in out if o['ref']), 'com referencia;', round(sum(os.path.getsize(o['arq']) for o in out) / 1e6, 1), 'MB')
