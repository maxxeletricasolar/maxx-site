// Fontes do site sem arquivo extra no caminho crítico (idempotente).
// Cola o conteúdo de assets/fonts.css (as @font-face) dentro de assets/site.css e dos CSS com hash de assets/h/,
// entre os marcadores /*fontes:ini*/ e /*fontes:fim*/, e tira o <link> de assets/fonts.css das páginas.
// Os arquivos woff2 ficam em assets/fonts/. Depois de rodar: node tools/reindexar-assets.js
// Uso: node tools/fontes.js
const fs = require("fs"), path = require("path");
const raiz = path.join(__dirname, "..");
const fonts = fs.readFileSync(path.join(raiz, "assets", "fonts.css"), "utf8").trim();
const INI = "/*fontes:ini*/", FIM = "/*fontes:fim*/";

function bloco(prefixo) { return INI + "\n" + fonts.replace(/url\(fonts\//g, "url(" + prefixo + "fonts/") + "\n" + FIM; }
function injeta(arq, prefixo) {
  let t = fs.readFileSync(arq, "utf8");
  const b = bloco(prefixo);
  const i = t.indexOf(INI), j = t.indexOf(FIM);
  if (i >= 0 && j > i) t = t.slice(0, i) + b + t.slice(j + FIM.length);
  else t = t.replace(/\s*$/, "\n") + b + "\n";
  fs.writeFileSync(arq, t);
}
injeta(path.join(raiz, "assets", "site.css"), "");
fs.readdirSync(path.join(raiz, "assets", "h")).filter(f => f.endsWith(".css"))
  .forEach(f => injeta(path.join(raiz, "assets", "h", f), "../"));

// páginas: sem o <link> de fonts.css (as fontes vêm dentro do CSS principal)
const re = /\n?<link rel="stylesheet" href="[^"]*assets\/fonts\.css\?v=[0-9a-f]+">/;
let n = 0;
(function andar(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    if ([".git", "node_modules", "img", "assets"].includes(e.name)) return;
    const p = path.join(d, e.name);
    if (e.isDirectory()) return andar(p);
    if (!e.name.endsWith(".html")) return;
    const t = fs.readFileSync(p, "utf8");
    if (re.test(t)) { fs.writeFileSync(p, t.replace(re, "")); n++; }
  });
})(raiz);
console.log("fontes coladas nos CSS; <link> removido de " + n + " página(s)");
