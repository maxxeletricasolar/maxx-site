// Tira o texto de busca (data-q) dos cartões de produtos.html e o guarda em assets/catalogo-busca.json (idempotente).
// O data-q dos 338 cartões pesava 53 KB comprimidos (45% do catálogo). Agora a busca baixa o JSON só quando a pessoa
// clica no campo (JS do catálogo em assets/h/, procure "catalogo-busca.json").
// Fluxo: tools/ritz/importar.py gera os cartões com data-q; rode este script logo depois, e então reindexar-assets.js.
// Uso: node tools/busca-catalogo.js
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const raiz = path.join(__dirname, "..");
const arqHtml = path.join(raiz, "produtos.html");
const arqJson = path.join(raiz, "assets", "catalogo-busca.json");

function desescapar(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}
let html = fs.readFileSync(arqHtml, "utf8");
let mapa = {};
if (fs.existsSync(arqJson)) mapa = JSON.parse(fs.readFileSync(arqJson, "utf8"));

let novos = 0;
html = html.replace(/(<article class="pcard" id="([^"]+)") data-q="([^"]*)"/g, function (_, ini, id, q) {
  mapa[id] = desescapar(q); novos++;
  return ini;
});
// descarta entradas de cartões que não existem mais
const ids = new Set(); html.replace(/<article class="pcard" id="([^"]+)"/g, function (_, id) { ids.add(id); });
Object.keys(mapa).forEach(function (k) { if (!ids.has(k)) delete mapa[k]; });

const ordenado = {}; Object.keys(mapa).sort().forEach(function (k) { ordenado[k] = mapa[k]; });
const json = JSON.stringify(ordenado);
fs.writeFileSync(arqJson, json);
const v = crypto.createHash("sha1").update(json).digest("hex").slice(0, 8);

// versão do JSON no campo de busca (o JS lê data-busca-v para pedir assets/catalogo-busca.json?v=...)
html = html.replace(/(<input[^>]*id="cat-q")(?: data-busca-v="[0-9a-f]+")?/, '$1 data-busca-v="' + v + '"');
fs.writeFileSync(arqHtml, html);
console.log("data-q movidos: " + novos + " | entradas no JSON: " + Object.keys(ordenado).length + " | versão " + v);
