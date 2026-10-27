# Checklist do site MAXX Elétrica Solar

Atualizado em 21/10/2026, depois da auditoria (nota geral 8,2) e da revisão jurídica e de acessibilidade.
Marque `[x]` ao concluir. Quem faz: **[Você]** depende do dono, **[Claude]** é código ou texto do repositório, **[Juntos]** precisa dos dois.
Regras de trabalho: `CLAUDE.md`. Todo ajuste vai em branch + PR; a `main` publica sozinha. Histórico: `PENDENCIAS.md`.
Aviso: este checklist reduz risco, mas não substitui um advogado nas páginas legais.

## 1. Já feito
- [x] Política de privacidade, termos de uso, cookies, trocas e devoluções, entrega e pagamento, com CNPJ, razão social e endereço
- [x] Banner de cookies com Aceitar, Recusar e Personalizar; tudo desligado até o consentimento (Consent Mode v2)
- [x] Formulários coletam só o necessário (nome, WhatsApp e a lista), com aviso de uso dos dados e link da política
- [x] Sem avaliações estruturadas (`aggregateRating`/`Review`) nas páginas
- [x] Texto alternativo nas imagens; link "pular para o conteúdo"; Lighthouse: acessibilidade 100, boas práticas 100, SEO 100
- [x] Sitemap com 384 páginas, todas existentes; sem link interno quebrado; sem title nem description duplicados
- [x] Títulos até 65 caracteres e "Bloco Terminal" A e L distintos (PR 39)
- [x] 35 fotos órfãs removidas (PR 39)
- [x] Linha A (Aterramento temporário) alinhada ao fabricante: 27 produtos
- [x] Fontes locais sem Google Fonts, foco visível nos campos e política de privacidade corrigida (PR desta rodada)
- [x] Acessibilidade medida com o axe (0 violações em 10 páginas, 2 temas, 2 tamanhos) e corrigida: nome do logotipo e do botão da lista, galeria de fotos, tabelas roláveis, contraste do "aberto agora" e links do rodapé
- [x] Teclado: banner de cookies no início da ordem de foco, com foco devolvido ao conteúdo ao fechar
- [x] Desempenho: catálogo de 118 KB para 65 KB comprimidos, nota 57 para 72 no lab; home 81 para 85; saltos de layout corrigidos (PR desta rodada)
- [x] Google Analytics 4 instalado em todas as páginas só depois do aceite de cookies (`assets/analytics.js`, ID `G-30QV93FJ7E`): sem aceite nada é enviado; ao retirar o aceite o envio para; eventos do site (orçamento, WhatsApp, lista, busca, compartilhar) vão ao GA4. Sinais do Google e personalização de anúncios desligados
- [x] Cabeçalho `<meta charset>` no início do `<head>` de Quem somos, Produtos e Guias (o Lighthouse acusava "charset tarde demais" no catálogo)

## 2. Jurídico e LGPD
- [x] **[Você]** Depoimentos: o dono decidiu manter todos os 6 (26/10/2026). A autenticidade e a autorização do uso dos nomes passam a ser responsabilidade do dono
- [x] **[Claude]** Depoimentos e promessas ligadas a eles: dispensado, o dono decidiu manter (26/10/2026). Se mudar de ideia, é só pedir a remoção, deixando o link para avaliar no Google
- [ ] **[Você]** Informar o nome e o e-mail do encarregado de dados (sugestão: `privacidade@maxxeletricasolar.com.br`)
- [ ] **[Claude]** Pôr o encarregado na seção 1 da política de privacidade e no resumo de privacidade dos formulários
- [x] **[Claude]** Corrigir a política: seção 4 dizia que o GitHub hospeda o site (é a Hostinger; o GitHub só guarda o código); seção 8 (HTTPS) conferida em produção: HTTPS e HSTS funcionam
- [ ] **[Claude]** Nota na política e na de cookies de que o GA4 e o Pixel só entram quando forem ativados
- [ ] **[Você]** Comprovante de revenda autorizada Ritz (contrato ou carta). Sem ele, o texto vira "trabalhamos com produtos Ritz"
- [ ] **[Claude]** Ajustar "Revendedor autorizado Ritz" no site conforme o comprovante
- [ ] **[Você]** Dizer a origem de cada foto: `hero-*.webp`, `banner.jpg`, `cabos`, `ferragens`, `ferramentas`, `isoladores`, `fachada`, `catalogo-equipe` (própria, banco de imagens, IA)
- [x] **[Claude]** Registrar as imagens em `tools/handoff/imagens-licencas.md` (feito, com a coluna de origem em branco); trocar ou remover o que não tiver licença continua pendente
- [ ] **[Você]** Pedir à Ritz autorização por escrito para usar as fotos e os textos do catálogo
- [ ] **[Você]** Revisão de um advogado nas políticas e nos termos
- [ ] **[Juntos]** Rever "Orçamento em até 24 horas" e "preço sob consulta": só manter o que a equipe cumpre
- [ ] **[Você]** Preencher a coluna Origem e a licença de cada imagem em `tools/handoff/imagens-licencas.md`
- [ ] **[Você]** Confirmar a remoção das imagens que nenhuma página usa (`hero-eletricista`, `hero-linha-viva`, `hero-subestacao`, `catalogo-equipe` e os JPG duplicados de `cabos`, `ferragens`, `ferramentas`, `isoladores`)

## 3. Acessibilidade e contraste
- [x] **[Claude]** Contorno de foco visível nos campos (contorno de 3 px conferido no navegador na home, no catálogo e na calculadora) — WCAG 2.4.7
- [x] **[Claude]** Banner de cookies na ordem de foco: agora é o 2º item do Tab (depois de "Pular para o conteúdo"); "Preferências de cookies" leva o foco ao primeiro interruptor e, ao salvar, o foco volta ao conteúdo
- [x] **[Claude]** Teclado testado no Chromium (home em 1280 px e produto em 390 px): 70 paradas de Tab, todas visíveis e com contorno, sem armadilha de foco; banner, preferências e salvar conferidos. Falta só leitor de tela de verdade (item abaixo)
- [x] **[Claude]** Rótulo do controle de tema conferido no código: descreve a ação ("Acender a luz (tema claro)" / "Apagar a luz (tema escuro)"). Leitor de tela real continua no item abaixo
- [x] **[Claude]** Botões da barra de seleção do produto: decidido manter 2 linhas por botão em 360 e 390 px (os rótulos são fixos no CLAUDE.md; um botão por linha deixaria a barra bem mais alta e cobriria o conteúdo)
- [x] **[Claude]** Contraste medido com o axe em 10 páginas, tema claro e escuro, tela larga e de celular: o único erro real era "aberto agora" em verde claro (2,26:1), corrigido; hoje 0 violações
- [ ] **[Você]** Testar com leitor de tela de verdade (NVDA no Windows, TalkBack no Android ou VoiceOver no iPhone): home, produto, lista de orçamento e banner de cookies

## 4. Rastreamento e medição
- [ ] **[Você]** GA4 criado (ID `G-30QV93FJ7E`, passado em 27/10/2026). Falta só o Pixel da Meta, se for anunciar (passar o ID numérico)
- [ ] **[Claude]** GTM (GTM-WZNQMTZ4): o GA4 já está instalado direto no site (`assets/analytics.js`), então NÃO criar tag do GA4 no GTM (contaria em dobro). O contêiner só será usado para o Pixel da Meta, quando houver o ID
- [ ] **[Você]** Verificar o domínio na Meta por DNS
- [ ] **[Claude]** Reincluir o evento `view_item` nas páginas de produto
- [ ] **[Claude]** Medir `lista_na_home`, `pedido_preparado` e `generate_lead` antes e depois de cada mudança de layout
- [ ] **[Você]** Depois do merge: abrir o site, aceitar os cookies e conferir no GA4 > Relatórios > Tempo real se a visita aparece; no GA4 > Administrador > Eventos, marcar `generate_lead` como evento-chave (conversão). Já conferido por mim no site no ar: sem aceite nada vai ao Google; ao aceitar, o `gtag/js` com o ID `G-30QV93FJ7E` carrega e a visita é enviada (`g/collect`)

## 5. Hospedagem, segurança e formulário
- [ ] **[Você]** HTTPS e HSTS já funcionam em produção; falta confirmar no painel da Hostinger que `http://` redireciona para `https://`
- [ ] **[Você]** Criar as caixas `comercial@` e `sac@` (e `privacidade@`, se criar o encarregado)
- [ ] **[Juntos]** Envio de teste do formulário de ponta a ponta (a Hostinger precisa de PHP com `mbstring`)
- [ ] **[Você]** Remover o subdomínio `teste.maxxeletricasolar.com.br` e a pasta `teste/` da Hostinger
- [ ] **[Claude]** Tirar `teste.` de `ORIGENS_OK` em `enviar-pedido.php` depois do item anterior
- [ ] **[Juntos]** Descobrir o cabeçalho de IP real da Hostinger; então trocar o limite por visitante para `REMOTE_ADDR`
- [ ] **[Você]** Criar a conta do anti-robô (Cloudflare Turnstile); **[Claude]** ligar no formulário
- [ ] **[Claude]** CSP definitiva: navegar o site com o F12 aberto, zerar os avisos, trocar `Report-Only` por `Content-Security-Policy` e planejar a saída de `'unsafe-inline'` Medido em 29 páginas, com e sem consentimento: 0 violações da política atual. Falta decidir virar para modo bloqueante (risco: tags futuras do Tag Manager) e confirmar no ar
- [x] **[Claude]** Hospedar as fontes (Inter, Plus Jakarta Sans, JetBrains Mono) no próprio site e tirar o Google Fonts (386 páginas, `assets/fonts/`; a CSP já não cita o Google Fonts)
- [x] **[Claude]** Redirect do `www` com destino fixo (`https://maxxeletricasolar.com.br`) e `object-src 'none'` na CSP
- [ ] **[Juntos]** Decidir se o Tag Manager passa a carregar só depois do consentimento (hoje ele carrega em toda página e consulta o Google, sem gravar cookies de medição). Hoje ele carrega no primeiro toque, tecla ou rolagem, ou 6 s depois (não há tags dentro); se criar tags para disparar na abertura, reverter (CLAUDE.md, regra 19)
- [ ] **[Claude]** Remover o arquivo `CNAME` da raiz (sobra de GitHub Pages; a produção é Hostinger), depois da sua confirmação

## 6. Desempenho
- [x] **[Claude]** Peso do catálogo: o `catalogo-data.js` (609 KB) nenhuma página carrega, só as ferramentas; o peso real era o texto de busca `data-q` do `produtos.html` (53 KB de 118 KB comprimidos). Movido para `assets/catalogo-busca.json`, que só baixa ao clicar na busca: HTML de 118 KB para 65 KB, busca com resultados idênticos em 10 consultas
- [ ] **[Claude]** Unificar os 4 CSS e 2 JS e trocar as ~163 cores fixas por tokens (PR próprio, página por página, com captura antes e depois)
- [ ] **[Claude]** Minificar CSS e JS e tirar o CSS que bloqueia a renderização
- [x] **[Claude]** Lighthouse mobile em produção (27/10/2026, depois dos PRs 40 e 41, 2 rodadas): home 95 (LCP 2,2 s, CLS 0,001), produto 99 (LCP 1,8 s), catálogo 98 (LCP 2,2 s, CLS 0,050); acessibilidade 99 a 100, SEO 100. Antes: 64, 83 e 63. Metas de desempenho 90+, LCP abaixo de 2,5 s e CLS abaixo de 0,1: atingidas. Falta o PageSpeed Insights (dados de campo) e uma nova medida depois de algumas semanas de visitas reais
- [x] **[Claude]** Fontes dentro do CSS (um pedido a menos antes de pintar), Tag Manager sob demanda (118 KB a menos no carregamento), salto de layout do catálogo (0,169 para 0,049) e da home (0,039 para 0,001) corrigidos

## 7. SEO e dados da empresa
- [ ] **[Você]** Passar os links separados de avaliação e de mapa do Google (hoje os dois usam `share.google/8Zr9PJPt1hZOWpXQ8`)
- [ ] **[Você]** Passar a nota e o número reais de avaliações do Google (não inventar)
- [ ] **[Você]** Atualizar o e-mail no Perfil da Empresa do Google
- [ ] **[Claude]** `LocalBusiness` completo com horário e coordenadas (precisa do horário real)
- [ ] **[Claude]** Padronizar "lista" e "pedido" nos textos
- [ ] **[Claude]** Rodar `node tools/sitemap-datas.js` a cada lote de páginas novas

## 8. Catálogo e produtos
- [ ] **[Você]** Pedir à Ritz as fotos grandes e sem marca d'água (as do catálogo têm 90 a 930 px)
- [ ] **[Você]** Foto do Conjunto de Aterramento Temporário e dos Conjuntos para Alta Tensão (o catálogo só tem desenhos)
- [ ] **[Juntos]** Conferir as tabelas em `tools/revisao-tabelas.csv` com o catálogo impresso
- [ ] **[Claude]** Texto bruto de tabela do PDF em 4 produtos; resumos de cartão de "Mastro para Cruzeta" e de dois "Esse conjunto..." que começam com pronome
- [ ] **[Claude]** Vara de Manobra Seccionável e Telescópica ainda usam fotos genéricas
- [ ] **[Você]** Autorizar a importação das linhas B a L e de luvas e alicates (um PR por linha, começando pela B)

## 9. Design
- [ ] **[Você]** Aprovar ou ajustar o redesenho do canvas (home, categoria, produto e celular): https://claude.ai/artifact/3T6jvKqe5mCTiqZevQQ8Wd
- [ ] **[Claude]** Aplicar na ordem categoria, produto, home e celular, em branch + PR, com Lighthouse antes e depois
- [ ] **[Você]** Módulo "pedido de orçamento por projeto": decidir quando retomar (adiado)

## 10. Verificação antes de cada publicação
- [ ] Checagem de SEO, links e imagens sem achados novos
- [ ] Console do navegador sem erros em home, categoria, produto, calculadora e 404
- [ ] Teste de teclado nas páginas alteradas
- [ ] Formulário de orçamento testado do início ao fim
- [ ] Banner de cookies: Recusar mantém `analytics_storage` negado
- [ ] Reindexar assets se CSS ou JS mudou (`node tools/reindexar-assets.js`)
- [ ] Conferir a página no ar depois do merge (o `curl` leva 403 da Hostinger; usar o navegador)
