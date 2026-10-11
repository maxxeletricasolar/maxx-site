// Põe nas páginas de categoria (categorias/*.html) o bloco "Como escolher" (3 passos do atendimento da MAXX e links para os artigos do blog
// que citam produtos da categoria), no lugar dos selos de frete e retirada. Idempotente (marcadores <!--cg-guia--> e <!--/cg-guia-->).
// Os artigos vêm do JSON data-guias de guias.html (campo rel: ids de produto começam com a letra do grupo). Uso: node tools/categorias-guia.js
// Depois: node tools/shell-paginas.js (estilo, em tools/produto.css) e node tools/reindexar-assets.js
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const guias = JSON.parse(fs.readFileSync(path.join(RAIZ, 'guias.html'), 'utf8').match(/id="data-guias">([\s\S]*?)<\/script>/)[1]);

const PASSOS_RITZ = ['Informe a tensão da rede: baixa, média ou alta.', 'Diga onde vai usar: poste, subestação ou obra.', 'Mande a lista. A equipe confere a referência e responde com preço e prazo.'];
const PASSOS_GERAL = ['Liste os itens e as quantidades.', 'Informe medida, bitola ou tamanho de cada um.', 'Mande a lista. A equipe confere e responde com preço e prazo.'];

let n = 0;
for (const f of fs.readdirSync(path.join(RAIZ, 'categorias')).filter(x => x.endsWith('.html'))) {
  const arq = path.join(RAIZ, 'categorias', f);
  const orig = fs.readFileSync(arq, 'utf8'), crlf = orig.includes('\r\n');
  let s = orig.replace(/\r\n/g, '\n');
  s = s.replace(/<!--cg-guia-->[\s\S]*?<!--\/cg-guia-->\n?/, '');
  const grupo = /^grupo-([a-z])\.html$/.exec(f);
  const rel = grupo ? guias.filter(g => (g.rel || []).some(r => r.id.startsWith(grupo[1] + '-'))).slice(0, 2) : [];
  const links = rel.map(g => `<li><a href="../guias/${esc(g.id)}.html">${esc(g.titulo)}</a></li>`).join('');
  const bloco = `<!--cg-guia--><aside class="cg-guia" aria-labelledby="cg-guia-t"><h2 id="cg-guia-t">Como escolher</h2><ol>${(grupo ? PASSOS_RITZ : PASSOS_GERAL).map(p => `<li>${p}</li>`).join('')}</ol>` +
    (links ? `<p class="cg-guia-t">Para ler antes:</p><ul class="cg-guia-lk">${links}</ul>` : '') + `<a class="btn btn-gold btn-sm" href="../produtos.html#orcamento">Mandar minha lista</a></aside><!--/cg-guia-->`;
  const meta = s.match(/<div class="cg-meta">[\s\S]*?<\/div>/);
  if (meta) s = s.replace(meta[0], () => bloco);
  else { const i = s.indexOf('<!--share-->'); if (i < 0) continue; s = s.slice(0, i) + bloco + s.slice(i); }
  if (crlf) s = s.replace(/\n/g, '\r\n');
  if (s !== orig) { fs.writeFileSync(arq, s); n++; }
}
console.log(`categorias: ${n} atualizadas`);
