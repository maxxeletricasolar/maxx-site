<?php
// Recebe o pedido de orçamento/catálogo do site e envia por e-mail (Hostinger).
// Mesmo formato que o site enviava ao FormSubmit: JSON com _subject e demais campos.

const EMAIL_PARA = 'comercial@maxxeletricasolar.com.br';
const EMAIL_DE   = 'comercial@maxxeletricasolar.com.br'; // caixa do próprio domínio (melhor entrega)
const DOMINIO    = 'maxxeletricasolar.com.br';
const MAX_BYTES  = 100000;
const LIMITE     = 5;    // envios por visitante...
const JANELA     = 600;  // ...a cada 10 minutos

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function resp($ok, $msg = '', $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $ok ? 'true' : 'false', 'message' => $msg]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') resp(false, 'Método não permitido', 405);

// só aceita pedidos vindos do próprio site
$origem = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host = parse_url($origem, PHP_URL_HOST) ?: '';
if ($host !== '' && $host !== DOMINIO && $host !== 'www.' . DOMINIO) resp(false, 'Origem não permitida', 403);

$raw = file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
if ($raw === false || $raw === '' || strlen($raw) > MAX_BYTES) resp(false, 'Pedido inválido', 400);
$d = json_decode($raw, true);
if (!is_array($d)) resp(false, 'Pedido inválido', 400);

// campo oculto anti-robô: finge sucesso e não envia
if (!empty($d['_honey'])) resp(true, 'ok');

// limite simples por IP
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$arq = sys_get_temp_dir() . '/maxx_rl_' . md5($ip);
$agora = time();
$marcas = [];
if (is_file($arq)) {
    $marcas = array_filter(array_map('intval', explode(',', (string)@file_get_contents($arq))), function ($t) use ($agora) {
        return $t > $agora - JANELA;
    });
}
if (count($marcas) >= LIMITE) resp(false, 'Muitos envios. Tente novamente em alguns minutos.', 429);
$marcas[] = $agora;
@file_put_contents($arq, implode(',', $marcas), LOCK_EX);

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
    $k = $limpa($k);
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
