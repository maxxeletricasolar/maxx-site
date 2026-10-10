// Limpeza das tabelas técnicas do catálogo (assets/catalogo-data.js).
// As tabelas vieram de PDF: colunas vazias, linhas de título coladas em uma célula e cabeçalhos fora de alinhamento.
// Este módulo NÃO inventa rótulos: só usa o texto que o catálogo já tem, alinhado à coluna, e marca o que ficou incerto.
// Correções manuais (curadoria) em dados/tabelas-curadas.json têm prioridade sobre a limpeza automática.
'use strict';

const RE_REF = /^[A-Z]{2,5}[0-9]{3,6}(-[0-9A-Z]+)*$/;
const RE_NUM = /^[<>≤≥~±]?\s*[0-9][0-9.,]*(\s?[x×/\-–]\s?[0-9][0-9.,]*)*(\s?(mm|cm|m|kg|lb|kV|V|A|kA|Hz|daN|mm²|"|pol\.?|%))?$/i;
const KW_HEAD = /(Dimens|Peso|Refer[eê]ncia|Tens[aã]o|Comprimento|C[oó]digo|Modelo|Tipo|Bitola|Se[cç][aã]o|Classe|Sacola|Di[aâ]metro|Capacidade|Corrente|Material|Quantidade|Descri)/i;

const limpa = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const ehRef = (s) => RE_REF.test(limpa(s));
const ehNum = (s) => RE_NUM.test(limpa(s));
const ehDado = (s) => ehRef(s) || ehNum(s);

// legenda tirada da linha-título (a célula gigante): remove "EM CONFORMIDADE NORMA ..." e corta no 1º termo de cabeçalho
function legendaDoTitulo(txt) {
  let t = limpa(txt).replace(/^EM CONFORMIDADE\s+(COM\s+)?(A\s+)?NORMAS?\s*/i, '');
  t = t.replace(/^((IEC|ABNT|NBR|ASTM|ANSI|IEEE|NR|ISO)[\s-]*[0-9A-Z.\-:/]+\s*)+/i, '');
  const m = t.search(KW_HEAD);
  if (m > 0) t = t.slice(0, m);
  t = limpa(t);
  return t.length >= 4 && t.length <= 90 ? t : '';
}

function normaliza(grade) {
  let rows = (grade || []).map((r) => r.map(limpa));
  const larg = Math.max(0, ...rows.map((r) => r.length));
  rows = rows.map((r) => r.concat(Array(larg - r.length).fill('')));
  rows = rows.filter((r) => r.some(Boolean));
  // linha-título: uma célula enorme e o resto vazio
  let legenda = '';
  rows = rows.filter((r) => {
    const cheias = r.filter(Boolean);
    if (cheias.length === 1 && cheias[0].length > 90) { legenda = legenda || legendaDoTitulo(cheias[0]); return false; }
    return true;
  });
  // 1ª linha de dados: >=60% das células preenchidas são dados (código ou número) e há ao menos 2
  const dado = (r) => { const c = r.filter(Boolean); return c.length >= 2 && c.filter(ehDado).length / c.length >= 0.6; };
  let ini = rows.findIndex(dado);
  if (ini < 0) return { ok: false, motivo: 'sem-linhas-de-dados', legenda, rows };
  const cab = rows.slice(0, ini), corpo = rows.slice(ini).filter(dado);
  const perdidas = rows.slice(ini).length - corpo.length; // linhas intercaladas (subtítulos): descartadas e contadas
  // colunas completamente vazias saem
  const usa = [];
  for (let c = 0; c < larg; c++) if (corpo.some((r) => r[c]) || cab.some((r) => r[c])) usa.push(c);
  return { ok: true, legenda, cab, corpo, usa, perdidas, larg };
}

function montaCabecalhos(n) {
  const { cab, usa, corpo } = n;
  // fragmentos por coluna, de cima para baixo; filhos (kg, lb) herdam o pai da esquerda quando a coluna não tem pai
  const frag = usa.map((c) => cab.map((r) => r[c]).filter(Boolean));
  const topo = cab.length ? usa.map((c) => cab[0][c] || '') : usa.map(() => '');
  return usa.map((c, i) => {
    let f = frag[i].slice();
    if (f.length && !topo[i]) {
      for (let j = i - 1; j >= 0; j--) { if (topo[j]) { f = [topo[j], ...f]; break; } if (frag[j].length === 0) break; }
    }
    const uniq = f.filter((x, k) => f.indexOf(x) === k);
    const t = limpa(uniq.join(' '));
    // texto de PDF que juntou vários títulos numa célula (ex.: "Dimensões Ø Comprimento Comprimento (mm) Isolante (m) Total (m)"):
    // não dá para saber a qual coluna cada trecho pertence, então a coluna fica sem título em vez de ganhar um título errado
    const unidades = (t.match(/\((?:mm|m|kg|lb|kv|a|ka)\)/gi) || []).length;
    return t.length > 48 || unidades >= 2 ? '' : t;
  });
}

// preenche células vazias de colunas "mescladas" (ex.: diâmetro 32 que vale para as 5 linhas): só se a 1ª linha tem valor e
// menos da metade das linhas está preenchida. Marca a coluna para o aviso de conferência.
function preencheMescladas(corpo, usa) {
  const marcadas = [];
  usa.forEach((c, i) => {
    const vals = corpo.map((r) => r[c]);
    const cheios = vals.filter(Boolean).length;
    if (vals[0] && cheios >= 1 && cheios < corpo.length / 2) {
      let ult = '';
      corpo.forEach((r) => { if (r[c]) ult = r[c]; else r[c] = ult; });
      marcadas.push(i);
    }
  });
  return marcadas;
}

function limpaTabela(grade, curada) {
  if (curada) {
    return { ...curada, confianca: 'curada', refCol: curada.refCol != null ? curada.refCol : curada.cols.findIndex((x) => /refer[eê]ncia|c[oó]digo/i.test(x)) };
  }
  const n = normaliza(grade);
  if (!n.ok) return { confianca: 'baixa', motivo: n.motivo, legenda: n.legenda, bruta: true };
  const cols = montaCabecalhos(n);
  const corpo = n.corpo.map((r) => r.slice());
  const mescladas = preencheMescladas(corpo, n.usa);
  const rows = corpo.map((r) => n.usa.map((c) => r[c]));
  const semTitulo = cols.map((t, i) => (t ? -1 : i)).filter((i) => i >= 0);
  // coluna de referência: a que mais tem códigos, se ao menos 80% das linhas têm código
  let refCol = -1, melhor = 0;
  n.usa.forEach((c, i) => { const q = rows.filter((r) => ehRef(r[i])).length; if (q > melhor) { melhor = q; refCol = i; } });
  if (melhor < rows.length * 0.8) refCol = -1;
  // coluna de tensão: título cita "Tensão" ou "(kV)" e todos os valores são números
  let tensaoCol = cols.findIndex((t, i) => /tens[aã]o|\(kv\)/i.test(t) && rows.every((r) => ehNum(r[i])));
  let conf = 'alta';
  if (semTitulo.length || mescladas.length || n.perdidas) conf = 'media';
  if (semTitulo.length > Math.ceil(cols.length / 2) || cols.length > 11 || rows.length < 1) conf = 'baixa';
  return { confianca: conf, legenda: n.legenda, cols, rows, refCol, tensaoCol, semTitulo, mescladas, perdidas: n.perdidas };
}

module.exports = { limpaTabela, ehRef, ehNum, limpa, RE_REF };
