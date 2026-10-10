# Pendências de melhorias do site (handoff entre sessões)

Atualizado em 10/10/2026. Contexto do produto: `PRODUCT.md` (raiz). Diagnóstico completo, com notas e ordem sugerida: `tools/handoff/analise-impeccable-maxx.md`.
Regras de trabalho: `CLAUDE.md`. Branch + PR, nunca direto na `main` (a `main` publica sozinha).

## Feito (PR #13 e PR #14, já na `main`)
- Página de produto (324): seletor por tensão ou referência, "Adicionar à lista" que adiciona, tabela com seleção múltipla e barra fixa.
- Casca única nas 360 páginas geradas: botão da lista, tema, barra do celular (`assets/lista.js`, `tools/shell-paginas.js`).
- Ferramentas: `tools/paginas-produto.js`, `tools/tabelas.js`, `tools/reindexar-assets.js`. Ordem: paginas-produto, shell-paginas, reindexar-assets.
- Popup de produto removido (PR #14): os cartões do catálogo e os links dos artigos abrem `/produtos/<id>.html`; links antigos `produtos.html#p-<id>` redirecionam. Texto do Bastão Universal corrigido (era resíduo de PDF).
- Tabelas: só as 2 primeiras do bastão de manobra foram conferidas (`tools/tabelas-curadas.json`). O resto está em `tools/revisao-tabelas.csv`, para a equipe conferir com o catálogo impresso.

## Pendente: layout e design (escopo escolhido pelo usuário: tudo, inclusive P2)
Ordem sugerida: clarify/harden, optimize, distill+quieter, adapt+colorize, document, polish.
1. Home: botão de orçamento visível na 1ª tela do celular (hoje ~880 px; cookies cobrem a tela); cortar repetição e enfeite (Ritz ~8x, "3 passos" 2x, fachada 3x, faixa animada, polaroide, brilho dourado, título em gradiente). Estilo Apple, contido.
2. Catálogo (`produtos.html`): visível sem esperar `catalogo-data.js` (638 KB, síncrono); 1º cartão informativo sem botão de compra; nome cortado no celular (cortar o resumo, não o nome); contagem da busca contraditória; `data-q` com 209 KB redundantes.
3. Categorias e índice do blog: grade irregular; reusar o cartão do catálogo (4:3, 2 colunas no celular).
4. 19 produtos sem foto: placeholder único (resíduo de PDF "Continuação na próxima página" já removido do Bastão Universal; era o único). Conferir também as fotos genéricas da Vara de Manobra Seccionável e Telescópica e os resumos de cartão que começam no meio do texto.
5. Artigos: produtos citados comprávis (mini-card + "Adicionar à lista"); remover bloco de compartilhar duplicado.
6. Quem somos: prova real (fotos, depoimentos, nota do Google); tirar "preço claro" e "estoque completo".
7. Calculadora: FEITO a validação (corrente, potência, comprimento e fator de potência com erro no campo; sem resultado nem WhatsApp com entrada inválida; "Mais de 100%" no lugar de valores absurdos), o contraste do selo (usa --ok/--err do tema) e o `aria-live` só no resultado. FALTA: botão flutuante cobrindo o CTA no computador e resultado longe dos campos no celular.
8. Fim do pedido: "Seu pedido está pronto" antes do envio no WhatsApp; `generate_lead` dispara cedo. Texto: "Falta um passo: envie no WhatsApp"; medir o lead no e-mail confirmado.
9. Rótulos: só "Adicionar à lista de orçamento" e "Pedir orçamento no WhatsApp" (+ "Enviar pedido de orçamento" no formulário).
10. Celular: texto a 200% com rolagem lateral (7 de 12 modelos); cartão "Linhas complementares"; tabelas largas.
11. Sistema: unificar os 4 CSS e 2 JS (o formulário de `produtos.html` está sem 3 opções de interesse); 163 cores fixas; animações infinitas sem pausa; cookies no fim do DOM; toast de 4,5 s; "Limpar lista" sem desfazer; foco fraco nos campos.
12. Conteúdo: "2.300 referências" (são ~2.065 distintas; calcular no script); links `share.google` duplicados (avaliação e mapa).
13. Pedido do usuário: ao final, mostrar novas opções de layout (2 a 3 em imagem) para home, catálogo e categorias. A página de produto já foi mostrada (versões A, B, C; escolhida a mistura B+C).

## Pendente: depende do usuário ou da equipe
- Conferir as tabelas (`tools/revisao-tabelas.csv`) com o catálogo impresso.
- GA4 e Pixel da Meta ainda não existem: o usuário cria e passa os IDs (`G-...` e Pixel ID); depois montar o contêiner do GTM (GTM-WZNQMTZ4) e verificar o domínio na Meta por DNS.
- Forçar HTTPS, criar as caixas `comercial@` e `sac@`, validar o formulário PHP, atualizar o e-mail no Perfil da Empresa, revisão jurídica das políticas, links reais de avaliação do Google.

- Evento `view_item` (GA) deixou de ser enviado ao remover o popup; reincluir nas páginas de produto quando o GA4 existir.

## Cuidados
- Nunca usar nem guardar o token do GitHub que o usuário colou antes (deve ser revogado) nem chaves da Hostinger.
- Não subir `_mock/` nem `.impeccable/`.
- Foto de produto: mostrar ao usuário antes de adicionar. Fotos com pessoas do setor elétrico, realistas.
- Ao incluir linha de produtos, atualizar o site todo; conferir duplicados; fazer backup antes de mudanças grandes.
