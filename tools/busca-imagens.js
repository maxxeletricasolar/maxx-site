// Põe em assets/busca.json a foto de cada produto (campo "m", caminho a partir da raiz) para a busca rápida mostrar a prévia.
// A foto é a primeira da página do produto (#pd-img); produto sem foto fica com "m" vazio e a busca mostra a letra da categoria.
// Idempotente. Uso: node tools/busca-imagens.js (a partir da raiz do repositório); depois, reindexar-assets.
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const arq = path.join(RAIZ, 'assets/busca.json');
const d = JSON.parse(fs.readFileSync(arq, 'utf8'));
let com = 0, sem = 0;
d.p.forEach((p) => {
  const pg = path.join(RAIZ, 'produtos', p.i + '.html');
  let m = '';
  if (fs.existsSync(pg)) {
    const t = fs.readFileSync(pg, 'utf8').match(/id="pd-img" src="\.\.\/([^"]+)"/);
    if (t && !/sem-foto/.test(t[1])) m = t[1];
  }
  p.m = m; m ? com++ : sem++;
});
fs.writeFileSync(arq, JSON.stringify(d));
console.log(`busca.json: ${com} produto(s) com foto, ${sem} sem foto.`);
