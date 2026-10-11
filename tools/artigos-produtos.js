// Põe nos artigos do blog (guias/*.html) a seção "Produtos citados neste artigo", com foto, link e "Adicionar à lista de orçamento".
// Fonte dos produtos citados: o JSON data-guias de guias.html (campo rel); fotos e referências: assets/catalogo-data.js.
// Idempotente (marcadores <!--art-prod--> e <!--/art-prod-->). Uso: node tools/artigos-produtos.js
// Depois: node tools/shell-paginas.js (estilo, em tools/produto.css) e node tools/reindexar-assets.js
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
global.window = {}; eval(fs.readFileSync(path.join(RAIZ, 'assets/catalogo-data.js'), 'utf8'));
const prod = Object.fromEntries(window.__CAT.produtos.map(p => [p.id, p]));
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const guias = JSON.parse(fs.readFileSync(path.join(RAIZ, 'guias.html'), 'utf8').match(/id="data-guias">([\s\S]*?)<\/script>/)[1]);

let n = 0;
for (const g of guias) {
  const arq = path.join(RAIZ, 'guias', g.id + '.html');
  if (!fs.existsSync(arq)) continue;
  const orig = fs.readFileSync(arq, 'utf8'), crlf = orig.includes('\r\n');
  let s = orig.replace(/\r\n/g, '\n');
  s = s.replace(/<!--art-prod-->[\s\S]*?<!--\/art-prod-->\n?/, '');
  s = s.replace(/<section class="rel"><h2>Produtos citados neste artigo<\/h2>[\s\S]*?<\/section>\n?/, ''); // versão antiga, só com links de texto
  const itens = (g.rel || []).map(r => prod[r.id]).filter(Boolean).map(p => {
    const href = `../produtos/${p.id}.html`, foto = p.imgs && p.imgs[0] ? '../' + p.imgs[0] : '../img/sem-foto.svg';
    const sub = esc((p.marca || 'Ritz') + (p.refs && p.refs.length > 1 ? ' · ' + p.refs.length + ' referências' : p.refs && p.refs[0] ? ' · Ref. ' + p.refs[0] : ''));
    const compra = p.info ? '' : `<button type="button" class="btn btn-gold btn-sm" data-add-prod="${esc(p.id)}" data-nome="${esc(p.nome)}">Adicionar à lista de orçamento</button>`;
    const acao = p.info ? `<a class="btn btn-ghost btn-sm" href="${href}">Ver produto</a>` : `<button type="button" class="btn btn-gold btn-sm" data-add-prod="${esc(p.id)}" data-nome="${esc(p.nome)}">Adicionar à lista de orçamento</button>`;
    return `<li class="ap-row"><a class="ap-link" href="${href}"><span class="ap-ph"><img src="${esc(foto)}" alt="" loading="lazy" width="320" height="240"></span><span class="ap-tx"><strong>${esc(p.nome)}</strong><small>${sub}</small></span></a>${acao}</li>`;
  });
  if (!itens.length) continue;
  const bloco = `<!--art-prod--><section class="art-prod" aria-labelledby="ap-t"><h2 id="ap-t">Produtos citados neste artigo</h2><ul class="ap-list">${itens.join('')}</ul><p class="hint">Sem referência escolhida, a equipe confirma a medida e a tensão certas antes de orçar.</p></section><!--/art-prod-->\n`;
  s = s.replace(/<!--art-nav-->[\s\S]*?<!--\/art-nav-->\n?/, '');
  const k = guias.indexOf(g), ant = guias[k - 1], prox = guias[k + 1];
  const lk = (x, rot, rel) => `<a class="an-${rel}" rel="${rel}" href="${esc(x.id)}.html"><small>${rot}</small><strong>${esc(x.titulo)}</strong></a>`;
  const nav = `<!--art-nav--><nav class="art-nav" aria-label="Outros artigos">${ant ? lk(ant, '‹ Artigo anterior', 'prev') : ''}${prox ? lk(prox, 'Próximo artigo ›', 'next') : ''}</nav><p class="art-todos"><a href="../guias.html">Ver todos os artigos do blog técnico</a></p><!--/art-nav-->\n`;
  s = s.replace(/<section class="rel"><h2>Leia também<\/h2>[\s\S]*?<\/section>\n?/, '');
  const i = s.indexOf('</article>');
  if (i < 0) continue;
  s = s.slice(0, i) + bloco + nav + s.slice(i);
  if (crlf) s = s.replace(/\n/g, '\r\n');
  if (s !== orig) { fs.writeFileSync(arq, s); n++; }
}
console.log(`artigos: ${n} de ${guias.length} atualizados`);
