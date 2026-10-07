# Reindexa os CSS e JS externos de assets/h/ do site Maxx.
# Os arquivos de assets/h/ têm o hash do conteúdo no nome (cache de 1 ano). Sempre que você EDITAR um deles,
# rode este script: ele renomeia o arquivo pelo novo hash e troca o nome em todas as páginas html.
# Uso:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\reindexar-assets.ps1  (a partir da raiz do repositório)
param([string]$Repo = (Split-Path -Parent $PSScriptRoot))  # padrão: a pasta pai de tools/, ou seja, a raiz do repositório

$ErrorActionPreference = 'Stop'
$enc = New-Object Text.UTF8Encoding($false)
$sha = [Security.Cryptography.SHA1]::Create()
Set-Location $Repo
$dir = Join-Path $Repo 'assets\h'
if (-not (Test-Path $dir)) { throw 'assets/h nao existe' }

$mapa = @{}
foreach ($f in Get-ChildItem $dir -File | Where-Object { $_.Extension -in '.css', '.js' }) {
  # o hash ignora o tipo de quebra de linha (CRLF do Windows x LF do Git), senão o nome mudaria sem o conteúdo mudar
  $corpo = [IO.File]::ReadAllText($f.FullName, $enc).Replace("`r`n", "`n")
  $h = ([BitConverter]::ToString($sha.ComputeHash($enc.GetBytes($corpo))).Replace('-', '').Substring(0, 10)).ToLower()
  $novoNome = $h + $f.Extension
  if ($novoNome -ne $f.Name) {
    $destino = Join-Path $dir $novoNome
    if (Test-Path $destino) { Remove-Item $f.FullName } else { Rename-Item $f.FullName $novoNome }
    $mapa[$f.Name] = $novoNome
  }
}
# versao (?v=) dos estaticos sem hash no nome (site.css, busca.js, efeitos.js): quando o conteudo muda, a URL muda e o navegador baixa de novo
$estaticos = @('site.css', 'busca.js', 'efeitos.js', 'compartilhar.js')
$vers = @{}
foreach ($n in $estaticos) {
  $pe = Join-Path $Repo ('assets\' + $n)
  if (Test-Path $pe) {
    $corpo = [IO.File]::ReadAllText($pe, $enc).Replace("`r`n", "`n")
    $vers[$n] = ([BitConverter]::ToString($sha.ComputeHash($enc.GetBytes($corpo))).Replace('-', '').Substring(0, 8)).ToLower()
  }
}
$verAlt = 0
Get-ChildItem $Repo -Recurse -File -Filter *.html | Where-Object { $_.FullName -notmatch '\\img\\' } | ForEach-Object {
  $t = [IO.File]::ReadAllText($_.FullName, $enc); $o = $t
  foreach ($n in $vers.Keys) {
    $pat = '(assets/' + [regex]::Escape($n) + ')(\?v=[0-9a-f]+)?(?=["''])'
    $t = [regex]::Replace($t, $pat, ('${1}?v=' + $vers[$n]))
  }
  if ($t -ne $o) { [IO.File]::WriteAllText($_.FullName, $t, $enc); $verAlt++ }
}
Write-Host ('Versao dos estaticos: ' + (($vers.GetEnumerator() | ForEach-Object { $_.Key + '=' + $_.Value }) -join ', ') + " ($verAlt pagina(s) atualizadas)")

# aviso inverso: pagina que referencia um arquivo de assets/h que nao existe (a regressao que este script poderia causar)
function Test-RefsQuebradas {
  $faltam = @{}
  Get-ChildItem $Repo -Recurse -File -Filter *.html | Where-Object { $_.FullName -notmatch '\\img\\' } | ForEach-Object {
    $pg = $_.FullName
    foreach ($m in [regex]::Matches([IO.File]::ReadAllText($pg, $enc), 'assets/h/([0-9a-f]{10}\.(?:css|js))')) {
      if (-not (Test-Path (Join-Path $dir $m.Groups[1].Value))) { $faltam[$m.Groups[1].Value + ' <- ' + $pg.Substring($Repo.Length + 1)] = 1 }
    }
  }
  foreach ($k in $faltam.Keys) { Write-Warning ('Referencia quebrada: assets/h/' + $k) }
  if ($faltam.Count -eq 0) { Write-Host 'Referencias a assets/h: todas existem.' }
}

if ($mapa.Count -eq 0) { Write-Host 'Nada a renomear: todos os nomes ja batem com o conteudo.'; Test-RefsQuebradas; return }

$alteradas = 0
Get-ChildItem $Repo -Recurse -File -Filter *.html | Where-Object { $_.FullName -notmatch '\\img\\' } | ForEach-Object {
  $t = [IO.File]::ReadAllText($_.FullName, $enc); $o = $t
  foreach ($k in $mapa.Keys) { $t = $t.Replace('assets/h/' + $k, 'assets/h/' + $mapa[$k]) }
  if ($t -ne $o) { [IO.File]::WriteAllText($_.FullName, $t, $enc); $alteradas++ }
}
$mapa.GetEnumerator() | ForEach-Object { Write-Host ('{0} -> {1}' -f $_.Key, $_.Value) }
Write-Host "Referencias atualizadas em $alteradas pagina(s)."

# aviso: arquivos em assets/h que nenhuma pagina usa mais
$usados = @{}
Get-ChildItem $Repo -Recurse -File -Filter *.html | Where-Object { $_.FullName -notmatch '\\img\\' } | ForEach-Object { foreach ($m in [regex]::Matches([IO.File]::ReadAllText($_.FullName, $enc), 'assets/h/([0-9a-f]{10}\.(?:css|js))')) { $usados[$m.Groups[1].Value] = 1 } }
Get-ChildItem $dir -File | Where-Object { -not $usados.ContainsKey($_.Name) } | ForEach-Object { Write-Warning ('Sem uso (pode apagar): assets/h/' + $_.Name) }
Test-RefsQuebradas
