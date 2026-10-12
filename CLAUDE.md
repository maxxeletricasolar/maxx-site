# Site Maxx Elétrica Solar

Site estático (HTML, CSS e JS puros, sem build) de uma distribuidora de material elétrico em Teresina-PI.
Domínio: maxxeletricasolar.com.br. Hospedagem: Hostinger. **A branch `main` publica sozinha no site**, então
nada vai direto para a `main`: trabalhar em branch, abrir PR, conferir no ar depois do merge.

## Estrutura
- `index.html`, `produtos.html`, `guias.html`, `quem-somos.html`, páginas legais e `404.html` na raiz.
- `produtos/` (324 páginas), `categorias/` (26) e `guias/` (10): páginas geradas, quase idênticas entre si.
- `assets/catalogo-data.js`: catálogo (`window.__CAT`), fonte das ferramentas em `tools/` (`produtos.html` não o carrega mais; o popup de produto saiu).
- `assets/h/<hash10>.css|js`: CSS e JS grandes, com o hash do conteúdo no nome (cache de 1 ano).
- `assets/site.css`, `assets/busca.js`, `assets/efeitos.js`: sem hash no nome, versionados por `?v=<hash8>` nas páginas.
- `enviar-pedido.php`: formulário (e-mail). PHP não está instalado nesta máquina, então nunca foi executado aqui.
- `.htaccess`: cabeçalhos, cache, CSP (em Report-Only) e bloqueio de arquivos de trabalho.

## Regras de edição (importante)
1. **Editou um arquivo de `assets/h/` ou um estático sem hash? Rode o reindexador:**
   `powershell -NoProfile -ExecutionPolicy Bypass -File tools\reindexar-assets.ps1`
   Ele renomeia pelo novo hash, atualiza as 371 páginas, versiona `site.css`/`busca.js`/`efeitos.js` com `?v=`
   versiona também `img/ui.svg` (`ui.svg?v=<hash8>#icone`, senão o navegador usa a cópia em cache sem os ícones novos) e avisa de referências quebradas. Sem isso as páginas apontam para arquivos que não existem.
2. **Incluiu produto?** Atualize `assets/catalogo-data.js`, rode `tools\sincronizar-home.ps1` (cartões e totais da
   home) e confira `produtos.html`. Home e produtos andam juntos. O hash `?v=` do catálogo muda com o conteúdo.
3. Scripts `.ps1` precisam de **BOM UTF-8** (o PowerShell 5.1 lê UTF-8 sem BOM como ANSI e quebra acentos).
   No PowerShell, `$home` é variável reservada; `[regex]::Replace` com 3º argumento numérico vira limite de trocas.
4. Mantenha o fim de linha do arquivo (CRLF no Windows); não deixe arquivo com fim de linha misto.
5. `tools/` e `.ps1` são bloqueados no `.htaccess` (têm caminhos locais). Não remova essa regra.
6. Decorações são `aria-hidden="true"`: ao gerar HTML com `<svg>` decorativo, inclua o atributo.
7. Cabeçalho (`<head>`) fecha antes do `<body>`: `<title>`, `description`, canonical e Open Graph ficam dentro dele.
8. Links de compartilhamento (WhatsApp, Facebook, LinkedIn, X, e-mail, copiar link) ficam em produtos, categorias, artigos do blog, na
   calculadora, no modal do catálogo e no leitor do blog. O HTML estático é gerado por `node tools/compartilhar-paginas.js` (idempotente;
   rode depois de incluir produtos, categorias ou artigos novos, e em seguida `tools\reindexar-assets.ps1`). O mesmo módulo
   `assets/compartilhar.js` monta o bloco no navegador. O estilo vem de `tools/compartilhar.css`, que a ferramenta injeta no `site.css` e nos
   CSS com hash de `produtos.html` e `guias.html` entre marcadores `/*share:ini*/ ... /*share:fim*/`: não edite o bloco direto nesses CSS.
   Ícones em `img/share.svg`. Sem scripts de terceiros; o clique gera o evento `compartilhar` no `dataLayer`.

9. Páginas de produto: o bloco de compra (seletor por tensão ou referência) e a seção "Referências e medidas" (tabela com seleção
   múltipla e barra fixa) são gerados por `node tools/paginas-produto.js` (idempotente, marcadores `<!--pm-buy-->` e `<!--pm-tab-->`).
   As tabelas vêm de `assets/catalogo-data.js`, limpas por `tools/tabelas.js`; correções manuais conferidas ficam em
   `tools/tabelas-curadas.json` (têm prioridade) e `tools/revisao-tabelas.csv` lista o que a equipe ainda precisa conferir.
   `node tools/shell-paginas.js` leva tema, botão da lista e barra de navegação do celular às 360 páginas geradas e injeta
   `tools/produto.css` em `assets/site.css` (entre `/*pm:ini*/` e `/*pm:fim*/`: não edite o bloco direto). `assets/lista.js` guarda a lista
   na mesma chave (`maxx-orcamento-v2`) das páginas principais. Sem PowerShell: `node tools/reindexar-assets.js` faz o mesmo que o `.ps1`.
   Ordem: paginas-produto, shell-paginas, reindexar-assets.

## Pendências e continuidade
Lista viva das melhorias de layout e design e do que depende do usuário: `tools/handoff/PENDENCIAS.md` (leia antes de começar; diagnóstico completo em `tools/handoff/analise-impeccable-maxx.md`). Atualize o arquivo ao concluir cada item.

10. Artigos do blog: `node tools/artigos-produtos.js` (idempotente, marcadores `<!--art-prod-->`) troca a lista de links de texto por cartões de "Produtos citados neste artigo", com foto e "Adicionar à lista de orçamento" (`data-add-prod` em `assets/lista.js`). A fonte dos produtos citados é o JSON `data-guias` de `guias.html` (campo `rel`). Cada artigo tem um só bloco de compartilhar, o do final do texto, e no fim a navegação "Artigo anterior" / "Próximo artigo" (marcadores `<!--art-nav-->`, na ordem do JSON `data-guias`) no lugar do antigo "Leia também". Ordem: artigos-produtos, compartilhar-paginas, shell-paginas, reindexar-assets.

11. Categorias: `node tools/categorias-guia.js` (idempotente, marcadores `<!--cg-guia-->`) põe o bloco "Como escolher" (3 passos; modelo Ritz nas categorias A a L e modelo geral nas demais) e os artigos do blog que citam produtos da categoria, no lugar dos selos de frete e retirada. `tools/compartilhar-paginas.js` ancora o compartilhar depois dele. Ordem: categorias-guia, compartilhar-paginas, shell-paginas, reindexar-assets. Para voltar aos selos, reverter o commit "Categorias B".

12. Menu de celular das páginas geradas (produtos, categorias, artigos, calculadora, legais e 404): `node tools/menu-paginas.js` (idempotente, marcadores `<!--menu-btn-->` e `<!--menu-dlg-->`) põe o botão de hambúrguer e a gaveta de links, no lugar da antiga fileira de atalhos `.sub-nav`; o clique é tratado no fim de `assets/efeitos.js` (`data-menu-open`). Rode depois de `shell-paginas.js` ao incluir páginas novas.

13. Compartilhamento e sitemap: `python3 tools/og-produtos.py` (idempotente; precisa de Pillow) troca o `og:image` WebP das páginas de produto, categoria e artigo por um JPG 1200x630 em `img/og/` (foto pequena ou muito alongada usa `img/og-maxx.jpg`), porque Facebook e WhatsApp lidam mal com WebP e imagem pequena. `node tools/sitemap-datas.js` põe no `sitemap.xml` a data real de cada página (git; arquivo não commitado vale hoje). Rode os dois depois de incluir páginas ou fotos.

14. Celular (revisão de design, PR de 12/10): nas páginas com barra inferior (`.tabbar`) o botão flutuante do WhatsApp fica oculto (o WhatsApp já é uma aba); a barra "Buscar produto" de `assets/busca.js` não aparece no catálogo (`#cat-q`) nem nas páginas de produto (`.pd-grid`); o bloco de compartilhar do produto vem depois do bloco de compra (`tools/compartilhar-paginas.js`); o caminho de navegação do produto vira um link de volta em uma linha. Áreas de toque: links pequenos ganham área de 44 px com `::after` (bloco `/*toque*/` no CSS, repetido nos 3 CSS com hash) e a célula da caixa de seleção das tabelas é clicável (`assets/lista.js`).

15. Faixa escura do topo (descrição da MAXX + WhatsApp, `.topbar`): aparece em todas as páginas e em todos os tamanhos de tela; não pode sair. As 4 páginas principais trazem a sua no HTML; nas demais ela vem de `node tools/topbar-paginas.js` (idempotente, marcadores `<!--topbar-->`; rode junto com `menu-paginas.js` ao incluir páginas novas e depois `reindexar-assets`). No celular o texto quebra em 3 linhas curtas (`.tb-sep` some, `.tb-loc` vira bloco). Logo abaixo dela, em todas as páginas, fica a faixa dourada de categorias que passa da direita para a esquerda (`.ticker`, só a partir de 761 px; pausa com o mouse e para com movimento reduzido), também gerada por `tools/topbar-paginas.js` (marcadores `<!--ticker-->`); ela não fica mais abaixo do hero da home.

## Decisões de produto já tomadas
- Produto e artigo abrem em página própria (`/produtos/<id>.html`, `/guias/<id>.html`); não há popup nem leitor. Links antigos `#p-<id>` e `#guia-<id>` redirecionam. Foto que falta usa só `img/sem-foto.svg`.
- `generate_lead` só dispara com a cópia por e-mail confirmada ou no clique em Enviar no WhatsApp; o envio da tela vira `pedido_preparado`.
- Rótulos: "Adicionar à lista de orçamento", "Pedir orçamento no WhatsApp" e, no formulário, "Enviar pedido de orçamento".
- Catálogo em linhas compactas (foto pequena, nome, resumo de 1 linha e botão "+ Lista"; produtos só informativos ficam sem o botão). O botão usa `data-add-prod` e o rótulo é definido no JS principal ("+ Lista" / "✓ Na lista (n)"). Para voltar aos cartões, reverter o commit "Catálogo B".
- Home mostra as 5 categorias principais, com os mesmos títulos do menu de `produtos.html`.
- Em `produtos.html` o catálogo abre direto na primeira categoria, com atalhos de categoria no celular (PR #7); uma seção por vez (classe `cat-modo`, `.sel` na ativa) e a busca mostra todas.
- O rodapé e o contraste/áreas de toque atuais vêm do trabalho de design dos PRs #3 a #7 (branch `claude/admiring-dirac-qubp6u`). Não recrie o rodapé `footer.rd` antigo.

## Como testar
- Servidor local: `npx http-server . -p 8765 -s -c-1` (não comprime e não usa HTTPS: não use o lab local como verdade de performance).
- Lighthouse: `npx lighthouse http://localhost:8765/<pagina> --chrome-flags="--headless=new --no-sandbox"`.
- O `curl` leva 403 da Hostinger em produção; use o navegador.
- Formulário: `PHP_EXE=C:/caminho/php.exe node tools/testar-formulario.js` sobe o servidor embutido do PHP e roda 23 cenários
  (origem, tamanho e links nos campos, WhatsApp, limite por IP). Precisa de PHP com `mbstring` ativa. Rode antes de mexer em `enviar-pedido.php`.
- Medidas de produção (06/10/2026): LCP real ~0,6 s e CLS 0,062; a nota 59 do Lighthouse mobile é simulação de celular lento.

## Pendências conhecidas
- Formulário: usar o IP real da CDN no limite de envios (hoje confia em `CF-Connecting-IP`/`X-Forwarded-For`, que o cliente pode forjar;
  trocar para `REMOTE_ADDR` sem antes descobrir o cabeçalho real da Hostinger faria todos dividirem o mesmo limite) e anti-bot (Turnstile).
- CSP definitiva (hoje Report-Only, com `'unsafe-inline'`); `object-src 'none'`; fixar o destino do redirect do `www`.
- Tabelas de produto (229 páginas): cabeçalhos extraídos de PDF, desalinhados das colunas; exige curadoria.
- `LocalBusiness` com horário e coordenadas, datas reais no `sitemap.xml`, padronizar "lista"/"pedido".
- Remover o subdomínio `teste.maxxeletricasolar.com.br` e a pasta `teste/` na Hostinger.

## Commits
Mensagens em português, sem aspas duplas no corpo quando feitas pelo PowerShell. Termine com o trailer
`Co-Authored-By` exigido pela ferramenta.
