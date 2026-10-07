<?php
// Recebe o pedido de orçamento/catálogo do site e envia por e-mail (Hostinger).
// Mesmo formato que o site enviava ao FormSubmit: JSON com _subject e demais campos.

const EMAIL_PARA = 'comercial@maxxeletricasolar.com.br';
const EMAIL_DE   = 'comercial@maxxeletricasolar.com.br'; // caixa do próprio domínio (melhor entrega)
const DOMINIO    = 'maxxeletricasolar.com.br';
const MAX_BYTES  = 100000;
const LIMITE     = 5;    // envios por visitante...
const JANELA     = 600;  // ...a cada 10 minutos
const LIMITE_GERAL = 60;   // teto de e-mails do site inteiro...
const JANELA_GERAL = 3600; // ...por hora (protege a caixa contra enxurrada vinda de muitos IPs)
const MAX_CAMPOS = 60;   // campos por pedido
const MAX_VALOR  = 5000; // caracteres por campo
const MAX_CHAVE  = 80;   // caracteres no nome do campo
const MAX_NOME   = 100;  // caracteres em Nome, Empresa/obra e Cidade (campos curtos do formulário)
// hosts que podem enviar pedidos: lista fechada, sem curinga de subdomínio (um subdomínio esquecido ou comprometido não envia)
const ORIGENS_OK = [DOMINIO, 'www.' . DOMINIO, 'teste.' . DOMINIO];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function resp($ok, $msg = '', $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $ok ? 'true' : 'false', 'message' => $msg]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') resp(false, 'Método não permitido', 405);

// só aceita pedidos JSON vindos do próprio site (o navegador sempre envia Origin ou Referer no POST)
if (stripos((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) resp(false, 'Tipo de conteúdo inválido', 415);
$origem = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host = parse_url($origem, PHP_URL_HOST) ?: '';
// só o domínio, o www e o teste são aceitos; qualquer outro host é recusado
if (!in_array(strtolower($host), ORIGENS_OK, true)) resp(false, 'Origem não permitida', 403);

$raw = file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
if ($raw === false || $raw === '' || strlen($raw) > MAX_BYTES) resp(false, 'Pedido inválido', 400);
$d = json_decode($raw, true);
if (!is_array($d)) resp(false, 'Pedido inválido', 400);
if (count($d) > MAX_CAMPOS) resp(false, 'Pedido inválido', 400); // antes do limite de envios, para não gastá-lo à toa

// campo oculto anti-robô: finge sucesso e não envia
if (!empty($d['_honey'])) resp(true, 'ok');

// o site sempre envia Nome e WhatsApp: pedidos sem eles (ou com telefone impossível) são recusados antes de gastar o limite de envios
if (!is_string($d['Nome'] ?? null) || trim($d['Nome']) === '') resp(false, 'Informe o nome', 400);
// campos curtos: tamanho limitado e sem link (o spam costuma colocar o golpe no nome ou na empresa)
foreach (['Nome', 'Empresa/obra', 'Cidade de entrega'] as $campo) {
    $v = $d[$campo] ?? '';
    if (!is_string($v)) resp(false, 'Pedido inválido', 400);
    if (mb_strlen(trim($v)) > MAX_NOME || preg_match('~https?://|www\.~i', $v)) resp(false, 'Pedido inválido', 400);
}
// WhatsApp: só dígitos e a pontuação comum de telefone (sem texto ou link no campo); 10 a 13 dígitos (Brasil, com ou sem DDI)
$wa = is_string($d['WhatsApp'] ?? null) ? trim($d['WhatsApp']) : '';
if (!preg_match('/^[\d\s()+.\-]+$/', $wa)) resp(false, 'WhatsApp inválido', 400);
$digitos = preg_replace('/\D+/', '', $wa);
if (strlen($digitos) < 10 || strlen($digitos) > 13) resp(false, 'WhatsApp inválido', 400);

// limite por visitante e limite geral (leitura e gravação travadas com flock, sem condição de corrida)
// IP real: atrás da CDN o REMOTE_ADDR pode ser o do proxy, então tenta os cabeçalhos dela primeiro
$ip = '0';
foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $h) {
    $c = trim(explode(',', (string)($_SERVER[$h] ?? ''))[0]);
    if ($c !== '' && filter_var($c, FILTER_VALIDATE_IP)) { $ip = $c; break; }
}
function rate_limit($arq, $limite, $janela) {
    $agora = time();
    $fp = @fopen($arq, 'c+');
    if (!$fp) { error_log('maxx: rate limit sem disco gravavel em ' . $arq); return true; } // sem disco: não derruba o envio do cliente
    flock($fp, LOCK_EX);
    $marcas = array_filter(array_map('intval', explode(',', (string)stream_get_contents($fp))), function ($t) use ($agora, $janela) {
        return $t > $agora - $janela;
    });
    $ok = count($marcas) < $limite;
    if ($ok) {
        $marcas[] = $agora;
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, implode(',', $marcas));
    }
    flock($fp, LOCK_UN); fclose($fp);
    return $ok;
}
// marcadores em pasta própria (permissão restrita); na falta dela usa a pasta temporária do sistema
$tmp = sys_get_temp_dir() . '/maxx_rl';
if (!is_dir($tmp)) @mkdir($tmp, 0700, true);
if (!is_dir($tmp) || !is_writable($tmp)) $tmp = sys_get_temp_dir();
// limpeza: em ~1% dos pedidos remove marcadores sem uso há mais que a maior janela (senão IPs variados enchem o disco)
if (mt_rand(1, 100) === 1) {
    foreach (glob($tmp . '/maxx_rl_*') ?: [] as $f) {
        if (@filemtime($f) < time() - max(JANELA, JANELA_GERAL) - 60) @unlink($f);
    }
}
if (!rate_limit($tmp . '/maxx_rl_' . md5($ip), LIMITE, JANELA)) resp(false, 'Muitos envios. Tente novamente em alguns minutos.', 429);
if (!rate_limit($tmp . '/maxx_rl_geral', LIMITE_GERAL, JANELA_GERAL)) resp(false, 'Muitos envios. Tente novamente em alguns minutos.', 429);

// monta o e-mail
$limpa = function ($s) { return trim(preg_replace('/[\r\n]+/', ' ', strip_tags((string)$s))); };
$assunto = $limpa($d['_subject'] ?? 'Pedido pelo site');
if ($assunto === '') $assunto = 'Pedido pelo site';
$assunto = mb_substr($assunto, 0, 200);

$linhas = []; $html = '';
foreach ($d as $k => $v) {
    if (!is_string($k) || $k === '' || $k[0] === '_') continue;
    if (is_array($v)) $v = implode(', ', array_map('strval', $v));
    $v = trim((string)$v);
    if ($v === '') continue;
    $k = mb_substr($limpa($k), 0, MAX_CHAVE);
    $v = mb_substr($v, 0, MAX_VALOR);
    $linhas[] = $k . ': ' . $v;
    $html .= '<tr><th align="left" valign="top" style="padding:6px 12px;background:#f3f1ea;border:1px solid #ddd">'
          . htmlspecialchars($k, ENT_QUOTES, 'UTF-8') . '</th><td style="padding:6px 12px;border:1px solid #ddd">'
          . nl2br(htmlspecialchars($v, ENT_QUOTES, 'UTF-8')) . '</td></tr>';
}
if (!$linhas) resp(false, 'Pedido vazio', 400);

$limite = '=_maxx_' . bin2hex(random_bytes(8));
$corpo = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
       . chunk_split(base64_encode(implode("\n", $linhas))) . "\r\n"
       . "--$limite\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
       . chunk_split(base64_encode('<table cellspacing="0" style="border-collapse:collapse;font:14px Arial,sans-serif">' . $html . '</table>')) . "\r\n"
       . "--$limite--";

$cab = "From: =?UTF-8?B?" . base64_encode('Site MAXX Elétrica Solar') . "?= <" . EMAIL_DE . ">\r\n"
     . "MIME-Version: 1.0\r\n"
     . "Content-Type: multipart/alternative; boundary=\"$limite\"\r\n"
     . "X-Mailer: maxx-site";
$cc = trim((string)(getenv('MAXX_CC') ?: ''));
if ($cc !== '' && filter_var($cc, FILTER_VALIDATE_EMAIL)) $cab .= "\r\nCc: $cc";

$ok = mail(EMAIL_PARA, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, $cab, '-f' . EMAIL_DE);
if (!$ok) resp(false, 'Falha ao enviar o e-mail', 500);
resp(true, 'ok');
