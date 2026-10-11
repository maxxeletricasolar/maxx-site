// Atualiza o <lastmod> do sitemap.xml com a data real da última alteração de cada página (git; arquivo ainda não commitado = hoje).
// Uso: node tools/sitemap-datas.js   (a partir da raiz do repositório)
'use strict';
const fs = require('fs'), cp = require('child_process');
const RAIZ = require('path').resolve(__dirname, '..');
const sh = (c) => cp.execSync(c, { cwd: RAIZ, encoding: 'utf8' }).trim();
const hoje = new Date().toISOString().slice(0, 10);
const sujos = new Set(sh('git status --porcelain').split('\n').map((l) => l.slice(3).trim()).filter(Boolean));
let xml = fs.readFileSync(RAIZ + '/sitemap.xml', 'utf8'), n = 0;
xml = xml.replace(/<loc>https:\/\/maxxeletricasolar\.com\.br\/([^<]*)<\/loc><lastmod>[^<]*<\/lastmod>/g, (m, rota) => {
  const arq = rota === '' ? 'index.html' : rota;
  if (!fs.existsSync(RAIZ + '/' + arq)) return m;
  const d = sujos.has(arq) ? hoje : (sh(`git log -1 --format=%cs -- "${arq}"`) || hoje);
  n++;
  return `<loc>https://maxxeletricasolar.com.br/${rota}</loc><lastmod>${d}</lastmod>`;
});
fs.writeFileSync(RAIZ + '/sitemap.xml', xml);
console.log('lastmod atualizado em ' + n + ' URL(s).');
