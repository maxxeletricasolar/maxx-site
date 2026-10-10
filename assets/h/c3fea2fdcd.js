
(function(){
  // ===== CONFIGURAÇÃO — confira o número antes de publicar =====
  var WHATS = "5586994540900";            // DDI + DDD + número, só dígitos
  var WHATS_LABEL = "(86) 99454-0900";
  // Cópia dos pedidos por e-mail: enviar-pedido.php (servidor da Hostinger).
  var EMAIL_TO = "comercial@maxxeletricasolar.com.br";
  var EMAIL_ENDPOINT = "/enviar-pedido.php";
  // ============================================================


  // ===== mensagens: saudação conforme o horário e número de protocolo do pedido =====
  function saudacao(){ var h = new Date().getHours(); try{ h = +new Intl.DateTimeFormat("en-US",{timeZone:"America/Fortaleza",hour:"numeric",hour12:false}).format(new Date()) % 24; }catch(e){} return h < 12 ? "Bom dia" : (h < 18 ? "Boa tarde" : "Boa noite"); }
  function protocolo(){
    var d = new Date(), p = function(n){ return String(n).padStart(2, "0"); };
    return "MX-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes());
  }
  function dataHora(){
    var d = new Date(), p = function(n){ return String(n).padStart(2, "0"); };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear() + " às " + p(d.getHours()) + "h" + p(d.getMinutes());
  }
  var waBase = "https://wa.me/" + WHATS;
  document.querySelectorAll(".js-phone").forEach(function(el){ el.textContent = WHATS_LABEL; });
  document.querySelectorAll(".js-wa").forEach(function(a){
    a.href = waBase + "?text=" + encodeURIComponent(saudacao() + ", equipe MAXX Elétrica Solar!\n\nEncontrei vocês pelo site e gostaria de fazer um pedido de orçamento. Podem me atender?\n\nAgradeço desde já.");
  });
  document.getElementById("ano").textContent = new Date().getFullYear();

  var interesses = ["Aterramento Temporário","Linha viva / bastões","Coberturas isolantes","Instrumentos de teste","Perfilados","Eletrocalhas","Postes","Combate a Incêndio","Material de Lógica","Hidráulica","EPIs","Fardamentos","Outros"];
  var iWrap = document.getElementById("interesses");
  function chipHTML(v){ return '<label class="multi-opt"><input type="checkbox" name="interesse" value="'+v+'"><span>'+v+'</span></label>'; }
  iWrap.innerHTML = interesses.map(chipHTML).join("");
  // menu suspenso de múltipla escolha: resumo do que foi marcado e fecha ao clicar fora
  var iDD = document.getElementById("interesses-dd"), iSum = document.getElementById("int-sum");
  function iUpd(){
    var sel = [].slice.call(iWrap.querySelectorAll("input:checked")).map(function(c){ return c.value; });
    iSum.textContent = !sel.length ? "Selecione uma ou mais" : (sel.length <= 2 ? sel.join(", ") : sel.length + " linhas selecionadas");
    iSum.classList.toggle("on", sel.length > 0);
  }
  iWrap.addEventListener("change", iUpd);
  document.addEventListener("click", function(e){ if(iDD.open && !iDD.contains(e.target)) iDD.open = false; });
  iDD.addEventListener("keydown", function(e){ if(e.key === "Escape" && iDD.open){ iDD.open = false; iDD.querySelector("summary").focus(); } });
  var iForm = iWrap.closest("form"); if(iForm) iForm.addEventListener("reset", function(){ setTimeout(iUpd, 0); });


  // phone mask
  function mask(v){
    var d = v.replace(/\D/g,"").slice(0,11);
    if(d.length<=2) return d.length?"("+d:"";
    if(d.length<=6) return "("+d.slice(0,2)+") "+d.slice(2);
    if(d.length<=10) return "("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6);
    return "("+d.slice(0,2)+") "+d.slice(2,7)+"-"+d.slice(7);
  }
  document.querySelectorAll('input[type="tel"]').forEach(function(i){
    i.addEventListener("input", function(){ i.value = mask(i.value); });
  });

  function validField(el){
    var ok = el.name==="tel" ? el.value.replace(/\D/g,"").length>=10 : el.value.trim().length>=2;
    el.closest(".field").classList.toggle("invalid", !ok);
    return ok;
  }

  function toast(msg, actLabel, actFn){
    document.querySelectorAll(".toast").forEach(function(o){ o.remove(); });
    var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
    t.textContent = msg;
    if(actLabel){
      var b = document.createElement("button"); b.type = "button"; b.className = "link-btn"; b.textContent = actLabel;
      b.style.cssText = "margin-left:12px;color:var(--gold-hi);font-weight:600";
      b.addEventListener("click", function(){ t.remove(); actFn(); });
      t.appendChild(b);
    }
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, actLabel ? 4500 : 2600);
  }
  function esc(v){ return String(v).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function norm(v){ return String(v).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function goTo(id, focusId){
    document.getElementById(id).scrollIntoView({behavior: reduceMotion ? "auto" : "smooth"});
    if(focusId) setTimeout(function(){ var f = document.getElementById(focusId); if(f) f.focus({preventScroll:true}); }, 550);
  }
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== medição: preencha os IDs para ativar =====
  var GA_ID = "";          // Google Analytics 4, ex.: "G-XXXXXXXXXX"
  var META_PIXEL_ID = "";  // Pixel do Meta, ex.: "123456789012345"
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  if(GA_ID){
    var gs = document.createElement("script"); gs.async = true; gs.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID; document.head.appendChild(gs);
    gtag("js", new Date()); gtag("config", GA_ID);
  }
  if(META_PIXEL_ID){
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", META_PIXEL_ID); fbq("track", "PageView");
  }
  function track(name, params){
    params = params || {};
    try{
      window.dataLayer.push(Object.assign({event: name}, params));
      if(GA_ID) gtag("event", name, params);
      if(META_PIXEL_ID && window.fbq){ if(name === "generate_lead") fbq("track", "Lead"); else fbq("trackCustom", name, params); }
    }catch(err){}
  }
  // abre o WhatsApp: tenta nova aba; se o navegador bloquear, abre na janela atual
  // No computador vai direto ao WhatsApp Web (web.whatsapp.com); no celular usa wa.me, que abre o aplicativo.
  // Evita a página intermediária api.whatsapp.com, que alguns navegadores bloqueiam (ERR_BLOCKED_BY_RESPONSE).
  var IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  function waTarget(url){
    var m = String(url).match(/^https:\/\/wa\.me\/(\d+)\/?(?:\?text=([^#]*))?/);
    if(!m) return url;
    if(IS_MOBILE) return "https://wa.me/" + m[1] + (m[2] ? "?text=" + m[2] : "");
    return "https://web.whatsapp.com/send?phone=" + m[1] + (m[2] ? "&text=" + m[2] : "");
  }
  function openWa(url, noFallback){
    url = waTarget(url);
    // link temporário com noopener: a nova aba não fica ligada a esta página
    try{
      var a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.setAttribute("data-wa-direct", ""); a.style.display = "none"; document.body.appendChild(a); a.click(); a.remove();
      return true;
    }catch(err){}
    if(noFallback) return false;
    try{ window.location.href = url; return true; }catch(err){}
    return false;
  }
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me"]');
    if(!a || a.hasAttribute("data-wa-direct")) return;
    track("clique_whatsapp", {origem: a.classList.contains("wa-float") ? "botao_fixo" : "pagina"});
    // abre o WhatsApp de forma robusta (nova aba, ou a própria janela se a aba for bloqueada)
    e.preventDefault();
    if(!openWa(a.href)) toast("Não foi possível abrir o WhatsApp. Chame a MAXX no " + WHATS_LABEL + ".");
  });

  // ===== carrinho de orçamento (compartilhado entre as páginas) =====
  var CART_KEY = "maxx-orcamento-v2";
  var cart = [];
  try{ cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(err){ cart = []; }
  if(!Array.isArray(cart)) cart = [];
  cart = cart.filter(function(it){ return it && it.k && it.nome; }).map(function(it){ it.k = String(it.k); it.nome = String(it.nome); if(it.id != null) it.id = String(it.id); it.ref = it.ref == null ? "" : String(it.ref); it.q = Math.min(9999, parseInt(it.q, 10) || 0); return it; }).filter(function(it){ return it.q > 0; });
  function saveCart(){ try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(err){} }
  var LAST_KEY = "maxx-ultimo-pedido";
  function lastOrder(){ try{ var o = JSON.parse(localStorage.getItem(LAST_KEY)); return o && Array.isArray(o.itens) && o.itens.length ? o : null; }catch(err){ return null; } }
  function lastHTML(){
    var o = lastOrder(); if(!o) return "";
    var d = new Date(o.t), dt = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
    return '<div class="last-order"><p class="lo-h"><svg width="18" height="18"><use href="#i-doc"/></svg> Seu último pedido de orçamento</p><p class="lo-m">'+dt+' · '+o.itens.length+(o.itens.length > 1 ? " produtos" : " produto")+(o.p ? " · " + esc(o.p) : "")+'</p>'+
      '<ul>'+o.itens.slice(0, 4).map(function(it){ return "<li>"+(parseInt(it.q, 10) || 0)+" × "+esc(it.nome)+"</li>"; }).join("")+(o.itens.length > 4 ? "<li>e mais "+(o.itens.length - 4)+"…</li>" : "")+'</ul>'+
      '<button type="button" class="btn btn-gold" data-repeat>Repetir este pedido de orçamento</button></div>';
  }
  function keyOf(id, ref){ return id + "|" + (ref || ""); }
  function findItem(k){ for(var i = 0; i < cart.length; i++) if(cart[i].k === k) return cart[i]; return null; }
  function qtyOfProduct(id){ var n = 0; cart.forEach(function(it){ if(it.id === id) n += it.q; }); return n; }
  function setQty(k, q){
    q = Math.max(0, Math.min(9999, parseInt(q, 10) || 0));
    var it = findItem(k); if(!it) return;
    if(q === 0) cart.splice(cart.indexOf(it), 1); else it.q = q;
    saveCart(); renderCart();
  }
  function addToCart(item, q){
    q = Math.max(1, Math.min(9999, parseInt(q, 10) || 1));
    var k = keyOf(item.id, item.ref), it = findItem(k);
    if(it) it.q = Math.min(9999, it.q + q);
    else cart.push({k: k, id: item.id, nome: item.nome, ref: item.ref || "", q: q});
    saveCart(); renderCart();
    track("add_to_cart", {item: item.id, ref: item.ref || ""});
    var c = document.getElementById("cart-count"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    toast("Adicionado à lista de orçamento.", "Ver lista", openCart);
  }
  function cartLines(){
    return cart.map(function(it){ return "- " + it.q + " × " + it.nome + (it.ref ? " (Ref. " + it.ref + ")" : ""); });
  }
  function qtyHTML(k, q, min){
    return '<div class="qty"><button type="button" data-step="-1" data-k="'+esc(k)+'" aria-label="Diminuir">−</button>'+
      '<input type="number" min="'+(min || 0)+'" max="9999" value="'+q+'" data-qty="'+esc(k)+'" aria-label="Quantidade"><button type="button" data-step="1" data-k="'+esc(k)+'" aria-label="Aumentar">+</button></div>';
  }
  var cartBody = document.getElementById("cart-body"), cartFoot = document.getElementById("cart-foot"), dlgCart = document.getElementById("dlg-cart");
  var onCatalogPage = !!document.getElementById("data-catalogo");
  function renderCart(){
    document.querySelectorAll(".js-cart-count").forEach(function(c){ c.textContent = cart.length; c.classList.toggle("zero", !cart.length); });
    if(!cart.length){
      cartBody.innerHTML = lastHTML() + '<div class="drawer-empty"><svg width="40" height="40" style="color:var(--muted)"><use href="#i-cart"/></svg><p style="margin:0">Sua lista está vazia. Toque em <b>Adicionar à lista de orçamento</b> nos produtos ou descreva o que precisa no formulário.</p>'+
        (onCatalogPage ? '<button type="button" class="btn btn-gold" data-goto="produtos">Ver produtos</button>' : '<a class="btn btn-gold" href="produtos.html">Ver produtos</a>')+'</div>';
      cartFoot.innerHTML = '<button type="button" class="btn btn-ghost" data-goto="orcamento">Descrever meu pedido no formulário</button>';
    } else {
      cartBody.innerHTML = cart.map(function(it){
        return '<div class="ci"><div><h3>'+esc(it.nome)+'</h3><small>'+(it.ref ? "Ref. " + esc(it.ref) : "Referência a definir com a equipe")+'</small></div>'+
          '<button type="button" class="rm" data-rm="'+esc(it.k)+'">Remover</button>'+qtyHTML(it.k, it.q)+'</div>';
      }).join("");
      cartFoot.innerHTML = '<button type="button" class="btn btn-gold" data-goto="orcamento" data-focus="f-nome">Enviar pedido de orçamento ('+cart.length+(cart.length > 1 ? " produtos" : " produto")+')</button>'+
        '<button type="button" class="btn btn-ghost" data-clear style="min-height:44px">Limpar lista</button>';
    }
    document.querySelectorAll("[data-cart-sum]").forEach(function(box){
      box.hidden = !cart.length;
      if(cart.length) box.innerHTML = '<b>Produtos da lista de orçamento ('+cart.length+')</b><ul>'+cartLines().map(function(l){ return "<li>"+esc(l.slice(2))+"</li>"; }).join("")+'</ul><button type="button" data-open-cart>Editar lista</button>';
    });
    document.querySelectorAll("[data-need-cart]").forEach(function(t){
      var lbl = t.closest(".field").querySelector("label");
      if(!lbl.dataset.base) lbl.dataset.base = lbl.textContent;
      lbl.innerHTML = cart.length ? 'Algo mais? <span class="opt">(opcional)</span>' : esc(lbl.dataset.base);
    });
    document.querySelectorAll("[data-add-prod]").forEach(function(b){
      var q = qtyOfProduct(b.getAttribute("data-add-prod"));
      b.classList.toggle("added", q > 0);
      b.innerHTML = q > 0 ? "✓ Na lista (" + q + ")" : '<svg><use href="#i-plus"/></svg> Orçamento';
    });
  }
  function openCart(){ renderCart(); if(dlgCart.showModal) dlgCart.showModal(); track("ver_orcamento", {itens: cart.length}); }
  document.getElementById("cart-open").addEventListener("click", openCart);

  document.addEventListener("click", function(e){
    var t = e.target.closest ? e.target : null; if(!t) return;
    var el;
    if((el = t.closest("[data-step]"))){
      var inp = el.parentNode.querySelector("input"), inSheet = !!el.closest(".pd-buy");
      var nv = Math.max(inSheet ? 1 : 0, (parseInt(inp.value, 10) || 0) + (+el.getAttribute("data-step")));
      inp.value = nv; if(!inSheet) setQty(el.getAttribute("data-k"), nv); return;
    }
    if((el = t.closest("[data-rm]"))){ setQty(el.getAttribute("data-rm"), 0); return; }
    if((el = t.closest("[data-clear]"))){ cart = []; saveCart(); renderCart(); return; }
    if((el = t.closest("[data-repeat]"))){ var lo = lastOrder(); if(lo){
        el.disabled = true;
        // produtos fora de linha não voltam para a lista (decisão 0005): só entram os que ainda estão no catálogo
        fetch("assets/busca.json").then(function(r){ return r.json(); }).then(function(d){ var ok = {}; (d.p || []).forEach(function(p){ ok[p.i] = 1; }); return ok; }).catch(function(){ return null; }).then(function(ok){
          var add = lo.itens.filter(function(it){ return !ok || ok[it.id]; }), fora = lo.itens.length - add.length;
          add.forEach(function(it){ var ex = findItem(it.k); if(ex) ex.q = Math.min(9999, ex.q + it.q); else cart.push({k: it.k, id: it.id, nome: it.nome, ref: it.ref || "", q: it.q}); });
          saveCart(); renderCart(); track("repetir_pedido", {itens: add.length, fora_de_linha: fora});
          toast(add.length ? "Produtos do último pedido de orçamento adicionados à lista. Confira as quantidades." + (fora ? " " + fora + (fora > 1 ? " produtos saíram de linha e não foram incluídos." : " produto saiu de linha e não foi incluído.") : "") : "Os produtos do último pedido de orçamento saíram de linha. Fale com a equipe para indicar substitutos.");
        });
      } return; }
    if((el = t.closest("[data-open-cart]"))){ openCart(); return; }
    if((el = t.closest("[data-goto]"))){
      var d = el.closest("dialog"); if(d) d.close();
      var target = el.getAttribute("data-goto");
      if(document.getElementById(target)) goTo(target, el.getAttribute("data-focus"));
      else location.href = target === "produtos" ? "produtos.html" : "./#" + target;
      return;
    }
    if((el = t.closest("[data-add-prod]"))){ addToCart({id: el.getAttribute("data-add-prod"), nome: el.getAttribute("data-nome") || el.getAttribute("data-add-prod")}, 1); return; }
    if((el = t.closest("[data-guide]"))){ if(GUIDES.length){ e.preventDefault(); openGuide(el.getAttribute("data-guide")); } return; }
    if((el = t.closest(".js-privacy"))){ document.getElementById("dlg-priv").showModal(); return; }
    if((el = t.closest("[data-close]"))){ el.closest("dialog").close(); return; }
  });
  document.addEventListener("change", function(e){
    var k = e.target.getAttribute && e.target.getAttribute("data-qty");
    if(k && !e.target.closest(".pd-buy")) setQty(k, e.target.value);
  });
  document.querySelectorAll("dialog.sheet, dialog.drawer").forEach(function(d){
    d.addEventListener("click", function(e){ if(e.target === d) d.close(); });
  });

  // ===== catálogo de produtos (só em produtos.html) =====
  var CAT = null, catById = Object.create(null), catGroups = Object.create(null), IMGS = {};
  function imgSrc(p){ return IMGS[p] || p; }
  if(onCatalogPage){
    CAT = window.__CAT || {}; CAT.produtos = CAT.produtos || []; CAT.grupos = CAT.grupos || [];
    var imgData = document.getElementById("data-imgs");
    if(imgData){ try{ IMGS = JSON.parse(imgData.textContent); }catch(err){ IMGS = {}; } }
    CAT.produtos.forEach(function(p){ catById[p.id] = p; });
    CAT.grupos.forEach(function(g){ catGroups[g.id] = g; });

    // imagens dos cartões
    document.querySelectorAll("img[data-src]").forEach(function(im){ im.src = imgSrc(im.getAttribute("data-src")); });

    // busca
    var cq = document.getElementById("cat-q"), cCount = document.getElementById("cat-count"), cEmpty = document.getElementById("cat-empty");
    var cards = [].slice.call(document.querySelectorAll(".pcard")), secs = [].slice.call(document.querySelectorAll(".cat-sec"));
    var qTimer;
    function runSearch(){
      var terms = norm(cq.value.trim()).split(/\s+/).filter(Boolean), shown = 0;
      cards.forEach(function(c){
        var hay = c.getAttribute("data-q"), ok = terms.every(function(t){ return hay.indexOf(t) >= 0; });
        c.hidden = !ok; if(ok) shown++;
      });
      secs.forEach(function(s){ s.hidden = !s.querySelector(".pcard:not([hidden])"); });
      cEmpty.hidden = shown > 0;
      cCount.textContent = terms.length ? shown + (shown === 1 ? " produto encontrado" : " produtos encontrados") + " para “" + cq.value.trim() + "”" : "";
    }
    cq.addEventListener("input", function(){ clearTimeout(qTimer); qTimer = setTimeout(function(){ runSearch(); if(cq.value.trim().length > 2) track("busca_produto", {termo: cq.value.trim()}); }, 160); });

    // menu lateral: destaca a categoria visível
    var navLinksCat = [].slice.call(document.querySelectorAll(".cat-nav a"));
    navLinksCat.forEach(function(a){
      a.addEventListener("click", function(){ navLinksCat.forEach(function(x){ x.classList.toggle("active", x === a); }); });
    });
    if("IntersectionObserver" in window){
      var secIO = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(!en.isIntersecting) return;
          navLinksCat.forEach(function(a){
            var on = a.getAttribute("href") === "#" + en.target.id;
            a.classList.toggle("active", on);
            if(on){
              var bar = a.closest(".cat-nav"), cur = document.getElementById("cat-cur");
              if(cur) cur.textContent = a.querySelector("span").textContent;
              if(bar.scrollHeight > bar.clientHeight + 4) bar.scrollTo({top: a.offsetTop - bar.clientHeight / 2 + a.offsetHeight / 2, behavior: reduceMotion ? "auto" : "smooth"});
              else if(bar.scrollWidth > bar.clientWidth + 4) bar.scrollTo({left: a.offsetLeft - bar.clientWidth / 2 + a.offsetWidth / 2, behavior: reduceMotion ? "auto" : "smooth"});
            }
          });
        });
      }, {rootMargin: "-30% 0px -60% 0px"});
      secs.forEach(function(s){ secIO.observe(s); });
    }
  }

  // ===== blog técnico (guias.html) =====
  var guideData = document.getElementById("data-guias"), GUIDES = [];
  if(guideData){
    GUIDES = JSON.parse(guideData.textContent);
    var tagBar = document.getElementById("blog-tags");
    if(tagBar) tagBar.addEventListener("click", function(e){
      var btn = e.target.closest("button[data-tag]"); if(!btn) return;
      var tag = btn.getAttribute("data-tag");
      tagBar.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x === btn ? "true" : "false"); });
      document.querySelectorAll("[data-post-tag]").forEach(function(p){ p.hidden = !!tag && p.getAttribute("data-post-tag") !== tag; });
      track("filtro_blog", {tema: tag || "todos"});
    });
  }
  var dlgGuia = document.getElementById("dlg-guia"), dgBody = document.getElementById("dg-body");
  function openGuide(id){
    var g = GUIDES.filter(function(x){ return x.id === id; })[0]; if(!g) return;
    var waQ = waBase + "?text=" + encodeURIComponent("Olá, MAXX! Li o artigo \"" + g.titulo + "\" e tenho uma dúvida:");
    var others = GUIDES.filter(function(x){ return x.id !== g.id && x.tag === g.tag; })
      .concat(GUIDES.filter(function(x){ return x.id !== g.id && x.tag !== g.tag; })).slice(0, 2);
    var share = window.MaxxShare ? MaxxShare.html(MaxxShare.site + "/guias/" + g.id + ".html", g.titulo, "txt", "Compartilhar este artigo, final do texto", "Gostou? Compartilhe este artigo") : "";
    dgBody.innerHTML = '<p class="eyebrow">' + esc(g.tag) + ' · ' + esc(g.leitura) + ' de leitura</p><h2 id="dg-title">' + esc(g.titulo) + '</h2>' +
      '<p class="lede" style="font-size:16px">' + esc(g.resumo) + '</p>' +
      '<div class="post-body">' + g.html.replace(/<table>/g, '<div class="tbl-wrap"><table>').replace(/<\/table>/g, '</table></div>') + '</div>' + share +
      (g.rel && g.rel.length ? '<div class="post-rel"><h3>Produtos citados neste artigo</h3><div class="post-rel-list">' + g.rel.map(function(r){
        return '<a href="produtos/' + r.id + '.html">' + esc(r.nome) + ' <svg width="14" height="14"><use href="#i-arrow"/></svg></a>';
      }).join("") + '</div></div>' : '') +
      '<p class="hint">Fonte: Catálogo de Produtos MAXX rev. 07/2026, ' + esc(g.fonte || "") + '. <a href="guias/' + g.id + '.html" style="color:var(--gold-hi)">Abrir em página própria</a></p>' +
      '<div class="sheet-acts"><button type="button" class="btn btn-gold" data-goto="orcamento" data-focus="f-nome">Pedir orçamento</button>' +
      '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + waQ + '"><svg><use href="#i-wa"/></svg> Tirar uma dúvida</a></div>' +
      (others.length ? '<div class="post-next"><h3>Leia também</h3>' + others.map(function(o){
        return '<button type="button" class="guide" data-guide="' + o.id + '"><span class="gtag">' + esc(o.tag) + '<i>' + esc(o.leitura) + '</i></span><h3>' + esc(o.titulo) + '</h3></button>';
      }).join("") + '</div>' : '');
    if(!dlgGuia.open) dlgGuia.showModal();
    dgBody.scrollTop = 0; dlgGuia.scrollTop = 0;
    try{ history.replaceState(null, "", "#guia-" + g.id); }catch(err){}
    track("ler_guia", {guia: id});
  }
  if(dlgGuia) dlgGuia.addEventListener("close", function(){
    if(location.hash.indexOf("#guia-") === 0){ try{ history.replaceState(null, "", location.pathname + location.search); }catch(err){} }
  });

  renderCart();

  // rola a fileira horizontal até deixar o cartão do produto à vista
  function revealCard(card){
    var row = card.closest(".prow"); if(!row || row.classList.contains("expanded")) return;
    var prev = row.style.scrollBehavior; row.style.scrollBehavior = "auto";
    row.scrollLeft = Math.max(0, card.offsetLeft - 2);
    row.style.scrollBehavior = prev;
    row.dispatchEvent(new Event("scroll"));
  }

  // ===== página nova sempre abre no topo; voltar/avançar devolve a posição anterior =====
  // Ao trocar de página, o navegador (ou a moldura onde o site é exibido) pode manter a rolagem
  // da página anterior. Página aberta por link ou recarregada começa no topo; com âncora na URL,
  // a rotina de chegada abaixo cuida. Voltar/avançar devolve a posição salva ao sair da página.
  (function(){
    var KEY = "maxx-rolagem:" + location.pathname + location.search;
    function save(){ try{ sessionStorage.setItem(KEY, String(Math.round(window.scrollY))); }catch(err){} }
    addEventListener("pagehide", save);
    if("scrollRestoration" in history) history.scrollRestoration = "manual";
    var navEntry = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var backForward = !!(navEntry && navEntry.type === "back_forward");
    if(location.hash.length > 1 && !backForward) return;
    var target = 0;
    if(backForward){ try{ target = parseInt(sessionStorage.getItem(KEY), 10) || 0; }catch(err){ target = 0; } }
    var html = document.documentElement, userMoved = false;
    function stop(){ userMoved = true; }
    ["wheel", "touchmove", "keydown", "mousedown"].forEach(function(ev){ addEventListener(ev, stop, {passive: true, once: true}); });
    function place(){
      if(userMoved) return;
      var prev = html.style.scrollBehavior; html.style.scrollBehavior = "auto";
      window.scrollTo(0, target);
      // se o site estiver dentro de uma moldura que rola por fora, traz o início da página para a vista
      if(target === 0 && window.top !== window.self){ try{ html.scrollIntoView({block: "start"}); }catch(err){} }
      html.style.scrollBehavior = prev;
    }
    place();
    [60, 250, 600].forEach(function(t){ setTimeout(place, t); });
    addEventListener("load", function(){ place(); setTimeout(place, 150); });
    setTimeout(stop, 1800);
  })();

  // ===== chegada por link de outra página: abre exatamente no início da seção =====
  // O navegador pula para a âncora antes de fontes e imagens terminarem de carregar; quando o
  // conteúdo acima se acomoda, a seção sai do lugar. Reposiciona enquanto a página carrega e
  // para assim que o visitante rolar por conta própria.
  (function(){
    var h; try{ h = decodeURIComponent(location.hash.slice(1)); }catch(err){ h = location.hash.slice(1); }
    if(!h || /^guia-/.test(h)) return;  // artigo abre na própria janela de leitura (openFromHash)
    var navE = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    if(navE && navE.type === "back_forward") return;  // voltar/avançar: a posição salva é devolvida acima
    var el = document.getElementById(h); if(!el) return;
    var card = null;
    if(/^p-/.test(h)){ card = el; el = card.closest(".cat-sec") || card; }  // produto: início da categoria dele
    if("scrollRestoration" in history) history.scrollRestoration = "manual";
    var userMoved = false, html = document.documentElement;
    function stop(){ userMoved = true; }
    ["wheel", "touchmove", "keydown", "mousedown"].forEach(function(ev){ addEventListener(ev, stop, {passive: true, once: true}); });
    function land(){
      if(userMoved) return;
      var prev = html.style.scrollBehavior; html.style.scrollBehavior = "auto";
      el.scrollIntoView({block: "start"});
      if(card) revealCard(card);
      html.style.scrollBehavior = prev;
    }
    land();
    [80, 250, 600, 1200].forEach(function(t){ setTimeout(land, t); });
    addEventListener("load", function(){ land(); setTimeout(land, 200); });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(land);
    setTimeout(stop, 3000);
  })();

  // links antigos #p-<id> (produtos.html) vão para a página do produto; #guia-<id> abre o artigo (guias.html)
  function openFromHash(){
    var h = location.hash.slice(1);
    if(h.indexOf("p-") === 0 && onCatalogPage && catById[h.slice(2)]){ location.replace("produtos/" + h.slice(2) + ".html"); }
    else if(h.indexOf("guia-") === 0 && GUIDES.length){ openGuide(h.slice(5)); }
  }
  openFromHash(); addEventListener("hashchange", openFromHash);

  document.querySelectorAll("form[data-form]").forEach(function(form){
    var req = form.querySelectorAll("[required]");
    req.forEach(function(el){
      el.addEventListener("blur", function(){ if(el.value) validField(el); });
      el.addEventListener("input", function(){ if(el.closest(".field").classList.contains("invalid")) validField(el); });
    });
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var bad = null, isCatalog = form.dataset.form === "catalogo";
      req.forEach(function(el){
        if(el.hasAttribute("data-need-cart") && cart.length){ el.closest(".field").classList.remove("invalid"); return; }
        if(!validField(el) && !bad) bad = el;
      });
      if(bad){ bad.focus(); return; }

      var fd = new FormData(form), L = [];
      var proto = protocolo(), nome = String(fd.get("nome") || "").trim(), emp = String(fd.get("empresa") || "").trim();
      form.dataset.proto = proto;
      L.push(saudacao() + ", equipe MAXX Elétrica Solar!");
      L.push("");
      if(isCatalog){
        L.push("Meu nome é " + nome + " e gostaria de receber o *catálogo de produtos da MAXX* (rev. 07/2026) em PDF.");
        L.push("");
        L.push("*DADOS PARA CONTATO*");
        L.push("• Nome: " + nome);
        L.push("• WhatsApp: " + fd.get("tel"));
        L.push("");
        L.push("Agradeço desde já pelo envio.");
      } else {
        L.push("Meu nome é " + nome + (emp ? ", da " + emp + "," : "") + " e gostaria de fazer um *pedido de orçamento* para os materiais abaixo.");
        L.push("");
        L.push("*DADOS DO SOLICITANTE*");
        L.push("• Nome: " + nome);
        L.push("• WhatsApp: " + fd.get("tel"));
        if(emp) L.push("• Empresa/obra: " + emp);
        if(fd.get("cidade")) L.push("• Cidade de entrega: " + fd.get("cidade"));
        if(fd.get("perfil")) L.push("• Perfil: " + fd.get("perfil"));
        if(cart.length){
          L.push(""); L.push("*ITENS DO CATÁLOGO*");
          cart.forEach(function(it, i){ L.push((i + 1) + ". " + it.q + " un. — " + it.nome + (it.ref ? " (Ref. " + it.ref + ")" : "")); });
        }
        var lista = String(fd.get("lista") || "").trim();
        if(lista){ L.push(""); L.push(cart.length ? "*OUTROS ITENS / OBSERVAÇÕES*" : "*LISTA DE MATERIAIS*"); L.push(lista); }
        var ints = fd.getAll("interesse");
        if(ints.length || fd.get("prazo")){
          L.push(""); L.push("*INFORMAÇÕES ADICIONAIS*");
          if(ints.length) L.push("• Linhas de interesse: " + ints.join(", "));
          if(fd.get("prazo")) L.push("• Prazo desejado: " + fd.get("prazo"));
        }
        L.push("");
        L.push("Fico no aguardo do orçamento com preço, disponibilidade e prazo de entrega.");
        L.push("Agradeço desde já pela atenção.");
      }
      L.push("");
      L.push("Atenciosamente,");
      L.push(nome + (emp && !isCatalog ? "\n" + emp : ""));
      L.push("");
      L.push("_" + (isCatalog ? "Pedido de catálogo " : "Pedido de orçamento ") + proto + " · enviado" + " pelo site da MAXX em " + dataHora() + "_");
      var msg = L.join("\n");
      var url = waBase + "?text=" + encodeURIComponent(msg);
      track(isCatalog ? "pedido_catalogo" : "generate_lead", {form: form.dataset.form, itens: cart.length});
      if(!isCatalog && cart.length){ try{ localStorage.setItem(LAST_KEY, JSON.stringify({t: Date.now(), p: proto, itens: cart.map(function(it){ return {k: it.k, id: it.id, nome: it.nome, ref: it.ref, q: it.q}; })})); }catch(err){} }

      var waOpened = openWa(url, true);

      var done = form.nextElementSibling;
      done.innerHTML =
        '<div class="check"><svg width="26" height="26"><use href="#i-check"/></svg></div>'+
        '<h3>Seu pedido está pronto</h3>'+
        (waOpened ? '' : '<p class="mail-st fail" style="margin:0">O navegador não abriu o WhatsApp automaticamente. Toque no botão abaixo para enviar.</p>')+
        '<p style="margin:0;color:var(--muted)">Toque em <b>Enviar no WhatsApp</b> e confirme o envio na conversa com a MAXX. Se preferir, copie o texto e mande para '+WHATS_LABEL+' ou '+EMAIL_TO+'.</p>'+
        '<p class="mail-st" data-mail-status><svg width="16" height="16"><use href="#i-mail"/></svg> Enviando uma cópia para o e-mail da MAXX…</p>'+
        '<pre></pre>'+
        '<div class="acts"><a class="btn btn-gold" target="_blank" rel="noopener" href="'+url+'"><svg><use href="#i-wa"/></svg> Enviar no WhatsApp</a>'+
        '<button type="button" class="btn btn-ghost js-copy"><svg><use href="#i-copy"/></svg> Copiar pedido</button></div>'+
        '<button type="button" class="btn btn-ghost js-back" style="min-height:44px">Editar pedido</button>';
      done.querySelector("pre").textContent = msg;
      form.hidden = true; done.hidden = false;
      done.querySelector(".js-copy").addEventListener("click", function(){
        var pre = done.querySelector("pre");
        var sel = function(){ var r=document.createRange(); r.selectNodeContents(pre); var s=getSelection(); s.removeAllRanges(); s.addRange(r); toast("Texto selecionado. Use Ctrl+C para copiar."); };
        if(navigator.clipboard){ navigator.clipboard.writeText(msg).then(function(){ toast("Pedido copiado."); }, sel); } else sel();
      });
      done.querySelector(".js-back").addEventListener("click", function(){ done.hidden = true; form.hidden = false; });
      done.querySelector("a.btn").focus();

      // cópia do pedido para o e-mail da empresa (não trava o WhatsApp)
      var st = done.querySelector("[data-mail-status]");
      function mailStatus(ok, text){ st.classList.toggle("ok", ok === true); st.classList.toggle("fail", ok === false); st.lastChild.textContent = " " + text; }
      if(form.dataset.lastSent === msg){ mailStatus(true, "Cópia deste pedido já enviada para o e-mail da MAXX."); return; }
      sendEmailCopy(form, fd, msg, isCatalog).then(function(){
        form.dataset.lastSent = msg;
        mailStatus(true, "Cópia enviada para o e-mail da MAXX.");
      }, function(){
        mailStatus(false, "Não foi possível enviar a cópia por e-mail agora. Envie pelo WhatsApp para garantir.");
      });
    });
  });

  function sendEmailCopy(form, fd, msg, isCatalog){
    if(!EMAIL_ENDPOINT) return Promise.reject(new Error("sem endpoint"));
    var hp = form.querySelector('input[name="_honey"]');
    if(hp && hp.value) return Promise.resolve();  // robô preencheu o campo oculto: ignora sem avisar
    var proto = form.dataset.proto || protocolo(), emp = String(fd.get("empresa") || "").trim();
    var payload = {
      _subject: (isCatalog ? "Pedido de catálogo" : "Pedido de orçamento") + " " + proto + " — " + fd.get("nome") + (emp && !isCatalog ? " (" + emp + ")" : ""),
      _template: "table",
      _captcha: "false",
      "Protocolo": proto,
      "Recebido em": dataHora(),
      "Tipo de pedido": isCatalog ? "Catálogo de produtos (PDF)" : "Orçamento de materiais",
      "Nome": fd.get("nome"),
      "WhatsApp": fd.get("tel")
    };
    if(!isCatalog){
      var LBL = {empresa: "Empresa/obra", cidade: "Cidade de entrega", perfil: "Perfil", prazo: "Prazo desejado"};
      ["empresa", "cidade", "perfil", "prazo"].forEach(function(k){ if(fd.get(k)) payload[LBL[k]] = fd.get(k); });
      var ints = fd.getAll("interesse"); if(ints.length) payload["Linhas de interesse"] = ints.join(", ");
      if(cart.length) payload["Itens do catálogo"] = cart.map(function(it, i){ return (i + 1) + ". " + it.q + " un. — " + it.nome + (it.ref ? " (Ref. " + it.ref + ")" : ""); }).join(" | ");
      if(String(fd.get("lista") || "").trim()) payload[cart.length ? "Observações" : "Materiais"] = String(fd.get("lista")).trim();
    }
    payload["Mensagem do cliente"] = msg.replace(/[*_]/g, "");
    payload["Próximo passo"] = "Responder pelo WhatsApp " + fd.get("tel") + " com preço, disponibilidade e prazo de entrega.";
    payload["Página"] = location.href.split("#")[0];
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function(){ if(ctrl) ctrl.abort(); }, 15000);
    return fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: {"Content-Type": "application/json", "Accept": "application/json"},
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function(r){
      clearTimeout(timer);
      return r.json().catch(function(){ return {}; }).then(function(j){
        if(!r.ok || String(j.success) === "false") throw new Error(j.message || ("HTTP " + r.status));
        track("copia_email_enviada", {form: form.dataset.form});
      });
    }, function(err){ clearTimeout(timer); throw err; });
  }

  // campo oculto anti-robô em todos os formulários
  document.querySelectorAll("form[data-form]").forEach(function(f){
    f.insertAdjacentHTML("afterbegin", '<input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">');
  });

  // ===== navegação: menu, barra inferior, voltar ao topo =====
  var dlgMenu = document.getElementById("dlg-menu"), menuBtn = document.getElementById("menu-open");
  if(menuBtn && dlgMenu){
    menuBtn.addEventListener("click", function(){ dlgMenu.showModal(); menuBtn.setAttribute("aria-expanded", "true"); track("abrir_menu"); });
    dlgMenu.addEventListener("close", function(){ menuBtn.setAttribute("aria-expanded", "false"); });
    dlgMenu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ dlgMenu.close(); }); });
  }
  // página atual no menu e na barra inferior
  var pageKey = document.getElementById("data-catalogo") ? "produtos" : (document.getElementById("data-guias") ? "blog" : (document.body.id === "pg-quem" ? "quem" : "inicio"));
  document.querySelectorAll('.tabbar [data-tab="' + pageKey + '"]').forEach(function(a){ a.setAttribute("aria-current", "page"); });
  document.querySelectorAll(".menu-links a").forEach(function(a){
    var h = a.getAttribute("href");
    if((pageKey === "produtos" && h === "produtos.html") || (pageKey === "blog" && h === "guias.html") || (pageKey === "quem" && h === "quem-somos.html") || (pageKey === "inicio" && /#topo$/.test(h))) a.setAttribute("aria-current", "page");
  });
  // voltar ao topo
  var toTop = document.getElementById("to-top");
  if(toTop){
    var ttTick = null;
    function ttUpdate(){ toTop.hidden = window.scrollY < 700; ttTick = null; }
    addEventListener("scroll", function(){ if(!ttTick) ttTick = setTimeout(ttUpdate, 80); }, {passive: true});
    ttUpdate();
    toTop.addEventListener("click", function(){ window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"}); var h = document.querySelector("header.site a, header.site button"); if(h) h.focus({preventScroll: true}); });
  }

  // ===== produtos: fileiras horizontais com setas, contador e "ver todos" =====
  var carousels = [];
  document.querySelectorAll(".cat-sec").forEach(function(sec){
    var row = sec.querySelector(".prow"); if(!row) return;
    var prev = sec.querySelector('[data-car="prev"]'), next = sec.querySelector('[data-car="next"]'),
        cnt = sec.querySelector(".car-count"), all = sec.querySelector('[data-car="all"]');
    function cards(){ return [].filter.call(row.children, function(c){ return !c.hidden; }); }
    function update(){
      var cs = cards(), n = cs.length;
      if(all) all.hidden = n <= 1;
      if(row.classList.contains("expanded") || !n){
        if(prev) prev.disabled = true; if(next) next.disabled = true;
        if(cnt) cnt.textContent = n + (n === 1 ? " produto" : " produtos");
        return;
      }
      var max = row.scrollWidth - row.clientWidth;
      if(prev) prev.disabled = row.scrollLeft <= 4;
      if(next) next.disabled = row.scrollLeft >= max - 4;
      var w = cs[0].offsetWidth || 1, first = 0;
      for(var i = 0; i < n; i++){ if(cs[i].offsetLeft + w / 2 >= row.scrollLeft){ first = i; break; } }
      var per = Math.max(1, Math.floor((row.clientWidth + 12) / (w + 12)));
      if(cnt) cnt.textContent = (n <= per ? n + (n === 1 ? " produto" : " produtos") : (first + 1) + "–" + Math.min(first + per, n) + " de " + n);
    }
    function page(dir){ row.scrollBy({left: dir * Math.max(200, row.clientWidth - 40), behavior: reduceMotion ? "auto" : "smooth"}); setTimeout(update, 700); }
    if(prev) prev.addEventListener("click", function(){ page(-1); });
    if(next) next.addEventListener("click", function(){ page(1); track("carrossel_proximo", {grupo: sec.id}); });
    if(all) all.addEventListener("click", function(){
      var on = row.classList.toggle("expanded");
      all.textContent = on ? "Ver em linha" : "Ver todos";
      all.setAttribute("aria-expanded", on ? "true" : "false");
      row.scrollLeft = 0; update();
      if(!on) sec.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"});
    });
    var tick = null;
    row.addEventListener("scroll", function(){ if(tick) return; tick = setTimeout(function(){ update(); tick = null; }, 60); }, {passive: true});
    row.addEventListener("scrollend", update);
    carousels.push(update);
    update();
  });
  if(carousels.length){
    var rsz; addEventListener("resize", function(){ clearTimeout(rsz); rsz = setTimeout(function(){ carousels.forEach(function(f){ f(); }); }, 120); });
    var cqEl = document.getElementById("cat-q");
    if(cqEl) cqEl.addEventListener("input", function(){ setTimeout(function(){ document.querySelectorAll(".prow").forEach(function(r){ r.scrollLeft = 0; }); carousels.forEach(function(f){ f(); }); }, 200); });
  }
  // setas da barra de categorias (computador)
  var catBar = document.querySelector(".cat-bar");
  if(catBar){
    var cnav = catBar.querySelector(".cat-nav"), cbPrev = catBar.querySelector('[data-scroll="-1"]'), cbNext = catBar.querySelector('[data-scroll="1"]');
    function cbUpdate(){ var m = cnav.scrollWidth - cnav.clientWidth; cbPrev.disabled = cnav.scrollLeft <= 4; cbNext.disabled = cnav.scrollLeft >= m - 4; }
    [cbPrev, cbNext].forEach(function(bt){ bt.addEventListener("click", function(){ cnav.scrollBy({left: +bt.getAttribute("data-scroll") * cnav.clientWidth * 0.7}); }); });
    cnav.addEventListener("scroll", cbUpdate, {passive: true}); addEventListener("resize", cbUpdate); cbUpdate();
  }

  // categorias em lista vertical: no celular abre e fecha como menu suspenso
  var catSide = document.getElementById("cat-side"), catTg = document.getElementById("cat-toggle");
  if(catSide && catTg){
    function catOpen(on){ catSide.classList.toggle("open", on); document.body.classList.toggle("cat-open", on); catTg.setAttribute("aria-expanded", on ? "true" : "false"); }
    catTg.addEventListener("click", function(){ catOpen(!catSide.classList.contains("open")); });
    catSide.querySelectorAll(".cat-nav a").forEach(function(a){
      a.addEventListener("click", function(){ var c = document.getElementById("cat-cur"); if(c) c.textContent = a.querySelector("span").textContent; catOpen(false); });
    });
    document.addEventListener("click", function(e){ if(catSide.classList.contains("open") && !catSide.contains(e.target)) catOpen(false); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && catSide.classList.contains("open")){ catOpen(false); catTg.focus(); } });
  }

  // ===== depoimentos: carrossel com setas, pontos e troca automática =====
  var dTrack = document.getElementById("deps-track");
  if(dTrack){
    var dCar = dTrack.closest(".deps-car"), dDots = dCar.querySelector(".deps-dots"), dCards = [].slice.call(dTrack.children), dTimer = null, dPaused = false;
    function dPer(){ var w = dCards[0].getBoundingClientRect().width || 1; return Math.max(1, Math.round(dTrack.clientWidth / (w + 12))); }
    function dPages(){ return Math.max(1, dCards.length - dPer() + 1); }
    function dIdx(){ var x = dTrack.scrollLeft, best = 0, bd = Infinity; dCards.forEach(function(c, i){ var d = Math.abs(c.offsetLeft - dCards[0].offsetLeft - x); if(d < bd){ bd = d; best = i; } }); return Math.min(best, dPages() - 1); }
    function dGo(i){ var n = dPages(); i = (i + n) % n; dTrack.scrollTo({left: dCards[i].offsetLeft - dCards[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth"}); }
    function dRender(){
      var n = dPages(), cur = dIdx();
      if(dDots.children.length !== n){
        dDots.innerHTML = "";
        for(var i = 0; i < n; i++){ var b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", "Depoimento " + (i + 1)); (function(k){ b.addEventListener("click", function(){ dGo(k); dRestart(); }); })(i); dDots.appendChild(b); }
      }
      [].forEach.call(dDots.children, function(b, i){ b.setAttribute("aria-selected", i === cur ? "true" : "false"); });
      dCar.querySelector('[data-dep="-1"]').disabled = false; dCar.querySelector('[data-dep="1"]').disabled = false;
    }
    dCar.querySelectorAll("[data-dep]").forEach(function(b){ b.addEventListener("click", function(){ dGo(dIdx() + (+b.getAttribute("data-dep"))); dRestart(); }); });
    var dTick = null; dTrack.addEventListener("scroll", function(){ if(dTick) return; dTick = setTimeout(function(){ dRender(); dTick = null; }, 80); }, {passive: true});
    addEventListener("resize", dRender);
    function dRestart(){ clearInterval(dTimer); if(!reduceMotion) dTimer = setInterval(function(){ if(!dPaused && !document.hidden) dGo(dIdx() + 1); }, 6500); }
    ["pointerenter", "focusin", "touchstart"].forEach(function(ev){ dCar.addEventListener(ev, function(){ dPaused = true; }, {passive: true}); });
    ["pointerleave", "focusout"].forEach(function(ev){ dCar.addEventListener(ev, function(){ dPaused = false; }); });
    dTrack.addEventListener("keydown", function(e){ if(e.key === "ArrowRight"){ e.preventDefault(); dGo(dIdx() + 1); } if(e.key === "ArrowLeft"){ e.preventDefault(); dGo(dIdx() - 1); } });
    dRender(); dRestart();
  }

  // ===== efeitos =====
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("header.site");
  // altura real do cabeçalho para barras fixas e âncoras
  // --cbh: altura do seletor de categorias quando ele fica fixo no topo da tela (celular); 0 quando é coluna lateral
  var catSideEl = document.getElementById("cat-side");
  function setHH(){
    document.documentElement.style.setProperty("--hh", header.offsetHeight + "px");
    if(catSideEl){
      var topBar = getComputedStyle(catSideEl).position === "sticky" && catSideEl.getBoundingClientRect().width > innerWidth * 0.7;
      document.documentElement.style.setProperty("--cbh", (topBar ? catSideEl.offsetHeight : 0) + "px");
    }
  }
  setHH(); addEventListener("resize", setHH);
  if(window.ResizeObserver){ var hro = new ResizeObserver(setHH); hro.observe(header); if(catSideEl) hro.observe(catSideEl); }
  var bar = document.querySelector(".progress");
  var navLinks = [].slice.call(document.querySelectorAll("nav.main a"));
  var sections = navLinks.map(function(a){ var h = a.getAttribute("href"); return h.charAt(0) === "#" && h.length > 1 ? document.querySelector(h) : null; });

  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 40);
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    var cur = -1;
    sections.forEach(function(sec, i){ if(sec && sec.getBoundingClientRect().top < innerHeight * 0.35) cur = i; });
    navLinks.forEach(function(a, i){ a.classList.toggle("active", i === cur); });
  }
  addEventListener("scroll", onScroll, {passive:true}); onScroll();

  // contadores
  function countUp(el){
    if(el.dataset.done) return; el.dataset.done = 1;
    var end = +el.dataset.count, t0 = null;
    if(reduce){ el.textContent = end; return; }
    function step(t){ if(!t0) t0 = t; var p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if(p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  // revelar ao rolar (com rede de segurança: tudo aparece mesmo sem observer)
  var revealEls = document.querySelectorAll("[data-reveal]");
  if("IntersectionObserver" in window && !reduce){
    document.documentElement.classList.add("js");
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(e.target);
      });
    }, {rootMargin:"0px 0px -8% 0px", threshold:0.08});
    revealEls.forEach(function(el){
      if(el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); else io.observe(el);
    });
    setTimeout(function(){ revealEls.forEach(function(el){ el.classList.add("in"); }); }, 4000);
  }
  var cio = "IntersectionObserver" in window ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) countUp(e.target); }); }) : null;
  document.querySelectorAll("[data-count]").forEach(function(el){ cio ? cio.observe(el) : null; });

  // spotlight que segue o cursor
  document.addEventListener("pointermove", function(e){
    var c = e.target.closest && e.target.closest(".spot"); if(!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px");
    c.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, {passive:true});

  // leve inclinação no cartão de orçamento
  var qc = document.querySelector(".qcard");
  if(qc && !reduce && matchMedia("(hover:hover)").matches){
    qc.addEventListener("pointermove", function(e){
      var r = qc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      qc.style.transform = "perspective(900px) rotateY(" + (x * 4) + "deg) rotateX(" + (-y * 4) + "deg)";
    });
    qc.addEventListener("pointerleave", function(){ qc.style.transform = ""; });
    qc.style.transition = "transform .25s ease-out";
  }

  // galeria em tela cheia
  var lb = document.getElementById("lb");
  if(lb && lb.showModal){
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("p");
    document.querySelectorAll(".gallery figure").forEach(function(f){
      f.tabIndex = 0; f.setAttribute("role", "button");
      function open(){ var im = f.querySelector("img"); lbImg.src = im.src; lbImg.alt = im.alt; lbCap.textContent = f.querySelector("figcaption").textContent; lb.showModal(); }
      f.addEventListener("click", open);
      f.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(); } });
    });
    lb.addEventListener("click", function(e){ if(e.target === lb || e.target.tagName === "BUTTON") lb.close(); });
  }
})();
