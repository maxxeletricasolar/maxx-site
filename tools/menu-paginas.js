// Leva o menu de hambúrguer (botão no cabeçalho + gaveta com os links) às páginas que antes tinham a fileira de atalhos (.sub-nav):
// produtos, categorias, artigos, calculadora, páginas legais e 404. Assim todas as páginas têm o mesmo menu no celular que a home e o catálogo.
// Idempotente (marcadores <!--menu-btn--> e <!--menu-dlg-->). O clique é tratado em assets/efeitos.js (atributos data-menu-open e data-fecha-menu).
// Uso: node tools/menu-paginas.js   (depois: node tools/reindexar-assets.js)
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');

function paginas(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.isDirectory()) return ['node_modules', '.git', 'tools', 'assets', 'img'].includes(e.name) ? [] : paginas(path.join(dir, e.name));
    return e.name.endsWith('.html') ? [path.join(dir, e.name)] : [];
  });
}

const BOTAO = '<!--menu-btn--><button type="button" class="menu-btn" data-menu-open aria-label="Abrir menu" aria-controls="dlg-menu-g" aria-expanded="false"><svg aria-hidden="true"><use href="/img/ui.svg#i-menu"/></svg></button><!--/menu-btn-->';
const ico = id => `<svg aria-hidden="true"><use href="/img/ui.svg#${id}"/></svg>`;
// Mesmo menu da home e do catálogo: ícones, item da página atual marcado e o rodapé com WhatsApp e a frase da Ritz.
const gaveta = (b, atual) => {
  const cur = k => (atual === k ? ' aria-current="page"' : '');
  return `<!--menu-dlg--><dialog class="drawer drawer-menu" id="dlg-menu-g" aria-label="Menu"><div class="drawer-head"><img src="${b}img/logo.jpg" alt="MAXX Elétrica Solar" width="44" height="44" style="border-radius:8px"><button type="button" class="sheet-x" style="float:none;margin:0" data-fecha-menu aria-label="Fechar menu">✕</button></div>` +
  `<nav class="menu-links" aria-label="Menu principal"><a href="${b}">${ico('i-home')}Início</a><a href="${b}quem-somos.html"${cur('quem')}>${ico('i-escudo')}Quem somos</a><a href="${b}produtos.html"${cur('produtos')}>${ico('i-grid')}Produtos</a><a href="${b}guias.html"${cur('blog')}>${ico('i-book')}Blog técnico</a><a href="${b}#contato">${ico('i-pin')}Contato e endereço</a></nav>` +
  `<div class="drawer-foot"><a class="btn btn-gold" href="${b}produtos.html#orcamento">Pedir orçamento</a><a class="btn btn-ghost" href="https://wa.me/5586994540900" data-wa="Encontrei a MAXX pelo site e gostaria de fazer um pedido de orçamento." data-origem="menu" target="_blank" rel="noopener">${ico('i-wa')} WhatsApp <span>(86) 99454-0900</span></a><p class="hint" style="margin:4px 0 0">Revendedor autorizado Ritz · Teresina-PI</p></div></dialog><!--/menu-dlg-->\n`;
};

let n = 0;
for (const p of paginas(RAIZ)) {
  const orig = fs.readFileSync(p, 'utf8'), crlf = orig.includes('\r\n');
  let s = orig.replace(/\r\n/g, '\n');
  if (!/<header class="site">/.test(s) || !/<nav class="sub-nav"|<!--menu-btn-->/.test(s)) continue;
  const b = (s.match(/<a class="brand" href="([^"]*)"/) || [])[1];
  if (!b) continue;
  s = s.replace(/\s*<nav class="sub-nav"[\s\S]*?<\/nav>/, '');
  if (!s.includes('<!--menu-btn-->')) s = s.replace(/(<header class="site">[\s\S]*?)(<a class="btn btn-gold" href="[^"]*#orcamento">Pedir orçamento<\/a>)/, (m, a, c) => a + BOTAO + '\n    ' + c);
  s = s.replace(/<!--menu-dlg-->[\s\S]*?<!--\/menu-dlg-->\n?/, '');
  const i = s.lastIndexOf('</body>');
  const rel = path.relative(RAIZ, p).replace(/\\/g, '/'), atual = /^(produtos|categorias)\//.test(rel) ? 'produtos' : /^guias\//.test(rel) ? 'blog' : null;
  if (i > 0) s = s.slice(0, i) + gaveta(b, atual) + s.slice(i);
  if (crlf) s = s.replace(/\n/g, '\r\n');
  if (s !== orig) { fs.writeFileSync(p, s); n++; }
}
console.log(`menu: ${n} páginas atualizadas`);
