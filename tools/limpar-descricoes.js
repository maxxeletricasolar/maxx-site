// Tira a repeticao da descricao dos produtos (texto extraido do PDF do catalogo).
// Idempotente. Mexe em assets/catalogo-data.js (campo conteudo) e no bloco .pd-desc de produtos/*.html.
// Regra: um bloco sai se um bloco ANTERIOR do mesmo produto tem o mesmo tipo e contem o mesmo texto
// (igual, ou legenda colada no fim de um paragrafo maior). O primeiro aparece sempre.
// Uso: node tools/limpar-descricoes.js [--so-relatorio]
const fs = require("fs"), path = require("path");
const raiz = path.join(__dirname, "..");
const soRelatorio = process.argv.includes("--so-relatorio");
const MIN = 25; // texto menor que isso so sai se for igual

function repetido(tipo, texto, antes) {
  return antes.some(function (o) {
    if (o.t !== tipo) return false;
    if (o.x === texto) return true;
    return tipo === "p" && texto.length >= MIN && o.x.length > texto.length && o.x.includes(texto);
  });
}
function limpar(blocos) {
  const fica = [], saiu = [];
  blocos.forEach(function (b) { (repetido(b.t, b.x, fica) ? saiu : fica).push(b); });
  return { fica: fica, saiu: saiu };
}
function desescapar(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

// 1) catalogo
const arqCat = path.join(raiz, "assets", "catalogo-data.js");
const src = fs.readFileSync(arqCat, "utf8");
const m = src.match(/^window\.__CAT=([\s\S]*?);\s*$/);
const cat = JSON.parse(m[1]);
let nProd = 0, nBlocos = 0;
cat.produtos.forEach(function (p) {
  const r = limpar(p.conteudo || []);
  if (r.saiu.length) { nProd++; nBlocos += r.saiu.length; p.conteudo = r.fica; }
});
console.log("catalogo: " + nBlocos + " bloco(s) repetido(s) em " + nProd + " produto(s)");
if (!soRelatorio && nBlocos) fs.writeFileSync(arqCat, "window.__CAT=" + JSON.stringify(cat) + ";\n");

// 2) paginas
let pgs = 0, pgBlocos = 0;
fs.readdirSync(path.join(raiz, "produtos")).filter(function (f) { return f.endsWith(".html"); }).forEach(function (f) {
  const arq = path.join(raiz, "produtos", f);
  const html = fs.readFileSync(arq, "utf8");
  const mm = html.match(/<div class="pd-desc">([\s\S]*?)<\/div>/);
  if (!mm) return;
  const blocos = [], re = /<(p|h2)>([\s\S]*?)<\/\1>/g;
  let k;
  while ((k = re.exec(mm[1]))) blocos.push({ t: k[1] === "h2" ? "h" : "p", x: desescapar(k[2]), html: k[0] });
  const r = limpar(blocos);
  if (!r.saiu.length) return;
  pgs++; pgBlocos += r.saiu.length;
  if (!soRelatorio) fs.writeFileSync(arq, html.replace(mm[0], '<div class="pd-desc">' + r.fica.map(function (b) { return b.html; }).join("") + "</div>"));
});
console.log("paginas: " + pgBlocos + " bloco(s) repetido(s) em " + pgs + " pagina(s)");
