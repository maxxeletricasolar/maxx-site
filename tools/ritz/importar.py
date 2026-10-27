# Aplica uma linha Ritz (grupo) ao site: catalogo, paginas de produto, listagens, busca, sitemap, home e redirecionamentos.
# Entradas (em tools/ritz/): <G>.json (produtos, ordem e descricoes), fornecedor-<G>.json (referencias e tabelas), fotos-<G>.json (catalogo-fotos.py).
# Uso (da raiz do repositorio): python3 tools/ritz/importar.py A      Depois: ver a lista de comandos no CLAUDE.md (regra 18).
import json, re, sys, os, unicodedata, html as H

G = sys.argv[1]
BASE = 'https://maxxeletricasolar.com.br/'
spec = json.load(open(f'tools/ritz/{G}.json', encoding='utf-8'))
forn = json.load(open(f'tools/ritz/fornecedor-{G}.json', encoding='utf-8'))
_f = json.load(open(f'tools/ritz/fotos-{G}.json', encoding='utf-8'))
fotos = _f['fotos']; refs_pag = {int(k): v for k, v in _f['paginas'].items()}
manuais = spec.get('fotos_manuais', {}); descartar = set(spec.get('descartar', [])); dpg = spec.get('descartar_paginas', [0, -1])
bn = lambda a: a.split('/')[-1]
reivindicadas = {bn(a) for l in manuais.values() for a in l}
HOJE = '2026-10-20'

def ler(p): return open(p, encoding='utf-8', newline='').read()
def gravar(p, t): open(p, 'w', encoding='utf-8', newline='').write(t)
def esc(s): return H.escape(str(s), quote=True)
def semacento(s): return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
def slug(s): return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', semacento(s).lower())).strip('-')
def norm(s): return re.sub(r'[^A-Z0-9]', '', s.upper())
def kn(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', semacento(s).lower())).strip()

# ---------- catalogo ----------
import subprocess
src = subprocess.run(['git', 'show', 'HEAD:assets/catalogo-data.js'], capture_output=True, text=True, encoding='utf-8').stdout
cat = json.loads(re.match(r'^window\.__CAT=(.*);\s*$', src, re.S).group(1))
grupo = next(g for g in cat['grupos'] if g['id'] == G)
antigos = {p['id']: p for p in cat['produtos']}
LINHA = {g['id'] for g in cat['grupos'] if g.get('tipo') == 'linha-viva'}
total_antes = sum(1 for p in cat['produtos'] if p['g'] in LINHA)

regs = []
for s in spec['produtos']:
    if s['slug'] == 'ours':
        regs.append({'extra': True, 'p': antigos[s['id']]}); continue
    f = forn[s['slug']]
    nome = s['nome'] or (antigos[s['id']]['nome'] if s['id'] else f['nome'])
    pid = s['id'] or f'{G.lower()}-{slug(nome)}'
    velho = antigos.get(pid)
    refs = list(dict.fromkeys(((velho or {}).get('refs') or []) + f['refs']))
    tabelas = (velho or {}).get('tabelas') or ([[['Referência', 'Característica']] + f['rows']] if f['rows'] else [])
    regs.append({'extra': False, 'id': pid, 'nome': nome, 'velho': velho, 'refs': refs, 'rows': {norm(r[0]) for r in f['rows']},
                 'tabelas': tabelas, 'desc': s['descricao'], 'imgs': []})
extras_ids = {r['p']['id'] for r in regs if r['extra']}

# fotos -> produtos: pela referencia (quem a tem na tabela do fornecedor vem primeiro); sem referencia, pelo dono da pagina
donos = [r for r in regs if not r['extra']]
def dono_da_ref(ref):
    n = norm(ref)
    c = [r for r in donos if n in r['rows']] or [r for r in donos if n in {norm(x) for x in r['refs']}]
    return min(c, key=lambda r: len(r['refs'])) if c else None
fotos = [f for f in fotos if not (dpg[0] <= f['pag'] <= dpg[1] or bn(f['arq']) in descartar or bn(f['arq']) in reivindicadas)]
por_pag = {}
for ft in fotos:
    ft['dono'] = dono_da_ref(ft['ref']) if ft['ref'] else None
    if ft['dono']: por_pag.setdefault(ft['pag'], []).append(ft['dono']['id'])
sem_dono = []
for ft in fotos:
    if ft['dono']: continue
    c = por_pag.get(ft['pag'])
    pr = {norm(x) for x in refs_pag.get(ft['pag'], [])}
    por_texto = sorted(((len(pr & r['rows']) or len(pr & {norm(x) for x in r['refs']}), r) for r in donos), key=lambda x: -x[0])
    if c:
        ft['dono'] = next(r for r in donos if r['id'] == max(set(c), key=c.count))
    elif por_texto and por_texto[0][0] > 0 and (len(por_texto) < 2 or por_texto[1][0] < por_texto[0][0]):
        ft['dono'] = por_texto[0][1]
    else:
        cands = [r for r in donos if r['velho'] and ft['pag'] in (r['velho'].get('paginas') or [])]
        if len(cands) == 1: ft['dono'] = cands[0]
        else: sem_dono.append(ft)
for ft in sorted(fotos, key=lambda f: (0 if f['ref'] else 1, f['pag'], f['y'], f['x'])):
    d = ft['dono']
    if d and ft['arq'] not in d['imgs'] and len(d['imgs']) < 10: d['imgs'].append(ft['arq'])

for r in donos:
    if r['id'] in manuais: r['imgs'] = ['img/catalogo/' + a for a in manuais[r['id']]]
novos = []
for r in regs:
    if r['extra']: novos.append(r['p']); continue
    v = r['velho']; imgs = r['imgs'] or ((v or {}).get('imgs') or [])
    pgs = sorted({f['pag'] for f in fotos if f['dono'] is r} | {int(a[1:4]) for a in manuais.get(r['id'], [])}) or [grupo['pag']]
    novos.append({'id': r['id'], 'g': G, 'nome': r['nome'], 'pag': (v or {}).get('pag') or pgs[0], 'paginas': (v or {}).get('paginas') or pgs,
                  'conteudo': [{'t': 'p', 'x': x} for x in r['desc']] if r['desc'] else (v or {}).get('conteudo', []),  # sem descricao nova: mantem a atual
                  'tabelas': r['tabelas'], 'refs': r['refs'],
                  'normas': (v or {}).get('normas', []), 'imgs': imgs, 'marca': 'Ritz', 'info': (v or {}).get('info', False)})
ids_novos = [p['id'] for p in novos]
P = {p['id']: p for p in novos}
aposentar = [i for i in spec['aposentar'] if i in antigos]
primeiro = next(i for i, p in enumerate(cat['produtos']) if p['g'] == G)
cat['produtos'] = [p for p in cat['produtos'][:primeiro] if p['g'] != G] + novos + [p for p in cat['produtos'][primeiro:] if p['g'] != G]
grupo['total'] = len(novos)
gravar('assets/catalogo-data.js', 'window.__CAT=' + json.dumps(cat, ensure_ascii=False, separators=(',', ':')) + ';\n')
total = sum(1 for p in cat['produtos'] if p['g'] in LINHA)
NOME_G = grupo['nome']; SLUG_G = grupo['slug']

def primeira_foto(p): return p['imgs'][0] if p['imgs'] else ''
def resumo(p, n=140):
    t = p['conteudo'][0]['x'] if p['conteudo'] else ''
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0].rstrip(' ,.;:') + '…'


# ---------- tabelas dos produtos novos (formato "curado" de tools/tabelas-curadas.json) ----------
cur_arq = 'tools/tabelas-curadas.json'
cur = json.loads(ler(cur_arq))
for r in donos:
    if r['velho'] and r['velho'].get('tabelas'): continue
    rows = forn[next(s['slug'] for s in spec['produtos'] if s['slug'] != 'ours' and (s['id'] or f"{G.lower()}-{slug(s['nome'] or forn[s['slug']]['nome'])}") == r['id'])]['rows']
    if not rows: continue
    cur[r['id']] = {'0': {'legenda': '', 'cols': ['Referência', 'Característica'], 'rows': [list(x) for x in rows], 'refCol': 0, 'tensaoCol': -1,
                          'conferida': HOJE + ' (site do fabricante; validar com a equipe)'}}
gravar(cur_arq, json.dumps(cur, ensure_ascii=False, indent=1) + '\n')

# ---------- paginas de produto ----------
modelo = ler('tools/ritz/modelo-produto.html')
def rel(t, p):
    outros = [q for q in novos if q['id'] != p['id']][:6]
    sec = ('<section class="rel" aria-labelledby="rel-t"><h2 id="rel-t">Mais em ' + esc(NOME_G) + '</h2><ul>' +
           ''.join(f'<li><a href="{q["id"]}.html">{esc(q["nome"])}</a></li>' for q in outros) +
           f'</ul><p style="margin-top:14px"><a href="../categorias/{SLUG_G}.html">Ver todos os produtos de {esc(NOME_G)} →</a></p></section>')
    return re.sub(r'<section class="rel".*?</section>', lambda m: sec, t, count=1, flags=re.S)
def titulo(nome):
    # Google corta titulos acima de ~65 caracteres: tira Teresina e depois Elétrica Solar
    for suf in (' | MAXX Elétrica Solar Teresina', ' | MAXX Elétrica Solar', ' | MAXX'):
        if len(nome + suf) <= 65: return esc(nome) + suf
    return esc(nome) + ' | MAXX'
def pagina(p):
    t = modelo; url = f'{BASE}produtos/{p["id"]}.html'; nome = p['nome']
    d1 = p['conteudo'][0]['x'] if p['conteudo'] else nome
    desc = f'{nome} na MAXX Elétrica Solar, Teresina-PI. {d1}'
    if len(desc) > 158: desc = desc[:157].rsplit(' ', 1)[0].rstrip(' ,.;:') + '…'
    def sub(pat, rep):
        nonlocal t
        t = re.sub(pat, lambda m: rep, t, count=1, flags=re.S)
    sub(r'<title>.*?</title>', f'<title>{titulo(nome)}</title>')
    sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(desc)}">')
    sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">')
    sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{titulo(nome)}">')
    sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(desc)}">')
    sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">')
    sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{BASE}img/og-maxx.jpg">')
    prod = {'@context': 'https://schema.org', '@type': 'Product', 'name': nome, 'description': d1, 'category': NOME_G, 'url': url}
    if p['imgs']: prod['image'] = [{'@type': 'ImageObject', 'url': BASE + i, 'caption': nome} for i in p['imgs']]
    prod['brand'] = {'@type': 'Brand', 'name': 'Ritz'}
    if p['refs']: prod['sku'] = p['refs'][0]
    bc = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': BASE},
        {'@type': 'ListItem', 'position': 2, 'name': NOME_G, 'item': f'{BASE}categorias/{SLUG_G}.html'},
        {'@type': 'ListItem', 'position': 3, 'name': nome, 'item': url}]}
    j = lambda o: '<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False, separators=(',', ':')) + '</script>'
    lds = re.findall(r'<script type="application/ld\+json">.*?</script>', t, re.S)
    t = t.replace(lds[0], j(prod), 1).replace(lds[1], j(bc), 1)
    if p['imgs']:
        gal = f'<div class="pd-main"><img id="pd-img" src="../{p["imgs"][0]}" alt="{esc(nome)} — MAXX Elétrica Solar, Teresina-PI" title="{esc(nome)}" width="640" height="480"></div>'
        if len(p['imgs']) > 1:
            gal += '<div class="pd-thumbs">' + ''.join(
                f'<button type="button" data-thumb="../{i}" aria-pressed="{"true" if k == 0 else "false"}" aria-label="Foto {k+1}"><img src="../{i}" alt="{esc(nome)} — foto {k+1}" loading="lazy" width="62" height="62"></button>'
                for k, i in enumerate(p['imgs'])) + '</div>'
    else:
        gal = '<div class="pd-main"><img src="../img/sem-foto.svg" alt="Foto sob consulta" width="320" height="240"></div>'
    sub(r'<div class="pd-gal">.*?</div></div><div class="pd-info">', '<div class="pd-gal">' + gal + '</div><div class="pd-info">')
    sub(r'<h1>.*?</h1>', f'<h1>{esc(nome)}</h1>')
    sub(r'<nav class="crumbs".*?</nav>', f'<nav class="crumbs" aria-label="Você está em"><a href="../">Início</a> › <a href="../produtos.html">Produtos</a> › <a href="../categorias/{SLUG_G}.html">{esc(NOME_G)}</a></nav>')
    sub(r'<p class="eyebrow">.*?</p>', f'<p class="eyebrow">Ritz · {esc(NOME_G)}</p>')
    sub(r'data-id="[^"]*" data-nome="[^"]*"', f'data-id="{p["id"]}" data-nome="{esc(nome)}"')
    t = re.sub(r'<!--share-->.*?<!--/share-->', '', t, flags=re.S)
    sub(r'<div class="pd-desc">.*?</div>', '<div class="pd-desc">' + ''.join(f'<p>{esc(b["x"])}</p>' for b in p['conteudo']) + '</div>')
    return rel(t, p)
for p in novos:
    arq = f'produtos/{p["id"]}.html'
    gravar(arq, rel(ler(arq), p) if p['id'] in extras_ids else pagina(p))
for a in aposentar:
    for f in (f'produtos/{a}.html', f'img/og/{a}.jpg'):
        if os.path.exists(f): os.remove(f)

# ---------- listagem de produtos.html ----------
ph = ler('produtos.html')
bloco = re.search(r'<section class="cat-sec(?: sel)?" id="' + re.escape(SLUG_G) + r'".*?</section>', ph, re.S).group(0)
cards_velhos = {m.group(1): m.group(0) for m in re.finditer(r'<article class="pcard" id="p-([^"]+)".*?</article>', bloco, re.S)}
def cartao(p):
    if p['id'] in extras_ids: return cards_velhos[p['id']]
    img = primeira_foto(p); nome = p['nome']
    bruto = ' '.join([nome, NOME_G, 'grupo', G, ' '.join(b['x'] for b in p['conteudo']), ' '.join(p['refs'][:12])])
    q = (re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9-]+', ' ', semacento(bruto).lower())).strip() + ' ' + kn(' '.join([nome] + p['refs'][:12])))[:900]  # com hifen (ATR04116-1) e sem (atr04116 1)
    im = (f'<img src="{img}" alt="{esc(nome)} — MAXX Elétrica Solar, Teresina-PI" loading="lazy" width="320" height="240">' if img
          else '<img src="img/sem-foto.svg" alt="" loading="lazy" width="320" height="240">')
    return (f'<article class="pcard" id="p-{p["id"]}" data-q="{esc(q)}"><a class="pimg" href="produtos/{p["id"]}.html" data-open="{p["id"]}" tabindex="-1" aria-hidden="true">{im}</a>'
            f'<div class="pbody"><div class="pmeta"><span>{esc(NOME_G)}</span></div><h3><a href="produtos/{p["id"]}.html" data-open="{p["id"]}">{esc(nome)}</a></h3><p>{esc(resumo(p))}</p></div>'
            f'<button type="button" class="pl-add" data-add-prod="{p["id"]}" data-nome="{esc(nome)}" aria-label="Adicionar {esc(nome)} à lista de orçamento">+ Lista</button></article>')
ini = bloco.index('<article class="pcard"'); fim = bloco.rindex('</div></section>')
novo_bloco = bloco[:ini] + ''.join(cartao(p) for p in novos) + bloco[fim:]
novo_bloco = re.sub(r'(Categoria ' + G + r' · linha Ritz · )\d+( produtos)', lambda m: m.group(1) + str(len(novos)) + m.group(2), novo_bloco)
ph = ph.replace(bloco, novo_bloco)
ph = re.sub(r'(<a href="#' + re.escape(SLUG_G) + r'"><b>[^<]*</b><span>[^<]*</span><i>)\d+(</i>)', lambda m: m.group(1) + str(len(novos)) + m.group(2), ph)
ph = re.sub(r'(<a href="#' + re.escape(SLUG_G) + r'"><span>[^<]*</span><i>)\d+(</i>)', lambda m: m.group(1) + str(len(novos)) + m.group(2), ph)
gravar('produtos.html', ph)

# ---------- pagina da categoria ----------
cp = f'categorias/{SLUG_G}.html'; c = ler(cp)
grade = re.search(r'class="cg-grid">.*?</ul>', c, re.S).group(0)
lis_velhos = {m.group(1): m.group(0) for m in re.finditer(r'<li><a href="\.\./produtos/([^"]+)\.html">.*?</li>', grade, re.S)}
def li(p):
    if p['id'] in extras_ids: return lis_velhos[p['id']]
    img = primeira_foto(p); ref = f' · Ref. {p["refs"][0]}' if p['refs'] else ''
    im = (f'<img src="../{img}" alt="{esc(p["nome"])}" loading="lazy" width="320" height="240">' if img
          else '<img src="../img/sem-foto.svg" alt="" loading="lazy" width="320" height="240">')
    return f'<li><a href="../produtos/{p["id"]}.html"><span class="ph">{im}</span><span class="tx"><strong>{esc(p["nome"])}</strong><small>Ritz{ref}</small></span></a></li>'
c = c.replace(grade, 'class="cg-grid">' + ''.join(li(p) for p in novos) + '</ul>', 1)
c = re.sub(r'Ritz · \d+ produtos', f'Ritz · {len(novos)} produtos', c)
il = {'@type': 'ItemList', 'numberOfItems': len(novos), 'itemListElement': [
    {'@type': 'ListItem', 'position': i + 1, 'url': f'{BASE}produtos/{p["id"]}.html', 'name': p['nome']} for i, p in enumerate(novos)]}
c = re.sub(r'"mainEntity":\{"@type":"ItemList".*?\]\}\}', lambda m: '"mainEntity":' + json.dumps(il, ensure_ascii=False, separators=(',', ':')) + '}', c, count=1, flags=re.S)
gravar(cp, c)


# ---------- ItemList global de produtos.html e citacoes nos guias ----------
ph = ler('produtos.html')
il_all = {'@context': 'https://schema.org', '@type': 'ItemList', 'name': 'Catálogo de material elétrico MAXX Elétrica Solar', 'numberOfItems': len(cat['produtos']), 'itemListElement': [
    {'@type': 'ListItem', 'position': i + 1, 'url': f'{BASE}produtos/{p["id"]}.html', 'name': p['nome']} for i, p in enumerate(cat['produtos'])]}
ph2 = re.sub(r'\{"@context":"https://schema.org","@type":"ItemList","name":"[^"]*","numberOfItems":\d+,"itemListElement":\[.*?\]\}', lambda m: json.dumps(il_all, ensure_ascii=False, separators=(',', ':')), ph, count=1, flags=re.S)
if ph2 == ph and '"numberOfItems":' + str(len(cat['produtos'])) not in ph: print('AVISO: ItemList de produtos.html nao encontrado')
gravar('produtos.html', ph2)
gu = ler('guias.html')
for velho, novo in spec.get('substituir_em_guias', {}).items():
    gu = re.sub(r'\{"id":"' + re.escape(velho) + r'","nome":"[^"]*"\}', lambda m: json.dumps({'id': novo, 'nome': P[novo]['nome']}, ensure_ascii=False, separators=(',', ':')), gu)
gravar('guias.html', gu)

# ---------- busca ----------
b = json.load(open('assets/busca.json', encoding='utf-8'))
for q in b['c']:
    if q['s'] == SLUG_G: q['q'] = len(novos)
indice = next(i for i, x in enumerate(b['p']) if x['b'] == G)
reg = [{'i': p['id'], 'n': p['nome'], 'g': NOME_G, 'b': G, 'r': ', '.join(p['refs'][:3]), 'kn': kn(p['nome']),
        'k': kn(' '.join([p['nome'], NOME_G, 'ritz'] + p['refs'])), 'm': ''} for p in novos]
b['p'] = [x for x in b['p'][:indice] if x['b'] != G] + reg + [x for x in b['p'][indice:] if x['b'] != G]
gravar('assets/busca.json', json.dumps(b, ensure_ascii=False, separators=(',', ':')))

# ---------- sitemap ----------
sm = ler('sitemap.xml'); nl = '\r\n' if '\r\n' in sm else '\n'
def url_xml(p):
    return (f'  <url><loc>{BASE}produtos/{p["id"]}.html</loc><lastmod>{HOJE}</lastmod><priority>0.6</priority>' +
            ''.join(f'<image:image><image:loc>{BASE}{i}</image:loc></image:image>' for i in p['imgs']) + '</url>')
for a in aposentar + ids_novos:
    sm = re.sub(r'[ \t]*<url><loc>' + re.escape(BASE) + r'produtos/' + re.escape(a) + r'\.html</loc>.*?</url>\r?\n', '', sm, flags=re.S)
ancora = sm.find('<url><loc>' + BASE + 'produtos/' + chr(ord(G.lower()) + 1) + '-')
if ancora < 0: ancora = sm.find('</urlset>')
else: ancora = sm.rfind('\n', 0, ancora) + 1
sm = sm[:ancora] + nl.join(url_xml(p) for p in novos) + nl + sm[ancora:]
gravar('sitemap.xml', sm)

# ---------- home: total de produtos da linha Ritz ----------
ix = ler('index.html')
if f'{total_antes} produtos' in ix: gravar('index.html', ix.replace(f'{total_antes} produtos', f'{total} produtos', 1))

# ---------- redirecionamentos dos produtos que deixaram de existir ----------
ht = ler('.htaccess')
for a in aposentar:
    linha = f'RedirectMatch 301 ^/produtos/{re.escape(a)}\\.html$ /categorias/{SLUG_G}.html'
    if linha not in ht: ht = ht.rstrip('\r\n') + '\n' + linha + '\n'
gravar('.htaccess', ht)

novos_n = sum(1 for i in ids_novos if i not in antigos)
print(f'grupo {G}: {len(novos)} produtos ({novos_n} novos), {len(aposentar)} aposentados | total linha Ritz: {total_antes} -> {total}')
print('fotos sem dono:', len(sem_dono), '| produtos sem foto:', [p['id'] for p in novos if not p['imgs']])
