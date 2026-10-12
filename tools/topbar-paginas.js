// Põe a faixa escura do topo (descrição + WhatsApp) em todas as páginas que ainda não a têm (as 4 principais já trazem a sua).
// Idempotente (marcadores <!--topbar--> ... <!--/topbar-->). Uso: node tools/topbar-paginas.js (a partir da raiz); depois, reindexar-assets.
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
  let t = fs.readFileSync(p, 'utf8');
  const i = t.indexOf('<header class="site"');
  if (i < 0) { sem.push(path.relative(RAIZ, p)); continue; }
  if (/class="topbar"/.test(t) && !t.includes('<!--topbar-->')) { ja++; continue; } // as 4 páginas principais têm a sua
  const nl = t.includes('\r\n') ? '\r\n' : '\n';
  const bloco = BLOCO.replace(/\n/g, nl);
  t = t.replace(/<!--topbar-->[\s\S]*?<!--\/topbar-->\r?\n?/g, '');
  const j = t.indexOf('<header class="site"');
  const novo = t.slice(0, j) + bloco + t.slice(j);
  if (novo !== fs.readFileSync(p, 'utf8')) { fs.writeFileSync(p, novo); n++; }
}
console.log(`topbar: ${n} página(s) atualizadas; ${ja} já tinham a própria; sem <header class="site">: ${sem.join(', ') || 'nenhuma'}`);
