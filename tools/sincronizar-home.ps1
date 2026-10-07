# Regenera os cartões de categorias da home (index.html) a partir de assets/catalogo-data.js.
# Rode depois de incluir produtos no catálogo:  powershell -File tools\sincronizar-home.ps1  (a partir da raiz do repositório)
# Os totais saem do JSON e os títulos são os mesmos <h2> do menu lateral de produtos.html.
param([string]$Repo = (Split-Path -Parent $PSScriptRoot))  # padrão: a pasta pai de tools/, ou seja, a raiz do repositório

$ErrorActionPreference = 'Stop'
$enc  = New-Object System.Text.UTF8Encoding($false)
$home_ = Join-Path $Repo 'index.html'
$data  = Join-Path $Repo 'assets\catalogo-data.js'

$json = [IO.File]::ReadAllText($data, $enc) -replace '^window\.__CAT=', '' -replace ';\s*$', ''
$cat  = $json | ConvertFrom-Json
$cnt  = @{}; foreach ($p in $cat.produtos) { $cnt[$p.g] = [int]$cnt[$p.g] + 1 }

# Blocos da home = títulos do menu de produtos.html. 'ids' = grupos que entram; 'href' = primeira subcategoria.
$blocos = @(
  @{ cls='cx-ritz';  titulo='Material elétrico · linha Ritz';  sub='Linha viva e segurança elétrica · revenda autorizada'; href='produtos.html#grupo-a'; icone='v-escudo'
     ids = @($cat.grupos | Where-Object { $_.tipo -eq 'linha-viva' } | ForEach-Object { $_.id }) },
  @{ cls='cx-compl'; titulo='Linhas complementares';           sub='Perfilados, eletrocalhas, postes, EPIs e mais'; href='produtos.html#perfilados'; icone='l-perf'
     ids = @('perfilados','eletrocalhas','postes','combate-a-incendio','material-de-logica','hidraulica','epis','fardamentos') },
  @{ cls='cx-spda';  titulo='Para-raios e aterramento (SPDA)'; sub='Sistemas de proteção contra descargas'; href='produtos.html#para-raios-e-captacao'; icone='l-raio'
     ids = @('para-raios-e-captacao','conectores-e-fixacao-spda','aterramento-e-equalizacao','sinalizadores-e-balizadores') },
  @{ cls='cx-cabos'; titulo='Cabos e fios de alumínio';        sub='Cabos nus, multiplex, isolados e fios de alumínio'; href='produtos.html#cabos-e-fios-de-aluminio'; icone='l-cabo'
     ids = @('cabos-e-fios-de-aluminio') },
  @{ cls='cx-pvc';   titulo='Instalação aparente em PVC';      sub='Eletrodutos, caixas condulete, conexões e tampas'; href='produtos.html#conduletes-e-eletrodutos-pvc'; icone='l-condulete'
     ids = @('conduletes-e-eletrodutos-pvc') }
)

# todo grupo do JSON precisa cair em algum bloco (senão a home esconderia produtos)
$usados = $blocos | ForEach-Object { $_.ids } | ForEach-Object { $_ }
$orfaos = $cat.grupos | Where-Object { $_.id -notin $usados } | ForEach-Object { $_.id }
if ($orfaos) { throw "Grupo(s) sem bloco na home: $($orfaos -join ', '). Inclua em `$blocos (e no menu de produtos.html)." }

$chev = '<svg class="cx-chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
$cards = foreach ($b in $blocos) {
  $tot = ($b.ids | ForEach-Object { [int]$cnt[$_] } | Measure-Object -Sum).Sum
  $rot = if ($tot -eq 1) { '1 produto' } else { "$tot produtos" }
  $seal = '<span class="cx-seal"><svg aria-hidden="true"><use href="#' + $b.icone + '"/></svg></span>'
  '<article class="cx-card ' + $b.cls + '" aria-label="' + $b.titulo + '"><div class="cx-head">' + $seal +
  '<div><h3><a href="' + $b.href + '">' + $b.titulo + '</a></h3><p>' + $b.sub + '</p></div>' +
  '<span class="cx-tot">' + $rot + '</span>' + $chev + '</div></article>'
}

$t = [IO.File]::ReadAllText($home_, $enc)
$a = $t.IndexOf('<!--CAT-TILES-->'); $e = $t.IndexOf('<!--/CAT-TILES-->')
if ($a -lt 0 -or $e -lt 0) { throw 'Marcadores <!--CAT-TILES--> não encontrados no index.html' }
# o bloco "Não achou o que precisa?" agora fica em produtos.html (section.prod-ajuda), não na home
$novo = '<!--CAT-TILES-->' + "`n" + '<div class="cx" data-reveal>' + "`n" + ($cards -join "`n") + "`n" + '</div>' + "`n"
# mantém o padrão de fim de linha do arquivo (CRLF no Windows): sem isso o bloco novo entra com LF e o arquivo fica misto
if ($t.Contains("`r`n")) { $novo = $novo.Replace("`r`n", "`n").Replace("`n", "`r`n") }
$t = $t.Substring(0, $a) + $novo + $t.Substring($e)
[IO.File]::WriteAllText($home_, $t, $enc)

# marcadores <!--STAT:chave-->valor<!--/STAT--> (produtos e categorias) sempre iguais ao JSON; 'refs' é arredondado à mão, não mexe
foreach ($arq in 'index.html', 'produtos.html') {
  $pa = Join-Path $Repo $arq
  $c = [IO.File]::ReadAllText($pa, $enc)
  $c = [regex]::Replace($c, '<!--STAT:produtos-->.*?<!--/STAT-->',   { param($m) "<!--STAT:produtos-->$($cat.produtos.Count)<!--/STAT-->" })
  $c = [regex]::Replace($c, '<!--STAT:categorias-->.*?<!--/STAT-->', { param($m) "<!--STAT:categorias-->$($cat.grupos.Count)<!--/STAT-->" })
  [IO.File]::WriteAllText($pa, $c, $enc)
}

# números do topo do produtos.html: linha Ritz, demais itens e categorias
$pa = Join-Path $Repo 'produtos.html'
$c = [IO.File]::ReadAllText($pa, $enc)
$ritz = ($cat.grupos | Where-Object { $_.tipo -eq 'linha-viva' } | ForEach-Object { [int]$cnt[$_.id] } | Measure-Object -Sum).Sum
$c = [regex]::Replace($c, '<b>\d+</b>(produtos da linha Ritz)',         { param($m) "<b>$ritz</b>$($m.Groups[1].Value)" })
$c = [regex]::Replace($c, '<b>\d+</b>(itens em linhas complementares)', { param($m) "<b>$($cat.produtos.Count - $ritz)</b>$($m.Groups[1].Value)" })
$c = [regex]::Replace($c, '<b>\d+</b>(categorias)',                     { param($m) "<b>$($cat.grupos.Count)</b>$($m.Groups[1].Value)" })
[IO.File]::WriteAllText($pa, $c, $enc)

# frase "N produtos em M categorias" (home, produtos.html e llms.txt) sempre igual ao JSON
$frase = "$($cat.produtos.Count) produtos em $($cat.grupos.Count) categorias"
foreach ($arq in 'index.html', 'produtos.html', 'llms.txt') {
  $pa = Join-Path $Repo $arq
  $c = [IO.File]::ReadAllText($pa, $enc)
  $n = [regex]::Matches($c, '\d+ produtos em \d+ categorias').Count
  if ($n) { [IO.File]::WriteAllText($pa, [regex]::Replace($c, '\d+ produtos em \d+ categorias', $frase), $enc) }
  Write-Host "  $arq : $n ocorrência(s) de '$frase'"
}

$soma = ($blocos | ForEach-Object { ($_.ids | ForEach-Object { [int]$cnt[$_] } | Measure-Object -Sum).Sum } | Measure-Object -Sum).Sum
Write-Host "Home atualizada: $($blocos.Count) cartões, $soma produtos (JSON: $($cat.produtos.Count))."
if ($soma -ne $cat.produtos.Count) { Write-Warning 'A soma dos cartões difere do total do JSON.' }
