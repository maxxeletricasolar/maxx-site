// Regera, em produtos/*.html, o bloco de compra (seletor por tensão ou por referência) e a seção de tabelas.
// Idempotente: usa os marcadores <!--pm-buy--> e <!--pm-tab--> e, na 1ª execução, troca o HTML antigo (pd-buy / pd-tables / pd-more).
// Uso: node tools/paginas-produto.js [--relatorio]   (a partir da raiz do repositório)
// Depois rode o reindexador (tools/reindexar-assets.js) e confira com tools/verificar-site.js.
'use strict';
const fs = require('fs'), path = require('path');
const { limpaTabela, ehRef, limpa } = require('./tabelas.js');

const RAIZ = path.resolve(__dirname, '..');
global.window = {};
require(path.join(RAIZ, 'assets/catalogo-data.js'));
const CAT = global.window.__CAT;
let curadas = {};
try { curadas = JSON.parse(fs.readFileSync(path.join(__dirname, 'tabelas-curadas.json'), 'utf8')); } catch (e) {}

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrJson = (o) => esc(JSON.stringify(o));
const SEM_COMPRA = ['c-aplicacao-manuseio-e-conservacao']; // texto de orientação, não é produto à venda
const SEM_TITULO = 'sem título no catálogo';
const AVISO_CATALOGO = 'Informações do Catálogo de Produtos MAXX rev. 07/2026. Confirme a especificação com a equipe antes da compra.';

function tabelasDoProduto(p) {
  return (p.tabelas || []).map((g, i) => {
    const c = curadas[p.id] && curadas[p.id][i];
    const t = limpaTabela(g, c);
    t.indice = i; t.grade = g;
    return t;
  });
}

function refsDaPagina(html) {
  const m = html.match(/<div class="(?:pd-refs|pm-refs)"[^>]*>([\s\S]*?)<\/div>/); // pd-refs: página original; pm-refs: já regerada
  if (!m) return [];
  return [...m[1].matchAll(/<span class="badge">([^<]+)<\/span>/g)].map((x) => x[1].trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')).filter((r, i, a) => a.indexOf(r) === i);
}

// ---------- bloco de compra ----------
function blocoCompra(p, tabs, refsSoltas) {
  const pick = tabs.filter((t) => t.refCol >= 0 && t.rows && (t.confianca === 'curada' || t.confianca === 'alta' || t.confianca === 'media'));
  const nome = p.nome;
  let topo = '', dadosAttr = '', exige = '';
  const primeira = pick[0];
  const kvs = primeira && primeira.tensaoCol >= 0 ? [...new Set(primeira.rows.map((r) => r[primeira.tensaoCol]))] : [];
  if (primeira && kvs.length >= 2 && kvs.length <= 7) {
    // B: escolha pela tensão (a tabela dá a referência certa)
    exige = ' data-exige';
    dadosAttr = ` data-tab="${attrJson({ cols: primeira.cols, rows: primeira.rows, ref: primeira.refCol, kv: primeira.tensaoCol })}"`;
    const modelo = primeira.legenda ? `<span class="pm-modelo">${esc(primeira.legenda)}</span>` : '';
    topo = `<fieldset class="pm-conf"><legend>Tensão máxima de uso (kV)${modelo ? ' · ' + modelo : ''}</legend>` +
      `<div class="pm-seg" role="radiogroup" style="--n:${kvs.length}">` +
      kvs.map((k, i) => `<label class="pm-seg-i"><input type="radio" name="kv" value="${esc(k)}"${i === 0 ? '' : ''}><span>${esc(k)} kV</span></label>`).join('') +
      '</div></fieldset>' +
      '<div class="pm-sel" data-cartao hidden aria-live="polite"></div>' +
      '<p class="pm-erro" data-erro role="alert"></p>' +
      (pick.length > 1 ? '<p class="pm-note"><a href="#pm-spec-t">Há outros modelos nas tabelas abaixo.</a></p>' : '');
  } else if (pick.length) {
    // A: seleção da referência
    const grupos = pick.map((t, gi) => {
      const rot = t.legenda || (pick.length > 1 ? `Tabela ${gi + 1}` : '');
      const ops = t.rows.map((r) => {
        const kv = t.tensaoCol >= 0 && r[t.tensaoCol] ? ` · ${esc(r[t.tensaoCol])} kV` : '';
        return `<option value="${esc(r[t.refCol])}">${esc(r[t.refCol])}${kv}</option>`;
      }).join('');
      return rot ? `<optgroup label="${esc(rot)}">${ops}</optgroup>` : ops;
    }).join('');
    topo = '<label for="pm-ref">Referência</label>' +
      `<select id="pm-ref" data-ref-sel><option value="">Não sei a referência, a equipe me ajuda</option>${grupos}</select>`;
  } else if (refsSoltas.length) {
    topo = '<label for="pm-ref">Referência</label>' +
      `<select id="pm-ref" data-ref-sel><option value="">Não sei a referência, a equipe me ajuda</option>${refsSoltas.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select>`;
  }
  return `<!--pm-buy--><div class="pm-buy" data-lista-prod data-id="${esc(p.id)}" data-nome="${esc(nome)}"${exige}${dadosAttr}>` +
    topo +
    '<div class="pm-row"><span class="pm-lb" id="pm-qlb">Quantidade</span>' +
    '<div class="pm-step" role="group" aria-labelledby="pm-qlb"><button type="button" data-qstep="-1" aria-label="Diminuir">−</button>' +
    '<input type="number" inputmode="numeric" min="1" max="9999" value="1" data-q aria-label="Quantidade"><button type="button" data-qstep="1" aria-label="Aumentar">+</button></div></div>' +
    '<button type="button" class="btn btn-gold" data-add>Adicionar à lista de orçamento</button>' +
    '<a class="btn btn-ghost" data-wa-buy href="https://wa.me/5586994540900">Pedir orçamento no WhatsApp</a>' +
    (exige ? '<a class="pm-unsure" data-ajuda href="https://wa.me/5586994540900">Não sei qual tensão, quero ajuda</a>' : '') +
    '<p class="pm-note"><b>Preço sob consulta.</b> A equipe confere estoque e referência e responde em até 24 horas pelo WhatsApp.</p>' +
    '</div><!--/pm-buy-->';
}

// ---------- tabelas ----------
function cabecalho(t) {
  return t.cols.map((c) => (c ? `<th scope="col"${/\((kg|m|mm|lb|kv)\)|kg|lb/i.test(c) ? ' class="n"' : ''}>${esc(c)}</th>` : `<th scope="col"><span class="sr">Coluna ${SEM_TITULO}</span></th>`));
}
function tabelaPick(t, p, n) {
  const prio = new Set(); // colunas que aparecem no cartão do celular
  t.cols.forEach((c, i) => { if (i !== t.refCol && c && prio.size < 3) prio.add(i); });
  const th = cabecalho(t);
  const cap = t.legenda || `Tabela ${n}`;
  const head = '<tr><th scope="col" class="chk"><span class="sr">Selecionar</span></th>' + th.map((h, i) => (i === t.refCol ? h.replace('<th scope="col"', '<th scope="col" class="ref"') : h)).join('') + '<th scope="col" class="qtd">Qtd.</th></tr>';
  const body = t.rows.map((r, ri) => {
    const ref = r[t.refCol], id = `pk-${t.indice}-${ri}`;
    const cells = r.map((v, i) => {
      if (i === t.refCol) return `<th scope="row" class="ref" data-l="Referência">${esc(v)}</th>`;
      const l = t.cols[i] || SEM_TITULO;
      return `<td data-l="${esc(l)}"${prio.has(i) ? ' class="m"' : ''}>${esc(v)}</td>`;
    }).join('');
    return `<tr data-row="${esc(ref)}"><td class="chk"><input type="checkbox" id="${id}" aria-label="Selecionar ${esc(ref)}"></td>${cells}` +
      `<td class="qtd"><input type="number" inputmode="numeric" min="1" max="9999" value="1" aria-label="Quantidade de ${esc(ref)}"></td></tr>`;
  }).join('');
  return `<div class="pm-tbl" data-pick tabindex="0" role="region" aria-label="${esc(cap)}"><table><caption>${esc(cap)}</caption><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}
function tabelaLeitura(t, n) {
  const cap = t.legenda || `Tabela ${n}`;
  const body = t.rows.map((r) => '<tr>' + r.map((v, i) => `<td data-l="${esc(t.cols[i] || SEM_TITULO)}">${esc(v)}</td>`).join('') + '</tr>').join('');
  return `<div class="pm-tbl" tabindex="0" role="region" aria-label="${esc(cap)}"><table><caption>${esc(cap)}</caption><thead><tr>${cabecalho(t).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function tabelaBruta(t, n) {
  const g = (t.grade || []).map((r) => r.map(limpa)).filter((r) => r.some(Boolean));
  if (!g.length) return '';
  const larg = Math.max(...g.map((r) => r.length));
  const usa = []; for (let c = 0; c < larg; c++) if (g.some((r) => r[c])) usa.push(c);
  const body = g.map((r) => '<tr>' + usa.map((c) => `<td>${esc(r[c] || '')}</td>`).join('') + '</tr>').join('');
  return `<details class="pm-raw"><summary>Texto do catálogo ${n} (formato original)</summary><div class="pm-tbl" tabindex="0" role="region" aria-label="Texto do catálogo ${n}"><table><tbody>${body}</tbody></table></div></details>`;
}

function secaoTabelas(p, tabs, refsSoltas, relatorio) {
  let n = 0, temPick = false, temAviso = false;
  const partes = tabs.map((t) => {
    n++;
    if (t.confianca === 'baixa' || t.bruta || !t.rows) { temAviso = true; return tabelaBruta(t, n); }
    if (t.confianca === 'media') temAviso = true;
    if (t.refCol >= 0) { temPick = true; return tabelaPick(t, p, n); }
    return tabelaLeitura(t, n);
  }).filter(Boolean);
  if (!partes.length && !refsSoltas.length) return { html: '', bar: '' };
  const intro = temPick
    ? '<p class="pm-sub">Marque as referências de que precisa, ajuste a quantidade e adicione tudo de uma vez à lista de orçamento.</p>'
    : '<p class="pm-sub">Medidas e referências do catálogo do fabricante.</p>';
  const aviso = temAviso ? '<p class="pm-aviso" role="note">Algumas colunas não têm título no catálogo original. Confirme medidas e referências com a equipe antes de comprar.</p>' : '';
  const refs = !temPick && refsSoltas.length // sem tabela selecionável, as referências soltas são a fonte do seletor e precisam ficar na página
    ? `<details class="pm-raw" open><summary>Referências do catálogo (${refsSoltas.length})</summary><div class="pm-refs">${refsSoltas.map((r) => `<span class="badge">${esc(r)}</span>`).join('')}</div></details>` : '';
  const html = '<!--pm-tab--><section class="pm-specs" aria-labelledby="pm-spec-t"><h2 id="pm-spec-t">Referências e medidas</h2>' +
    intro + aviso + partes.join('') + refs + `<p class="hint">${AVISO_CATALOGO}</p></section><!--/pm-tab-->`;
  const bar = temPick
    ? `<div class="pm-bar" data-pm-bar data-id="${esc(p.id)}" data-nome="${esc(p.nome)}" hidden><div class="wrap">` +
      '<p data-bar-txt aria-live="polite">0 referências</p>' +
      '<button type="button" class="btn btn-gold" data-bar-add>Adicionar à lista de orçamento</button>' +
      '<a class="btn btn-ghost" data-bar-wa href="https://wa.me/5586994540900">Pedir orçamento no WhatsApp</a></div></div>'
    : '';
  return { html, bar, temPick };
}

// ---------- aplicação em cada página ----------
function processa(arq, relat) {
  const id = path.basename(arq, '.html');
  const p = CAT.produtos.find((x) => x.id === id);
  if (!p) return false;
  let h = fs.readFileSync(arq, 'utf8');
  const crlf = h.includes('\r\n'); if (crlf) h = h.replace(/\r\n/g, '\n');
  const orig = h;
  const refsSoltas = refsDaPagina(h);
  const tabs = tabelasDoProduto(p);
  // 1) bloco de compra
  const compra = blocoCompra(p, tabs, refsSoltas);
  if (h.includes('<!--pm-buy-->')) h = h.replace(/<!--pm-buy-->[\s\S]*?<!--\/pm-buy-->/, () => compra);
  else h = h.replace(/<div class="pd-buy">[\s\S]*?<\/div><\/div>(?=<!--share-->)/, () => compra);
  // 1b) sem bloco de compra (páginas de produto sem o bloco antigo): entra logo depois do título; páginas de orientação ficam sem
  if (!h.includes('<!--pm-buy-->') && !SEM_COMPRA.includes(id)) h = h.replace(/(<h1>[^<]*<\/h1>)(<!--share-->)/, (m, a, b) => a + '\n' + compra + b);
  // 2) tabelas: tira o que houver (versão antiga ou já gerada) e coloca a seção em largura total, DEPOIS de fechar a coluna de
  //    informações e a grade da página (os dois </div> que antecedem a seção "rel"), para a tabela não ficar espremida na coluna da direita
  h = h.replace(/<div class="pd-tables">(?:<div class="tbl-wrap">[\s\S]*?<\/table><\/div>)+<\/div>\n?/g, '');
  h = h.replace(/<!--pm-tab-->[\s\S]*?<!--\/pm-tab-->(<div class="pm-bar"[\s\S]*?<\/div><\/div>)?\n?/g, '');
  h = h.replace(/<details class="pd-more">[\s\S]*?<\/details>\n?/g, '');
  h = h.replace(/<p class="hint">Informações do Catálogo[^<]*<\/p>\n?/g, '');
  const sec = secaoTabelas(p, tabs, refsSoltas, relat);
  const conteudo = sec.html + sec.bar;
  if (conteudo) h = h.replace(/(<\/div><\/div>\n?)(<section class="rel")/, (m, a, b) => a + conteudo + '\n' + b);
  // 3) script da lista (uma vez)
  if (!h.includes('assets/lista.js')) h = h.replace(/(<script src="\.\.\/assets\/busca\.js)/, '<script src="../assets/lista.js" data-base="../" defer></script>\n$1');
  if (h === orig) return false;
  fs.writeFileSync(arq, crlf ? h.replace(/\n/g, '\r\n') : h);
  return true;
}

function relatorioRevisao() {
  const linhas = ['produto;tabela;confianca;colunas_sem_titulo;colunas_mescladas_preenchidas;linhas;referencias;pagina_catalogo'];
  CAT.produtos.forEach((p) => tabelasDoProduto(p).forEach((t) => {
    if (t.confianca === 'curada') return;
    const refs = t.rows && t.refCol >= 0 ? t.rows.length : 0;
    linhas.push([p.id, t.indice + 1, t.confianca, (t.semTitulo || []).length, (t.mescladas || []).length, t.rows ? t.rows.length : '', refs, p.pag].join(';'));
  }));
  fs.writeFileSync(path.join(RAIZ, 'tools/revisao-tabelas.csv'), linhas.join('\n') + '\n');
  return linhas.length - 1;
}

if (require.main === module) {
  const dir = path.join(RAIZ, 'produtos');
  let alt = 0, tot = 0;
  fs.readdirSync(dir).filter((f) => f.endsWith('.html')).forEach((f) => { tot++; if (processa(path.join(dir, f))) alt++; });
  const q = relatorioRevisao();
  console.log(`produtos: ${alt} de ${tot} páginas atualizadas; ${q} tabelas na planilha de revisão (tools/revisao-tabelas.csv)`);
}
module.exports = { processa, tabelasDoProduto };
