# Prepara uma linha Ritz para o importador: gera fornecedor-<G>.json (referencias e tabelas do fabricante) e um rascunho de <G>.json.
# Uso (da raiz): python3 tools/ritz/preparar.py <G> <ritz-produtos.json> [--digest saida.txt]
#   <G>.json so e criado se ainda nao existir (nao apaga descricoes ja escritas).
#   --digest grava o texto do fabricante (resumo e descricao) de cada produto, para reescrever com as nossas palavras.
# Depois: preencher "descricao" em tools/ritz/<G>.json, rodar catalogo-fotos.py e importar.py (CLAUDE.md, regra 18).
import json, re, sys, os, ast, unicodedata

G = sys.argv[1]; arq = sys.argv[2]
digest = sys.argv[sys.argv.index('--digest') + 1] if '--digest' in sys.argv else None
def sa(s): return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
def kn(s): return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', sa(s).lower())).strip()
def norm(s): return re.sub(r'[^A-Z0-9]', '', s.upper())
def L(x): return x if isinstance(x, list) else ast.literal_eval(x)

bruto = [x for x in json.load(open(arq, encoding='utf-8')) if x['g'] == G]
src = os.popen('git show HEAD:assets/catalogo-data.js').read()
cat = json.loads(re.match(r'^window\.__CAT=(.*);\s*$', src, re.S).group(1))
ours = [p for p in cat['produtos'] if p['g'] == G]

forn = {}; ordem = []
for x in bruto:
    slug = x['url'].rstrip('/').split('/')[-1]
    rows = []
    for r in L(x['rows']):
        c = (r.get('cells') or []) + ['', '', '']
        ref, car = c[1].strip(), c[2].strip()
        if not ref or ref.lower().startswith('refer'): continue
        rows.append([ref, car])
    tags = [t for t in L(x['tags']) if re.search(r'\d', t)]
    refs = list(dict.fromkeys(tags + [r[0] for r in rows]))
    forn[slug] = {'nome': x['name'], 'refs': refs, 'rows': rows}
    ordem.append(slug)
json.dump(forn, open(f'tools/ritz/fornecedor-{G}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# associacao com os nossos produtos: nome igual, nome contido, ou metade das referencias em comum
usados = set(); mapa = {}
def refs_de(p): return {norm(r) for r in p['refs']}
for slug in ordem:
    f = forn[slug]; n = kn(f['nome']); rf = {norm(r) for r in f['refs']}
    cand = [p for p in ours if p['id'] not in usados and kn(p['nome']) == n]
    if not cand: cand = [p for p in ours if p['id'] not in usados and (kn(p['nome']) in n or n in kn(p['nome']))]
    if not cand:
        pt = sorted(((len(rf & refs_de(p)), p) for p in ours if p['id'] not in usados), key=lambda t: -t[0])
        if pt and pt[0][0] >= max(2, len(rf) // 2): cand = [pt[0][1]]
    if cand: mapa[slug] = cand[0]['id']; usados.add(cand[0]['id'])

if not os.path.exists(f'tools/ritz/{G}.json'):
    spec = {'grupo': G, 'aposentar': [], 'produtos': [], 'fotos_manuais': {}, 'descartar_paginas': [0, -1], 'descartar': [], 'substituir_em_guias': {}}
    for slug in ordem: spec['produtos'].append({'slug': slug, 'id': mapa.get(slug), 'nome': None, 'descricao': None})
    for p in ours:
        if p['id'] not in usados: spec['produtos'].append({'slug': 'ours', 'id': p['id'], 'nome': None, 'descricao': None})
    json.dump(spec, open(f'tools/ritz/{G}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(f'linha {G}: fornecedor {len(ordem)} | nossos {len(ours)} | casados {len(mapa)} | novos {len(ordem) - len(mapa)} | so nossos {len(ours) - len(usados)}')
for slug in ordem:
    print('  ', slug.ljust(42), '->', mapa.get(slug) or 'NOVO')
for p in ours:
    if p['id'] not in usados: print('   (so nosso) ', p['id'])
if digest:
    with open(digest, 'w', encoding='utf-8') as o:
        for x in bruto:
            slug = x['url'].rstrip('/').split('/')[-1]
            o.write(f"### {slug} | {x['name']}\nRESUMO: {x['short'][:900]}\nDESCRICAO: {x['desc'][:1400]}\n\n")
