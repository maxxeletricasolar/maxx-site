# Análise Impeccable do site MAXX Elétrica Solar

Versão analisada: repositório `maxxeletricasolar/maxx-site`, commit `f666ac4` (7/10/2026, "Adiciona links de compartilhamento…").
Data: 9/10/2026. Método: crítica com dois agentes independentes por superfície (revisão de design + detector automático e navegador) e auditoria técnica em 12 modelos de página, com checagem de links nas 371 páginas. Nenhum arquivo do site foi alterado.

## Placar

| Superfície | Tipo | Nota |
|---|---|---|
| Página inicial | Persuasão | 27/40 (Aceitável) |
| Catálogo (produtos.html) | Operação | 26/40 (Aceitável) |
| Página de produto (324 páginas) | Operação / conversão | **19/40 (Fraco)** |
| Página de categoria (26 páginas) | Persuasão / operação | 26/40 (Aceitável) |
| Blog técnico (índice + artigos) | Leitura | 29/40 (Bom) |
| Calculadora de queda de tensão | Ferramenta | 26/40 (Aceitável) |
| Quem somos | Persuasão | 26/36 (Bom, 72%) |
| **Auditoria técnica** | a11y, desempenho, tema, responsivo, integridade | **14/20 (Bom)** |

Auditoria técnica por dimensão: acessibilidade 3, desempenho 3, tema 3, responsivo 3, integridade da implementação 2 (reprovada).

## O diagnóstico em uma frase

O site acerta no conteúdo técnico, nas provas reais e no formulário, mas quebra justamente onde o comprador decide: na página de produto (tabelas ilegíveis e um "Adicionar à lista" que não adiciona) e no fim do pedido (não fica claro se foi enviado). Por trás disso há uma causa única: o site virou duas cascas, 4 CSS e 2 JS que já divergem.

## Problemas por prioridade (site inteiro)

### P0 — bloqueiam a tarefa

1. **Tabelas técnicas corrompidas (229 páginas de produto, 409 tabelas).** O cabeçalho `<th colspan>` recebe a tabela inteira do PDF em caixa alta; ~190 tabelas têm o cabeçalho como `<td>` com células vazias; há valores fundidos ("10,0 9,0"); colunas cortadas a 1440 px; nenhuma `scope`. É a razão de existir da página e o comprador pode ler o valor errado. WCAG 1.3.1. → Curto prazo: esconder o título gigante, rotular a 1ª coluna "Referência", levar tabelas não curadas para "Ver ficha original (PDF, pág. X)". Definitivo: curadoria com `<caption>`, `<thead>` e `th scope`. `/impeccable harden` → `/impeccable clarify`.
2. **Calculadora dá resultado confiante com entrada inválida.** −5 A e 0 m → "Dentro do limite de 4%" em verde; 400 A em 300 m → "544,47%" e "−977,8 V". Para uma ferramenta de segurança é a pior falha. WCAG 3.3.1. → Validar (>0, faixas plausíveis, FP 0,5–1), mostrar erro no campo, não calcular. `/impeccable harden`.

### P1 — causam dificuldade séria

3. **Duas cascas de página.** As 4 páginas raiz têm lista de orçamento, tema, menu e barra inferior; as 363 geradas (produtos, categorias, artigos, calculadora, legais) não têm nada disso. É onde o Google traz o comprador.
4. **"Adicionar à lista de orçamento" não adiciona.** Na página de produto o botão navega para o catálogo (603 KB + 638 KB de dados), reabre o mesmo produto num modal e o usuário precisa adicionar de novo. → Casca única + adicionar ali mesmo com retorno visual. `/impeccable layout` → `/impeccable clarify`.
5. **Fim do pedido ambíguo (home e demais formulários).** "Seu pedido está pronto" enquanto o envio pelo WhatsApp ainda depende do usuário; o evento `generate_lead` dispara antes do envio real e infla conversões. → "Falta um passo: envie no WhatsApp", protocolo em destaque, "resposta em até 24 h úteis · válido por 7 dias", medir o lead no e-mail confirmado. `/impeccable clarify`, `/impeccable harden`.
6. **Primeira tela da home sem botão de orçamento no celular** (aparece por volta de 880 px; o aviso de cookies cobre metade da tela). No computador fica na linha da dobra. `/impeccable layout`, `/impeccable distill`.
7. **Catálogo vazio até o JS carregar.** Os 324 cards estão no HTML, mas a regra `cat-modo` esconde todos até `catalogo-data.js` (638 KB, síncrono) rodar. Em 3G/4G no campo, tela vazia. → `.sel` na 1ª categoria direto no HTML e dados com `defer`/sob demanda. `/impeccable optimize`.
8. **Primeiro card do catálogo não é comprável.** A categoria A abre com "Conjunto de Aterramento Temporário", um item informativo sem botão de adicionar. → Tratar itens informativos como introdução/"Guia" ou movê-los para o fim. `/impeccable clarify`.
9. **Nomes de produto cortados nos cards do celular** ("Conjuntos de Aterramento para Baixa…"): os irmãos diferem só no fim (Baixa/Média/Alta Tensão). → Nunca cortar o nome; cortar o resumo. `/impeccable adapt`.
10. **Selo de resultado da calculadora abaixo de 4,5:1** (3,08 a 3,69:1 nos dois temas). → Tokens `--ok`/`--err` por tema. `/impeccable colorize`.
11. **Página de produto sem foto parece quebrada** (logo da MAXX numa caixa branca; descrição "Continuação na próxima página 4", resíduo do PDF). 19 produtos sem foto, com 3 placeholders diferentes no site. `/impeccable polish`.
12. **Grade de imagens irregular nas categorias e no índice do blog** (imagens na proporção natural: cards de 650 px ao lado de cards vazios; 9.475 px para 11 itens no celular). → Reusar o card do catálogo (caixa 4:3 fixa, 2 colunas no celular). `/impeccable layout`.
13. **Produtos citados nos artigos não têm como ser comprados** (caixas só de texto). → Mini-cards com foto e "Adicionar à lista". `/impeccable clarify`.
14. **Quem somos sem prova real.** Missão/Visão/6 valores genéricos; a foto da loja é uma miniatura; os depoimentos reais e a nota do Google não estão lá; "Preço claro" e "estoque completo" contradizem as regras (sem preço, sem estoque). `/impeccable distill`, `/impeccable clarify`.

### P2 — incomodam, com contorno

- **CSS e JS bifurcados** (4 CSS quase iguais, 2 bundles): o formulário de produtos.html já tem 3 linhas a menos (sem SPDA, cabos de alumínio e conduletes/PVC). `/impeccable document` → `/impeccable optimize`.
- **Rótulos que levam a lugares diferentes:** aba "Orçamento" abre a lista; "Pedir orçamento" vai ao formulário; "WhatsApp (86)…" abre ligação; 7 textos diferentes para a mesma ação de WhatsApp. → Só dois verbos: "Adicionar à lista de orçamento" e "Pedir orçamento no WhatsApp" (+ "Enviar pedido de orçamento" no formulário). `/impeccable clarify`.
- **Avaliação e mapa com o mesmo link `share.google`** (também no JSON-LD). → Link "Pedir avaliações" do Perfil da Empresa e link do Maps com place ID. `/impeccable clarify`.
- **"Mais de 2.300 referências"** sem lastro: são 2.065 distintas, número digitado à mão. → Calcular no script ("mais de 2.000"). `/impeccable clarify`.
- **Repetição e enfeite na home** (Ritz ~8 vezes, "3 passos" duas vezes, números repetidos, fachada 3 vezes, faixa animada, polaroide, brilho dourado, título em gradiente) — vai contra o pedido de contenção estilo Apple. Cerca de 3.000 px a menos no celular. `/impeccable distill`, `/impeccable quieter`.
- **Animações infinitas sem pausa** (faixa de categorias, anel do WhatsApp, linha de energia). WCAG 2.2.2. `/impeccable animate`.
- **"Limpar lista" apaga tudo num toque**, sem desfazer. `/impeccable harden`.
- **Toast "Ver lista" some em 4,5 s** e pode não ser anunciado. WCAG 2.2.1/4.1.3. `/impeccable harden`.
- **Banner de cookies no fim do DOM** (76 Tabs para chegar no celular; Esc não faz nada). `/impeccable harden`.
- **Fotos do catálogo em baixa resolução** (56% abaixo de 320 px) e `width/height` que não batem com o arquivo. `/impeccable optimize`.
- **Peso de imagem da home no celular** (banner de 109 KB a 22% de opacidade; 4 fotos sem lazy). `/impeccable optimize`.
- **`data-q` em produtos.html**: 209 KB de 603 KB repetem o que já está nos dados. `/impeccable optimize`.
- **Texto a 200% causa rolagem lateral em 7 de 12 modelos** (e-mails, botões de categoria, seletor da calculadora). `/impeccable adapt`.
- **Tabela técnica no celular**: janela de 356 px para tabela de 1.302 px com rolagem presa. → Coluna de referência fixa, sem altura máxima. `/impeccable adapt`.
- **Contagem contraditória na busca do catálogo** ("13 produtos" e "3 produtos" ao mesmo tempo). `/impeccable clarify`.
- **Calculadora**: no computador o botão flutuante cobre "Pedir orçamento deste cabo"; no celular o resultado fica ~900 px abaixo dos campos; o cartão inteiro é `aria-live` (relê tudo a cada tecla). `/impeccable layout`, `/impeccable adapt`.
- **Dois blocos de compartilhar no mesmo artigo.** `/impeccable distill`.
- **Cartão "Linhas complementares" no celular**: o título passa 36 px e fica sob o selo "49 produtos". `/impeccable adapt`.

### P3 — acabamento

Foco dos campos fraco (só cor da borda); lightbox sem nome acessível; `<h2>` dentro de `<summary>`; tokens de fonte mortos e 163 cores fixas no CSS; cards de artigo da home apontam para âncora JS; alt "Ilustração: …" em fotos reais; selos de norma duplicados ("ASTM F1826" / "ASTM F 1826"); nome da categoria diferente no H1 e no menu.

## O que está bom (manter)

- Sem rolagem horizontal a 320, 360 e 390 px em nenhum modelo; contraste AA nos dois temas em todo texto medido (exceto o selo da calculadora); foco visível de 3 px; "Pular para o conteúdo"; 1 `h1` por página; landmarks corretos; diálogos nativos com Esc e retorno de foco; 0 links internos quebrados em 371 páginas.
- Formulário de orçamento: leve, na língua do setor, erros claros ligados ao campo, só 3 campos obrigatórios.
- Modal do catálogo: seletor de referência com "Não sei a referência", contador de quantidade, busca por referência e norma ("ATR17439" acha 1; "15 kV" acha 18).
- Blog técnico: conteúdo útil e específico, com fonte do catálogo.
- Calculadora: cálculo correto e alinhado à NBR 5410 com entradas válidas.
- Provas reais e locais: loja, endereço, aviso aberto/fechado, CNPJ, Ritz.
- `prefers-reduced-motion` respeitado; consentimento antes do GTM; LCP real ~0,6 s.

## Causa raiz e ordem sugerida

A maior parte dos P1/P2 vem de três fontes: **dados do PDF publicados sem curadoria** (tabelas, resíduos, fotos), **duas cascas e quatro CSS** (lista, tema e rótulos divergentes) e **um fluxo de pedido que termina antes do envio**. Ordem sugerida:

1. `/impeccable harden` — tabelas (paliativo) e validação da calculadora (P0).
2. `/impeccable layout` — casca única para as 363 páginas geradas, com lista de orçamento e "Adicionar" que adiciona.
3. `/impeccable clarify` — fim do pedido, rótulos únicos, links de avaliação/mapa, contagens.
4. `/impeccable optimize` — catálogo visível sem JS de dados, `data-q`, imagens.
5. `/impeccable distill` + `/impeccable quieter` — home mais curta e contida; quem somos com prova real.
6. `/impeccable adapt` + `/impeccable colorize` — celular (nomes, tabelas, texto a 200%) e tokens de status.
7. `/impeccable document` — unificar CSS/JS e registrar o sistema visual.
8. `/impeccable polish` — passada final.

## Perguntas para pensar

1. A página de produto é onde o Google entrega o comprador. Ela deveria ser a superfície principal de compra, e o modal do catálogo o atalho?
2. Compradores chegam com listas de referências. Uma caixa "Cole sua lista de referências" que reconhece códigos ATR/FLV/RH e preenche a lista não vale mais que 30 modais?
3. Se as tabelas de 229 páginas ainda não são confiáveis, converte mais mostrar uma tabela curada "Referência · Tensão · Comprimento" para os 20 itens mais pedidos e o PDF original para o resto?
4. "Elétrica Solar" ajuda ou atrapalha com quem compra para média tensão e linha viva?
