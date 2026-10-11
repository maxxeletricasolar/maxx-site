# Gera img/og/<id>.jpg (1200x630) para o og:image das paginas de produto, categoria e artigo e ajusta o meta.
# Facebook/WhatsApp lidam mal com WebP e com imagem pequena: foto pequena ou muito alongada (tabela) usa img/og-maxx.jpg.
# Idempotente: so mexe em paginas cujo og:image ainda aponta para img/catalogo/*.webp.
# Uso (da raiz do repositorio): python3 tools/og-produtos.py
import glob, os, re
from PIL import Image
BASE = 'https://maxxeletricasolar.com.br/'
os.makedirs('img/og', exist_ok=True)
feitos = padrao = 0
for pg in sorted(glob.glob('produtos/*.html') + glob.glob('categorias/*.html') + glob.glob('guias/*.html')):
    t = open(pg, encoding='utf8', newline='').read()
    m = re.search(r'(<meta property="og:image" content=")' + re.escape(BASE) + r'(img/catalogo/[^"]+)(">)', t)
    if not m:
        continue
    im = Image.open(m.group(2)).convert('RGB')
    w, h = im.size
    if min(w, h) < 300 or w / h > 2.5 or h / w > 2.5:
        novo = 'img/og-maxx.jpg'; padrao += 1
    else:
        novo = 'img/og/' + os.path.basename(pg)[:-5] + '.jpg'  # ids de produto, categoria e guia nao se repetem
        tela = Image.new('RGB', (1200, 630), (255, 255, 255))
        k = min(1000 / w, 550 / h, 2.0)
        im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        tela.paste(im, ((1200 - im.width) // 2, (630 - im.height) // 2))
        tela.save(novo, 'JPEG', quality=84, optimize=True, progressive=True)
        feitos += 1
    meta = m.group(1) + BASE + novo + m.group(3)
    if 'og:image:width' not in t:
        meta += '\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">'
    nl = '\r\n' if '\r\n' in t else '\n'
    t = t[:m.start()] + meta.replace('\n', nl) + t[m.end():]
    open(pg, 'w', encoding='utf8', newline='').write(t)
print('fotos geradas:', feitos, '| usam og-maxx.jpg:', padrao)
