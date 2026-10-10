/* Lista de orçamento para as páginas geradas (produtos, categorias, blog).
   Usa a MESMA chave de armazenamento das páginas principais (maxx-orcamento-v2), então a lista segue o visitante
   de uma página para outra. Sem dependências. */
(function () {
  "use strict";
  var CART_KEY = "maxx-orcamento-v2";
  var WHATS = "5586994540900", WHATS_LABEL = "(86) 99454-0900";
  var me = document.currentScript, BASE = (me && me.getAttribute("data-base")) || "";
  var IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function track(name, params) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params || {})); } catch (e) {} }
  function saudacao() {
    var h = new Date().getHours();
    try { h = +new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", hour: "numeric", hour12: false }).format(new Date()) % 24; } catch (e) {}
    return h < 12 ? "Bom dia" : (h < 18 ? "Boa tarde" : "Boa noite");
  }
  function waHref(texto) {
    var q = encodeURIComponent(saudacao() + ", equipe MAXX Elétrica Solar!\n\n" + texto + "\n\nAgradeço desde já.");
    return IS_MOBILE ? "https://wa.me/" + WHATS + "?text=" + q : "https://web.whatsapp.com/send?phone=" + WHATS + "&text=" + q;
  }
  function abreWa(a, origem) {
    a.target = "_blank"; a.rel = "noopener noreferrer";
    a.addEventListener("click", function () { track("clique_whatsapp", { origem: origem }); });
  }

  /* ===== armazenamento ===== */
  var cart = [];
  function carrega() {
    var c = [];
    try { c = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { c = []; }
    if (!Array.isArray(c)) c = [];
    cart = c.filter(function (it) { return it && it.k && it.nome; }).map(function (it) {
      return { k: String(it.k), id: it.id == null ? "" : String(it.id), nome: String(it.nome), ref: it.ref == null ? "" : String(it.ref), q: Math.min(9999, parseInt(it.q, 10) || 0) };
    }).filter(function (it) { return it.q > 0; });
  }
  function salva() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} atualiza(); }
  function achar(k) { for (var i = 0; i < cart.length; i++) if (cart[i].k === k) return cart[i]; return null; }
  function adiciona(item, q) {
    q = Math.max(1, Math.min(9999, parseInt(q, 10) || 1));
    var k = item.id + "|" + (item.ref || ""), it = achar(k);
    if (it) it.q = Math.min(9999, it.q + q); else cart.push({ k: k, id: item.id, nome: item.nome, ref: item.ref || "", q: q });
    track("add_to_cart", { item: item.id, ref: item.ref || "" });
  }
  function totalUnidades() { return cart.reduce(function (n, it) { return n + it.q; }, 0); }
  function linhas() { return cart.map(function (it) { return "- " + it.q + " × " + it.nome + (it.ref ? " (Ref. " + it.ref + ")" : ""); }); }

  /* ===== aviso curto ===== */
  var toastT;
  function aviso(msg, rotulo, fn) {
    $$(".toast").forEach(function (o) { o.remove(); });
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    if (rotulo) {
      var b = document.createElement("button"); b.type = "button"; b.className = "link-btn"; b.textContent = rotulo;
      b.style.cssText = "margin-left:12px;color:var(--gold-hi);font-weight:600";
      b.addEventListener("click", function () { t.remove(); fn(); });
      t.appendChild(b);
    }
    document.body.appendChild(t); clearTimeout(toastT);
    toastT = setTimeout(function () { t.remove(); }, rotulo ? 6000 : 3000);
  }

  /* ===== gaveta da lista ===== */
  var dlg;
  function criaGaveta() {
    if (dlg) return dlg;
    dlg = document.createElement("dialog"); dlg.className = "drawer"; dlg.id = "lista-dlg"; dlg.setAttribute("aria-labelledby", "lista-t");
    dlg.innerHTML = '<div class="drawer-head"><h2 id="lista-t">Lista de orçamento</h2><button type="button" class="drawer-x" data-fecha aria-label="Fechar a lista">×</button></div>' +
      '<div class="drawer-body" data-lista-corpo></div><div class="drawer-foot" data-lista-pe></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-fecha]")) dlg.close(); });
    dlg.addEventListener("click", function (e) {
      var st = e.target.closest("[data-step]"), rm = e.target.closest("[data-rm]"), lim = e.target.closest("[data-limpar]");
      if (st) { var it = achar(st.getAttribute("data-k")); if (it) { it.q = Math.max(0, Math.min(9999, it.q + parseInt(st.getAttribute("data-step"), 10))); if (!it.q) cart.splice(cart.indexOf(it), 1); salva(); } }
      if (rm) { var r = achar(rm.getAttribute("data-rm")); if (r) { cart.splice(cart.indexOf(r), 1); salva(); } }
      if (lim) { cart = []; salva(); }
    });
    dlg.addEventListener("change", function (e) {
      var inp = e.target.closest("[data-qty]"); if (!inp) return;
      var it = achar(inp.getAttribute("data-qty")); if (!it) return;
      it.q = Math.max(0, Math.min(9999, parseInt(inp.value, 10) || 0)); if (!it.q) cart.splice(cart.indexOf(it), 1); salva();
    });
    return dlg;
  }
  function desenhaGaveta() {
    if (!dlg) return;
    var corpo = $("[data-lista-corpo]", dlg), pe = $("[data-lista-pe]", dlg);
    if (!cart.length) {
      corpo.innerHTML = '<p class="lista-vazia">Sua lista está vazia. Escolha uma referência e toque em <b>Adicionar à lista de orçamento</b>.</p>';
      pe.innerHTML = '<a class="btn btn-ghost" href="' + BASE + 'produtos.html">Ver produtos</a>'; return;
    }
    corpo.innerHTML = '<ul class="lista-itens">' + cart.map(function (it) {
      return '<li><div class="li-t"><b>' + esc(it.nome) + '</b>' + (it.ref ? '<span class="li-ref">Ref. ' + esc(it.ref) + '</span>' : '<span class="li-ref">Referência a confirmar</span>') + '</div>' +
        '<div class="qty"><button type="button" data-step="-1" data-k="' + esc(it.k) + '" aria-label="Diminuir a quantidade de ' + esc(it.nome) + '">−</button>' +
        '<input type="number" inputmode="numeric" min="0" max="9999" value="' + it.q + '" data-qty="' + esc(it.k) + '" aria-label="Quantidade de ' + esc(it.nome) + '">' +
        '<button type="button" data-step="1" data-k="' + esc(it.k) + '" aria-label="Aumentar a quantidade de ' + esc(it.nome) + '">+</button></div>' +
        '<button type="button" class="li-rm" data-rm="' + esc(it.k) + '" aria-label="Remover ' + esc(it.nome) + ' da lista">Remover</button></li>';
    }).join("") + '</ul>';
    pe.innerHTML = '<a class="btn btn-gold" data-lista-wa href="#">Enviar a lista no WhatsApp</a>' +
      '<a class="btn btn-ghost" href="' + BASE + 'produtos.html#orcamento">Enviar com meus dados</a>' +
      '<button type="button" class="link-btn" data-limpar>Limpar a lista</button>';
    var wa = $("[data-lista-wa]", pe);
    wa.href = waHref("Gostaria de fazer um pedido de orçamento dos produtos abaixo, que vi no site:\n\n" + linhas().join("\n") + "\n\nFico no aguardo de preço, disponibilidade e prazo de entrega.");
    abreWa(wa, "lista");
  }
  function abreLista() { criaGaveta(); desenhaGaveta(); if (!dlg.open) dlg.showModal(); track("abrir_lista", { itens: cart.length }); }

  /* ===== contadores do cabeçalho ===== */
  function atualiza() {
    var n = cart.length;
    $$("[data-lista-n]").forEach(function (b) { b.textContent = n; b.hidden = !n; });
    $$("[data-lista-abrir]").forEach(function (b) {
      b.setAttribute("aria-label", n ? "Lista de orçamento, " + n + (n > 1 ? " itens" : " item") : "Lista de orçamento, vazia");
    });
    desenhaGaveta(); atualizaPick();
  }

  /* ===== bloco de compra do produto (seletor por tensão ou por referência) ===== */
  function iniciaCompra(box) {
    var dados = {}; try { dados = JSON.parse(box.getAttribute("data-tab") || "{}"); } catch (e) {}
    var id = box.getAttribute("data-id"), nome = box.getAttribute("data-nome");
    var rows = dados.rows || [], cols = dados.cols || [], refI = dados.ref, kvI = dados.kv;
    var qtd = $("[data-q]", box), erro = $("[data-erro]", box), wa = $("[data-wa-buy]", box), cartao = $("[data-cartao]", box);
    var sel = null; // linha escolhida

    function refEscolhida() {
      var r = $("[data-ref-sel]", box);
      if (r) return r.value;
      return sel ? sel[refI] : "";
    }
    function q() { return Math.max(1, Math.min(9999, parseInt(qtd.value, 10) || 1)); }
    function pinta() {
      if (cartao) {
        if (sel) {
          cartao.hidden = false;
          var dl = cols.map(function (t, i) { return (i === refI || i === kvI || !t || !sel[i]) ? "" : "<div><dt>" + esc(t) + "</dt><dd>" + esc(sel[i]) + "</dd></div>"; }).join("");
          cartao.innerHTML = '<p class="pm-sel-ref"><span>Referência</span><b>' + esc(sel[refI]) + "</b></p><dl>" + dl + "</dl>";
        } else { cartao.hidden = true; cartao.innerHTML = ""; }
      }
      var ref = refEscolhida();
      var txt = "Gostaria de fazer um pedido de orçamento do produto abaixo, que vi no site:\n\n• *" + nome + "*\n• Referência: " + (ref || "(não sei, preciso de ajuda para escolher)") + "\n• Quantidade: " + q() + "\n\nFico no aguardo de preço, disponibilidade e prazo de entrega.";
      if (wa) wa.href = waHref(txt);
    }
    // segmentado (tensão)
    $$("input[name=kv]", box).forEach(function (r) {
      r.addEventListener("change", function () {
        sel = rows.filter(function (row) { return row[kvI] === r.value; })[0] || null;
        if (erro) erro.textContent = ""; pinta();
      });
    });
    var rs = $("[data-ref-sel]", box); if (rs) rs.addEventListener("change", pinta);
    qtd.addEventListener("input", pinta);
    $$("[data-qstep]", box).forEach(function (b) {
      b.addEventListener("click", function () { qtd.value = Math.max(1, Math.min(9999, (parseInt(qtd.value, 10) || 1) + parseInt(b.getAttribute("data-qstep"), 10))); pinta(); });
    });
    var add = $("[data-add]", box);
    add.addEventListener("click", function () {
      var ref = refEscolhida();
      if (box.hasAttribute("data-exige") && !ref) {
        if (erro) erro.textContent = "Escolha a tensão para adicionar à lista, ou toque em “Não sei qual tensão”.";
        var f = $("input[name=kv]", box); if (f) f.focus(); return;
      }
      adiciona({ id: id, nome: nome, ref: ref }, q()); salva();
      aviso("Adicionado à lista de orçamento.", "Ver lista", abreLista);
    });
    var ajuda = $("[data-ajuda]", box);
    if (ajuda) { ajuda.href = waHref("Preciso de ajuda para escolher a tensão do produto abaixo:\n\n• *" + nome + "*\n\nPode me orientar? Trabalho com rede de ______ kV."); abreWa(ajuda, "ajuda_tensao"); }
    if (wa) abreWa(wa, "pagina_produto");
    pinta();
  }

  /* ===== tabela com seleção múltipla e barra fixa ===== */
  function linhasMarcadas() {
    return $$("[data-pick] tr[data-row]").map(function (tr) {
      var c = $("input[type=checkbox]", tr), n = $("input[type=number]", tr);
      return c && c.checked ? { ref: tr.getAttribute("data-row"), q: Math.max(1, parseInt(n.value, 10) || 1), tr: tr } : null;
    }).filter(Boolean);
  }
  function atualizaPick() {
    var bar = $("[data-pm-bar]"); if (!bar) return;
    var m = linhasMarcadas(), un = m.reduce(function (s, x) { return s + x.q; }, 0), nome = bar.getAttribute("data-nome");
    $$("[data-pick] tr[data-row]").forEach(function (tr) { var c = $("input[type=checkbox]", tr); tr.classList.toggle("on", !!(c && c.checked)); });
    bar.hidden = !m.length; document.body.classList.toggle("tem-barra", !!m.length);
    $("[data-bar-txt]", bar).textContent = m.length + (m.length > 1 ? " referências · " : " referência · ") + un + (un > 1 ? " unidades" : " unidade");
    var wa = $("[data-bar-wa]", bar);
    wa.href = waHref("Gostaria de fazer um pedido de orçamento do produto abaixo, que vi no site:\n\n• *" + nome + "*\n" + m.map(function (x) { return "- " + x.q + " × Ref. " + x.ref; }).join("\n") + "\n\nFico no aguardo de preço, disponibilidade e prazo de entrega.");
  }
  function iniciaPick() {
    var bar = $("[data-pm-bar]"); if (!bar) return;
    var id = bar.getAttribute("data-id"), nome = bar.getAttribute("data-nome");
    $$("[data-pick]").forEach(function (t) {
      t.addEventListener("change", function (e) {
        var tr = e.target.closest("tr[data-row]"); if (!tr) return;
        if (e.target.type === "number") { var c = $("input[type=checkbox]", tr); if (c && !c.checked && parseInt(e.target.value, 10) > 0) c.checked = true; }
        atualizaPick();
      });
      t.addEventListener("input", function (e) {
        if (e.target.type !== "number") return;
        var tr = e.target.closest("tr[data-row]"), c = tr && $("input[type=checkbox]", tr);
        if (c && !c.checked && parseInt(e.target.value, 10) > 0) c.checked = true; // digitou uma quantidade: a linha entra na seleção
        atualizaPick();
      });
    });
    $("[data-bar-add]", bar).addEventListener("click", function () {
      var m = linhasMarcadas(); if (!m.length) return;
      m.forEach(function (x) { adiciona({ id: id, nome: nome, ref: x.ref }, x.q); });
      salva();
      m.forEach(function (x) { var c = $("input[type=checkbox]", x.tr); if (c) c.checked = false; $("input[type=number]", x.tr).value = 1; });
      atualizaPick();
      aviso(m.length > 1 ? m.length + " referências adicionadas à lista." : "Referência adicionada à lista.", "Ver lista", abreLista);
    });
    abreWa($("[data-bar-wa]", bar), "barra_selecao");
    atualizaPick();
  }

  /* ===== tema claro/escuro (mesma chave das páginas principais) ===== */
  function iniciaTema() {
    var btn = $("[data-tema-tg]"); if (!btn) return;
    var root = document.documentElement, mq = window.matchMedia && matchMedia("(prefers-color-scheme: light)");
    function atual() { return root.getAttribute("data-theme") || (mq && mq.matches ? "light" : "dark"); }
    function rotulo() {
      var claro = atual() === "light", t = claro ? "Apagar a luz (tema escuro)" : "Acender a luz (tema claro)";
      btn.setAttribute("aria-label", t); btn.title = t; btn.setAttribute("aria-pressed", claro ? "true" : "false");
    }
    btn.addEventListener("click", function () {
      var novo = atual() === "light" ? "dark" : "light";
      root.setAttribute("data-theme", novo);
      try { localStorage.setItem("maxx-tema", novo); } catch (e) {}
      if (novo === "light" && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) { btn.classList.remove("flick"); void btn.offsetWidth; btn.classList.add("flick"); }
      rotulo();
    });
    rotulo();
  }

  /* ===== ligação ===== */
  function inicia() {
    carrega();
    document.addEventListener("click", function (e) { if (e.target.closest("[data-lista-abrir]")) { e.preventDefault(); abreLista(); } });
    $$("[data-lista-prod]").forEach(iniciaCompra);
    document.addEventListener("click", function (e) {
      var bt = e.target.closest("[data-add-prod]"); if (!bt) return;
      adiciona({ id: bt.getAttribute("data-add-prod"), nome: bt.getAttribute("data-nome") || bt.getAttribute("data-add-prod") }, 1); salva();
      aviso("Adicionado à lista de orçamento.", "Ver lista", abreLista);
    });
    iniciaPick();
    iniciaTema();
    atualiza();
    window.addEventListener("storage", function (e) { if (e.key === CART_KEY) { carrega(); atualiza(); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicia); else inicia();
})();
