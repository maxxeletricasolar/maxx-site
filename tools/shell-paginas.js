// Leva o "shell" das páginas principais (tema claro/escuro, botão da lista de orçamento, barra de navegação do celular e o
// módulo assets/lista.js) para as páginas geradas em produtos/, categorias/ e guias/. Idempotente (marcadores <!--shell-...-->).
// Também injeta tools/produto.css no assets/site.css entre /*pm:ini*/ e /*pm:fim*/ (não edite o bloco direto no site.css).
// Uso: node tools/shell-paginas.js   (depois: node tools/reindexar-assets.js)
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');

const LAMPADA = '<button type="button" class="theme-tg lamp" data-tema-tg aria-label="Acender a luz (tema claro)" title="Acender a luz (tema claro)">' +
  '<svg class="lamp-bulb" viewBox="0 0 24 24" aria-hidden="true"><circle class="glow" cx="12" cy="10.5" r="9"/>' +
  '<g class="rays"><path d="M12 .8v1.8M4.3 3.6l1.3 1.3M19.7 3.6l-1.3 1.3M1.4 10.5h1.8M20.8 10.5h1.8"/></g>' +
  '<path class="glass" d="M12 4.2a6 6 0 0 0-3.7 10.7c.6.5.9 1.1.9 1.9v1.4h5.6v-1.4c0-.8.3-1.4.9-1.9A6 6 0 0 0 12 4.2Z"/>' +
  '<path class="fil" d="M10.2 13.6 11.1 11l.9 2 .9-2 .9 2.6M12 13.6v4.4"/><path class="base" d="M9.4 20h5.2M10.1 22h3.8"/></svg>' +
  '<span class="lamp-sw" aria-hidden="true"><span class="lamp-rk"></span></span></button>';
const LISTA = '<button type="button" class="cart-btn" data-lista-abrir aria-label="Lista de orçamento, vazia" title="Lista de orçamento">' +
  '<svg aria-hidden="true"><use href="/img/ui.svg#i-cart"/></svg><span class="lbl">Lista de orçamento</span><span class="cart-count" data-lista-n hidden>0</span></button>';

function tabbar(base) {
  return '<nav class="tabbar" aria-label="Navegação rápida" data-shell-tab>' +
    `<a href="${base}"><svg aria-hidden="true"><use href="/img/ui.svg#i-home"/></svg><span>Início</span></a>` +
    `<a href="${base}produtos.html"><svg aria-hidden="true"><use href="/img/ui.svg#i-grid"/></svg><span>Produtos</span></a>` +
    '<button type="button" data-lista-abrir><span class="tb-ico"><svg aria-hidden="true"><use href="/img/ui.svg#i-cart"/></svg><b class="cart-count" data-lista-n hidden>0</b></span><span>Orçamento</span></button>' +
    `<a href="${base}guias.html"><svg aria-hidden="true"><use href="/img/ui.svg#i-book"/></svg><span>Blog</span></a>` +
    '<a href="https://wa.me/5586994540900" data-wa="Encontrei a MAXX pelo site e gostaria de fazer um pedido de orçamento." data-origem="tabbar"><svg aria-hidden="true"><use href="/img/ui.svg#i-wa"/></svg><span>WhatsApp</span></a></nav>';
}

function processa(arq) {
  let h = fs.readFileSync(arq, 'utf8');
  const crlf = h.includes('\r\n'); if (crlf) h = h.replace(/\r\n/g, '\n');
  const orig = h, base = '../';
  if (!h.includes('<!--shell-hdr-->')) {
    // antes do botão "Pedir orçamento" do cabeçalho
    h = h.replace(/(<header class="site">[\s\S]*?)(<a class="btn btn-gold" href="[^"]*#orcamento">Pedir orçamento<\/a>)/, (m, a, b) => `${a}<!--shell-hdr-->${LAMPADA}${LISTA}<!--/shell-hdr-->\n    ${b}`);
  }
  if (!h.includes('assets/lista.js')) h = h.replace(/(<script src="\.\.\/assets\/busca\.js)/, '<script src="../assets/lista.js" data-base="../" defer></script>\n$1');
  if (!h.includes('<!--shell-tab-->')) h = h.replace(/(<\/footer>)/, (m) => `${m}\n<!--shell-tab-->${tabbar(base)}<!--/shell-tab-->`);
  if (h === orig) return false;
  fs.writeFileSync(arq, crlf ? h.replace(/\n/g, '\r\n') : h);
  return true;
}

function injetaCss() {
  const css = fs.readFileSync(path.join(__dirname, 'produto.css'), 'utf8').trim();
  const alvo = path.join(RAIZ, 'assets/site.css');
  let s = fs.readFileSync(alvo, 'utf8');
  const crlf = s.includes('\r\n'); if (crlf) s = s.replace(/\r\n/g, '\n');
  const bloco = `/*pm:ini*/\n${css}\n/*pm:fim*/`;
  const orig = s;
  if (s.includes('/*pm:ini*/')) s = s.replace(/\/\*pm:ini\*\/[\s\S]*?\/\*pm:fim\*\//, () => bloco);
  else s = s.replace(/\n*$/, '\n') + bloco + '\n';
  if (s !== orig) fs.writeFileSync(alvo, crlf ? s.replace(/\n/g, '\r\n') : s);
  return s !== orig;
}

if (require.main === module) {
  let alt = 0, tot = 0;
  ['produtos', 'categorias', 'guias'].forEach((d) => {
    const dir = path.join(RAIZ, d);
    fs.readdirSync(dir).filter((f) => f.endsWith('.html')).forEach((f) => { tot++; if (processa(path.join(dir, f))) alt++; });
  });
  console.log(`shell: ${alt} de ${tot} páginas atualizadas; site.css ${injetaCss() ? 'atualizado' : 'sem mudança'}`);
}
module.exports = { processa, injetaCss };
