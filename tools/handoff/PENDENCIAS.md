# Pendências de melhorias do site (handoff entre sessões)

Atualizado em 10/10/2026. Contexto do produto: `PRODUCT.md` (raiz). Diagnóstico completo, com notas e ordem sugerida: `tools/handoff/analise-impeccable-maxx.md`.
Regras de trabalho: `CLAUDE.md`. Branch + PR, nunca direto na `main` (a `main` publica sozinha).

## Feito
- PR #13: página de produto (324) com seletor por tensão ou referência, "Adicionar à lista" que adiciona, tabela com seleção múltipla e barra fixa; casca única nas páginas geradas (`assets/lista.js`, `tools/shell-paginas.js`).
- PR #14: popup de produto removido (cartões e links abrem a página própria; links antigos redirecionam); Bastão Universal sem resíduo de PDF.
- PR #15: calculadora valida a entrada (P0), selo com contraste e `aria-live` só no resultado; handoff no repositório.
- Este lote (branch `claude/beautiful-albattani-s1fgid`):
  - Fim do pedido: "Falta um passo: envie no WhatsApp", protocolo, prazo e validade; `generate_lead` só com e-mail confirmado ou clique no WhatsApp (uma vez por protocolo); envio da tela vira `pedido_preparado`.
  - Rótulos únicos em todas as páginas, no botão fixo (aria-label igual ao texto), na barra de seleção e na calculadora.
  - Catálogo: `produtos.html` não carrega mais `catalogo-data.js` (638 KB); nome do produto nunca cortado; cabeçalho de categoria mostra "3 de 13 produtos" durante a busca; hero compacto no celular.
  - Foto sob consulta (`img/sem-foto.svg`) no lugar das três variantes; grade de categorias regular (4:3, 2 colunas no celular); resumos de 6 cartões corrigidos.
  - Artigos: "Produtos citados" com foto e "Adicionar à lista de orçamento"; um só bloco de compartilhar; leitor em popup do blog removido (links antigos redirecionam).
  - Quem somos: depoimentos reais da home e link do Google; sem "preço claro" nem "estoque completo".
  - Calculadora: sem botão fixo cobrindo o pedido; resumo fixo do resultado no celular.
  - Home: botão de orçamento na 1ª tela do celular (y 880 para 505); sem polaroide, selo Ritz repetido, faixa animada e passos repetidos; título sem gradiente animado.
  - Celular: sem rolagem lateral com texto a 200% em 10 páginas medidas; cartão "Linhas complementares" legível.
  - Sistema: "Limpar lista" com Desfazer (o aviso agora aparece dentro do popup aberto), avisos de 4 s (8 s com ação), anel de foco nos campos, botão fixo pulsa só 3 vezes, `produtos.html` com as 15 linhas de interesse.
  - Conteúdo: "2.000+ referências" (eram 2.340 somadas, 2.065 distintas).

## Pendente: layout e design (não feito de propósito)
- Unificar os 4 CSS e 2 JS e trocar as ~163 cores fixas por tokens: refactor grande, sem teste visual automatizado; fazer em PR próprio, página por página, com captura antes e depois.
- Banner de cookies no fim do DOM (ordem de foco) e brilho dourado decorativo da home.
- Foto: 19 produtos ainda sem foto (agora com "Foto sob consulta"); a Vara de Manobra Seccionável e a Telescópica usam fotos genéricas de poste e de operário. Foto de produto: mostrar ao usuário antes de adicionar; fotos com pessoas do setor elétrico, realistas.
- Resumos de cartão: o de "Mastro para Cruzeta" e dois "Esse conjunto..." começam com pronome; revisar com a equipe.
- Evento `view_item` (GA) deixou de ser enviado ao remover o popup; reincluir nas páginas de produto quando o GA4 existir.
- Opções de layout (2 a 3 em imagem) para home, catálogo e categorias, como pedido do usuário: ver o artefato publicado nesta sessão.

## Pendente: depende do usuário ou da equipe
- Conferir as tabelas (`tools/revisao-tabelas.csv`) com o catálogo impresso (só as 2 primeiras do bastão de manobra foram conferidas, em `tools/tabelas-curadas.json`).
- Links reais: hoje avaliação e mapa do Google usam o mesmo `share.google/8Zr9PJPt1hZOWpXQ8` (index, quem somos, catálogo e blog). Passar o link de avaliação e o do mapa separados.
- Nota e número de avaliações do Google em Quem somos: passar os números reais (não inventar).
- GA4 e Pixel da Meta ainda não existem: o usuário cria e passa os IDs (`G-...` e Pixel ID); depois montar o contêiner do GTM (GTM-WZNQMTZ4) e verificar o domínio na Meta por DNS.
- Forçar HTTPS, criar as caixas `comercial@` e `sac@`, validar o formulário PHP, atualizar o e-mail no Perfil da Empresa, revisão jurídica das políticas.

## Cuidados
- Nunca usar nem guardar o token do GitHub que o usuário colou antes (deve ser revogado) nem chaves da Hostinger.
- Não subir `_mock/` nem `.impeccable/`.
- Ao incluir linha de produtos, atualizar o site todo; conferir duplicados; fazer backup antes de mudanças grandes.
- Em `String.replace` com texto novo que tenha `$$`, use função como segundo argumento (`$$` vira `$`).
