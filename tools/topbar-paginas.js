// Põe no topo de todas as páginas: a faixa escura (descrição + WhatsApp; as 4 principais já trazem a sua) e, logo depois dela, a faixa dourada de
// categorias que passa da direita para a esquerda (só a partir de 761 px). Idempotente (marcadores <!--topbar--> e <!--ticker-->). Uso: node tools/topbar-paginas.js (a partir da raiz); depois, reindexar-assets.
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const BLOCO = `<!--topbar--><div class="topbar">
  <div class="wrap">
    <span>Distribuidora de material elétrico de <b>baixa, média e alta tensão</b><i class="tb-sep"> · </i><span class="tb-loc">Teresina-PI · <b>Revendedor autorizado Ritz</b></span></span>
    <span>WhatsApp <a href="tel:+5586994540900" style="color:inherit;text-decoration:none"><b>(86) 99454-0900</b></a></span>
  </div>
</div><!--/topbar-->
`;
const CATS = ["Aterramento temporário", "Varas de manobra", "Coberturas isolantes", "Escadas isolantes", "Detectores de tensão", "Jumpers temporários", "Perfilados", "Eletrocalhas", "Postes", "Combate a incêndio", "Lógica", "Hidráulica", "EPIs", "Fardamentos", "Para-raios", "Hastes de aterramento", "Sinalizadores", "Cabos de alumínio", "Conduletes", "Eletrodutos PVC"];
const FAIXA = '<!--ticker--><div class="ticker" aria-label="Categorias de produtos">\n  <div class="ticker-track">' + CATS.map((c) => '<span>' + c + '</span>').join('') + CATS.map((c) => '<span aria-hidden="true">' + c + '</span>').join('') + '</div>\n</div><!--/ticker-->\n';
function htmls(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(img|assets|tools|node_modules|\.git|teste|_mock|\.impeccable)$/.test(e.name)) htmls(p, a); }
    else if (e.name.endsWith('.html')) a.push(p);
  }
  return a;
}
let n = 0, ja = 0, sem = [];
for (const p of htmls(RAIZ)) {
  const orig = fs.readFileSync(p, 'utf8');
  if (orig.indexOf('<header class="site"') < 0) { sem.push(path.relative(RAIZ, p)); continue; }
  const nl = orig.includes('\r\n') ? '\r\n' : '\n';
  let t = orig.replace(/<!--topbar-->[\s\S]*?<!--\/topbar-->\r?\n?/g, '').replace(/<!--ticker-->[\s\S]*?<!--\/ticker-->\r?\n?/g, '');
  t = t.replace(/ {2}<div class="ticker"[\s\S]*?\n {2}<\/div>\r?\n(\r?\n)?/, ''); // a faixa antiga, abaixo do hero da home
  const propria = /class="topbar"/.test(t); if (propria) ja++;
  const j = t.indexOf('<header class="site"');
  t = t.slice(0, j) + (propria ? '' : BLOCO.replace(/\n/g, nl)) + FAIXA.replace(/\n/g, nl) + t.slice(j);
  if (t !== orig) { fs.writeFileSync(p, t); n++; }
}
console.log(`topbar: ${n} página(s) atualizadas; ${ja} já tinham a própria; sem <header class="site">: ${sem.join(', ') || 'nenhuma'}`);
