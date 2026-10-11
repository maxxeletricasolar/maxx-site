// Insere (ou atualiza) os links de compartilhamento nas páginas estáticas do site.
// Usa o mesmo módulo do navegador (assets/compartilhar.js), então o HTML estático e o gerado na tela são idênticos.
// Idempotente: pode rodar de novo sempre que incluir produtos, categorias ou artigos.
// Uso (na raiz do repositório):  node tools/compartilhar-paginas.js        e depois:  tools\reindexar-assets.ps1
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const M = require(path.join(RAIZ, 'assets', 'compartilhar.js'));
const INI = '<!--share-->', FIM = '<!--/share-->';

const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const h1 = (s) => { const m = s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? dec(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() : ''; };
const canonical = (s, rel) => { const m = s.match(/<link rel="canonical" href="([^"]+)"/); return m ? m[1] : M.site + '/' + rel; };

// fim da <div> que começa em "ini" (conta as aberturas e os fechamentos)
function fimDiv(s, ini) {
  const re = /<div\b|<\/div>/g; re.lastIndex = ini; let d = 0, m;
  while ((m = re.exec(s))) { if (m[0] === '</div>') { d--; if (d === 0) return m.index + m[0].length; } else d++; }
  return -1;
}
const fimParagrafo = (s, ini) => { const f = s.indexOf('</p>', ini); return f < 0 ? -1 : f + 4; };
const limpar = (s) => s.replace(/<!--share-->[\s\S]*?<!--\/share-->/g, '');
const bloco = (url, titulo, variante, rotulo, chamada) => INI + M.html(url, titulo, variante, rotulo, chamada) + FIM;

function paginas(d = RAIZ, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(img|assets|tools|node_modules|\.git)$/.test(e.name)) paginas(p, out); }
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// ---- estilo: a fonte é tools/compartilhar.css; entra entre marcadores no site.css e nos CSS com hash que produtos.html e guias.html
// carregam (essas duas páginas montam o bloco pelo JS no modal e no leitor, mas não usam o site.css) ----
{
  const css = fs.readFileSync(path.join(__dirname, 'compartilhar.css'), 'utf8').replace(/\r\n/g, '\n').trim();
  const alvos = new Set(['assets/site.css']);
  for (const pg of ['produtos.html', 'guias.html']) {
    const t = fs.readFileSync(path.join(RAIZ, pg), 'utf8');
    for (const m of t.matchAll(/assets\/h\/[0-9a-f]{10}\.css/g)) alvos.add(m[0]);
  }
  const re = /\/\*share:ini\*\/[\s\S]*?\/\*share:fim\*\//;
  for (const rel of alvos) {
    const p = path.join(RAIZ, rel); if (!fs.existsSync(p)) continue;
    const orig = fs.readFileSync(p, 'utf8'), crlf = orig.includes('\r\n');
    let c = orig.replace(/\r\n/g, '\n');
    if (!re.test(c)) { const k = c.indexOf('/* compartilhar: links para'); if (k >= 0) c = c.slice(0, k); } // versão antiga, sem marcadores
    c = c.replace(re, '').replace(/\s+$/, '') + '\n/*share:ini*/\n' + css + '\n/*share:fim*/\n';
    if (crlf) c = c.replace(/\n/g, '\r\n');
    if (c !== orig) { fs.writeFileSync(p, c); console.log('css:', rel); }
  }
}

const cont = { produto: 0, categoria: 0, guia: 0, calculadora: 0, script: 0, ignoradas: [] };
for (const p of paginas()) {
  const rel = path.relative(RAIZ, p).replace(/\\/g, '/');
  const orig = fs.readFileSync(p, 'utf8');
  let s = limpar(orig);
  const titulo = h1(s), url = canonical(s, rel);
  let tipo = null;

  if (rel.startsWith('produtos/')) {
    const i = s.indexOf('<div class="pd-buy">');
    let f = i < 0 ? -1 : fimDiv(s, i);
    if (f < 0) { const t = s.indexOf('</h1>'); f = t < 0 ? -1 : t + 5; } // páginas de conteúdo técnico não têm bloco de compra: entra logo após o título
    if (f > 0) { s = s.slice(0, f) + bloco(url, titulo, 'ic', 'Compartilhar este produto') + s.slice(f); tipo = 'produto'; }
  } else if (rel.startsWith('categorias/')) {
    const i = s.indexOf('<div class="cg-meta">'), f = i < 0 ? -1 : fimDiv(s, i);
    if (f > 0) { s = s.slice(0, f) + bloco(url, titulo, 'ic', 'Compartilhar esta categoria') + s.slice(f); tipo = 'categoria'; }
  } else if (rel.startsWith('guias/')) {
    const a = s.indexOf('<article class="art">'), l = a < 0 ? -1 : s.indexOf('<p class="lede"', a), fl = l < 0 ? -1 : fimParagrafo(s, l);
    const r = s.indexOf('<section class="rel"', a);
    if (fl > 0 && r > fl) {
      // embaixo primeiro (posição maior), para o índice de cima continuar valendo
      s = s.slice(0, r) + bloco(url, titulo, 'txt', 'Compartilhar este artigo, final do texto', 'Gostou? Compartilhe este artigo') + s.slice(r);
      // um só bloco por artigo: o do final do texto (o de cima competia com o botão de orçamento)
      tipo = 'guia';
    }
  } else if (rel === 'calculadora-queda-de-tensao.html') {
    const l = s.indexOf('<p class="lede"'), fl = l < 0 ? -1 : fimParagrafo(s, l);
    if (fl > 0) { s = s.slice(0, fl) + bloco(url, titulo, 'ic', 'Compartilhar a calculadora') + s.slice(fl); tipo = 'calculadora'; }
  }

  // páginas que montam o bloco pelo JS (modal do catálogo e leitor do blog) só precisam do script
  const precisaScript = tipo || rel === 'produtos.html' || rel === 'guias.html';
  if (precisaScript && !/assets\/compartilhar\.js/.test(s)) {
    const pref = rel.includes('/') ? '../' : '';
    const i = s.lastIndexOf('</body>');
    const nl = orig.includes('\r\n') ? '\r\n' : '\n'; // respeita o fim de linha do arquivo (CRLF no Windows)
    if (i > 0) { s = s.slice(0, i) + '<script src="' + pref + 'assets/compartilhar.js" defer></script>' + nl + s.slice(i); cont.script++; }
  }

  if (tipo) cont[tipo]++; else if (rel.startsWith('produtos/') || rel.startsWith('categorias/') || rel.startsWith('guias/') || rel === 'calculadora-queda-de-tensao.html') cont.ignoradas.push(rel);
  if (s !== orig) fs.writeFileSync(p, s);
}
console.log(cont);
