// Equivalente em Node do tools/reindexar-assets.ps1 (mesmo algoritmo: SHA1 do conteúdo com fim de linha LF).
// Renomeia assets/h/* pelo hash, atualiza as páginas e versiona (?v=) os estáticos sem hash no nome.
// Uso: node tools/reindexar-assets.js   (a partir da raiz do repositório)
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const RAIZ = path.resolve(__dirname, '..');
const hash = (arq, n) => crypto.createHash('sha1').update(fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n'), 'utf8').digest('hex').slice(0, n);
const ESTATICOS = ['site.css', 'busca.js', 'efeitos.js', 'compartilhar.js', 'lista.js'];

function htmls(dir, acc = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['img', 'node_modules', '.git', '_mock', '.impeccable'].includes(e.name)) htmls(p, acc); }
    else if (e.name.endsWith('.html')) acc.push(p);
  });
  return acc;
}
const paginas = htmls(RAIZ);

// 1) assets/h
const dirH = path.join(RAIZ, 'assets/h'), mapa = {};
fs.readdirSync(dirH).filter((f) => /\.(css|js)$/.test(f)).forEach((f) => {
  const ext = path.extname(f), novo = hash(path.join(dirH, f), 10) + ext;
  if (novo !== f) { const dest = path.join(dirH, novo); if (fs.existsSync(dest)) fs.unlinkSync(path.join(dirH, f)); else fs.renameSync(path.join(dirH, f), dest); mapa[f] = novo; }
});
// 2) ?v= dos estáticos
const vers = {};
ESTATICOS.forEach((n) => { const p = path.join(RAIZ, 'assets', n); if (fs.existsSync(p)) vers[n] = hash(p, 8); });
let altV = 0, altM = 0;
paginas.forEach((pg) => {
  let t = fs.readFileSync(pg, 'utf8'); const o = t;
  Object.keys(vers).forEach((n) => { t = t.replace(new RegExp('(assets/' + n.replace('.', '\\.') + ')(\\?v=[0-9a-f]+)?(?=["\'])', 'g'), `$1?v=${vers[n]}`); });
  if (t !== o) { fs.writeFileSync(pg, t); altV++; }
  if (Object.keys(mapa).length) { let u = t; Object.keys(mapa).forEach((k) => { u = u.split('assets/h/' + k).join('assets/h/' + mapa[k]); }); if (u !== t) { fs.writeFileSync(pg, u); altM++; } }
});
console.log('Versão dos estáticos: ' + Object.entries(vers).map(([k, v]) => `${k}=${v}`).join(', ') + ` (${altV} página(s) atualizadas)`);
Object.entries(mapa).forEach(([k, v]) => console.log(`${k} -> ${v}`));
if (Object.keys(mapa).length) console.log(`Referências atualizadas em ${altM} página(s).`);
// 3) referências quebradas
let quebradas = 0;
paginas.forEach((pg) => { for (const m of fs.readFileSync(pg, 'utf8').matchAll(/assets\/h\/([0-9a-f]{10}\.(?:css|js))/g)) if (!fs.existsSync(path.join(dirH, m[1]))) { console.warn(`Referência quebrada: assets/h/${m[1]} <- ${path.relative(RAIZ, pg)}`); quebradas++; } });
if (!quebradas) console.log('Referências a assets/h: todas existem.');
