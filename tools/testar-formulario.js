// Testa o enviar-pedido.php com o servidor embutido do PHP (sem enviar e-mail de verdade: mail() falha localmente, e isso conta como "chegou ao envio").
// Uso (na raiz do repositório):  PHP_EXE=C:/caminho/php.exe node tools/testar-formulario.js [porta]
// Precisa do PHP com a extensão mbstring ativa (php.ini com extension=mbstring).
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const porta = Number(process.argv[2] || 8899);
const php = process.env.PHP_EXE || 'php';
const raiz = path.resolve(__dirname, '..');
// limpa marcadores de rate limit de execuções anteriores
const tmp = require('os').tmpdir();
for (const d of [tmp, path.join(tmp, 'maxx_rl')]) { try { for (const f of fs.readdirSync(d)) if (f.startsWith('maxx_rl_')) fs.unlinkSync(path.join(d, f)); } catch (e) {} }

const base = { Nome: 'Maria Silva', WhatsApp: '(86) 99454-0900', 'Empresa/obra': 'Eletro Teste', 'Cidade de entrega': 'Teresina', Mensagem: 'Preciso de 10 grampos' };
let cont = 0;
function pedido(opts) {
  const { metodo = 'POST', ct = 'application/json', origin = 'https://maxxeletricasolar.com.br', corpo = base, extra = {} } = opts;
  return new Promise((res) => {
    const dados = metodo === 'GET' ? '' : (typeof corpo === 'string' ? corpo : JSON.stringify(corpo));
    const h = { 'Content-Type': ct, 'CF-Connecting-IP': opts.ip || ('10.9.' + Math.floor(++cont / 250) + '.' + (cont % 250 + 1)), ...extra };
    if (origin) h.Origin = origin;
    const r = http.request({ host: '127.0.0.1', port: porta, path: '/enviar-pedido.php', method: metodo, headers: { ...h, 'Content-Length': Buffer.byteLength(dados) } }, (resp) => {
      let b = ''; resp.on('data', (c) => b += c); resp.on('end', () => { let j = {}; try { j = JSON.parse(b); } catch (e) {} res({ status: resp.statusCode, msg: j.message || b.slice(0, 60) }); });
    });
    r.on('error', (e) => res({ status: 0, msg: String(e) }));
    if (metodo !== 'GET') r.write(dados); r.end();
  });
}
const mut = (o) => ({ ...base, ...o });
const casos = [
  ['GET é recusado',                          { metodo: 'GET' },                                  405],
  ['Content-Type errado',                     { ct: 'text/plain' },                             415],
  ['origem de outro site',                    { origin: 'https://evil.com' },                    403],
  ['subdomínio qualquer (antes passava)',     { origin: 'https://qualquer.maxxeletricasolar.com.br' }, 403],
  ['www é aceito',                            { origin: 'https://www.maxxeletricasolar.com.br' },  'ok'],
  ['teste é aceito',                          { origin: 'https://teste.maxxeletricasolar.com.br' }, 'ok'],
  ['domínio parecido é recusado',             { origin: 'https://maxxeletricasolar.com.br.evil.com' }, 403],
  ['JSON inválido',                           { corpo: '{nao e json' },                           400],
  ['honeypot finge sucesso',                  { corpo: mut({ _honey: 'x' }) },                   200],
  ['sem Nome',                                { corpo: mut({ Nome: '' }) },                      400],
  ['Nome com link',                           { corpo: mut({ Nome: 'Compre em http://golpe.com' }) }, 400],
  ['Nome com www.',                           { corpo: mut({ Nome: 'visite www.golpe.com' }) },  400],
  ['Nome muito longo (101)',                  { corpo: mut({ Nome: 'a'.repeat(101) }) },         400],
  ['Nome com 100 é aceito',                   { corpo: mut({ Nome: 'a'.repeat(100) }) },         'ok'],
  ['Empresa com link',                        { corpo: mut({ 'Empresa/obra': 'https://x.co' }) }, 400],
  ['Cidade com link',                         { corpo: mut({ 'Cidade de entrega': 'www.x.co' }) }, 400],
  ['Empresa com .com no nome é aceita',       { corpo: mut({ 'Empresa/obra': 'Eletro.com Ltda' }) }, 'ok'],
  ['WhatsApp com texto',                      { corpo: mut({ WhatsApp: 'http://golpe.com 11999999999' }) }, 400],
  ['WhatsApp +55 formatado é aceito',         { corpo: mut({ WhatsApp: '+55 (86) 99454-0900' }) }, 'ok'],
  ['WhatsApp curto',                          { corpo: mut({ WhatsApp: '12345' }) },             400],
  ['campos demais (61)',                      { corpo: Object.assign({}, base, ...Array.from({ length: 60 }, (_, i) => ({ ['c' + i]: 'v' }))) }, 400],
  ['Mensagem com link é aceita (texto livre)', { corpo: mut({ Mensagem: 'veja https://exemplo.com/produto' }) }, 'ok'],
];

(async () => {
  const srv = spawn(php, ['-S', '127.0.0.1:' + porta, '-t', raiz], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  let falhas = 0;
  for (const [nome, opts, esperado] of casos) {
    const r = await pedido(opts);
    // 'ok' = passou por todas as validações e chegou ao envio (sem sendmail no Windows, mail() falha: 500)
    const passou = esperado === 'ok' ? (r.status === 500 || r.status === 200) : r.status === esperado;
    if (!passou) falhas++;
    console.log((passou ? 'ok   ' : 'FALHA') + ' | ' + nome.padEnd(44) + ' | esperado ' + String(esperado).padEnd(3) + ' | recebido ' + r.status + ' ' + r.msg);
  }
  // limite por visitante: o 6º pedido válido do mesmo IP deve dar 429
  for (const d of [tmp, path.join(tmp, 'maxx_rl')]) { try { for (const f of fs.readdirSync(d)) if (f.startsWith('maxx_rl_')) fs.unlinkSync(path.join(d, f)); } catch (e) {} }
  const seq = [];
  for (let i = 0; i < 7; i++) seq.push((await pedido({ ip: "10.8.8.8" })).status);
  const lim = seq.slice(0, 5).every((x) => x === 500 || x === 200) && seq[5] === 429;
  if (!lim) falhas++;
  console.log((lim ? 'ok   ' : 'FALHA') + ' | limite por IP (5 passam, 6º = 429)                | sequência ' + seq.join(','));
  srv.kill();
  console.log('\n' + (falhas ? falhas + ' falha(s)' : 'todos os cenários passaram'));
  process.exit(falhas ? 1 : 0);
})();
