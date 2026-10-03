/* Busca rápida MAXX (estilo Spotlight): botão no cabeçalho, atalho "/" ou Ctrl+K */
(function(){
  var S = document.currentScript, BASE = (S && S.getAttribute("data-base")) || "",
      MODE = (S && S.getAttribute("data-mode")) || "preview"; // "site" = páginas próprias de produto/categoria
  var DATA = null, loading = null;
  function load(){ if(DATA) return Promise.resolve(DATA); if(loading) return loading;
    loading = fetch(BASE + "assets/busca.json").then(function(r){ return r.json(); }).then(function(d){ DATA = d; return d; }).catch(function(){ loading = null; return {c:[],p:[]}; });
    return loading; }
  function norm(s){ return (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9.,/ ]+/g," ").replace(/\s+/g," ").trim(); }
  function prodUrl(p){ return MODE === "site" ? BASE + "produtos/" + p.i + ".html" : BASE + "produtos.html#p-" + p.i; }
  function catUrl(c){ return MODE === "site" ? BASE + "categorias/" + c.s + ".html" : BASE + "produtos.html#" + c.s; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]; }); }
  function hl(txt, toks){ var out = esc(txt); toks.forEach(function(t){ if(t.length < 2) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")", "ig");
      // destaca ignorando acentos de forma simples: só quando o texto contém o termo literal
      out = out.replace(re, "<mark>$1</mark>"); }); return out; }
  function search(q){
    var toks = norm(q).split(" ").filter(Boolean); if(!toks.length || !DATA) return {c:[],p:[],toks:toks};
    function score(hay, name){ var s = 0; for(var i=0;i<toks.length;i++){ var t = toks[i], k = hay.indexOf(t); if(k < 0) return -1;
        s += (name.indexOf(t) === 0 ? 30 : 0) + (name.indexOf(" " + t) >= 0 || name.indexOf(t) === 0 ? 12 : 0) + (name.indexOf(t) >= 0 ? 8 : 2); } return s; }
    var c = DATA.c.map(function(x){ return [score(x.k, x.kn), x]; }).filter(function(a){ return a[0] >= 0; }).sort(function(a,b){ return b[0]-a[0]; }).slice(0,4).map(function(a){ return a[1]; });
    var p = DATA.p.map(function(x){ return [score(x.k, x.kn), x]; }).filter(function(a){ return a[0] >= 0; }).sort(function(a,b){ return b[0]-a[0] || a[1].n.length-b[1].n.length; }).slice(0,8).map(function(a){ return a[1]; });
    return {c:c, p:p, toks:toks};
  }
  var css = '.sx-btn{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:10px;border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;flex:none}'+
  '.sx-btn svg{width:20px;height:20px}.sx-btn:hover{border-color:var(--gold)}'+
  '.sx-dlg{border:0;padding:0;background:transparent;width:min(680px,94vw);max-height:none;margin:10vh auto auto;overflow:visible}'+
  '.sx-dlg::backdrop{background:rgba(8,12,18,.55);backdrop-filter:blur(4px)}'+
  '.sx-box{background:var(--surface,#fff);color:var(--text,#111);border:1px solid var(--line,#ddd);border-radius:16px;box-shadow:0 40px 100px -30px rgba(0,0,0,.6);overflow:hidden}'+
  '.sx-in{display:flex;align-items:center;gap:10px;padding:6px 14px;border-bottom:1px solid var(--line,#ddd)}'+
  '.sx-in svg{width:20px;height:20px;opacity:.6;flex:none}'+
  '.sx-in input{flex:1;min-width:0;border:0;background:transparent;color:inherit;font:500 1.0625rem/1.4 var(--f-body,system-ui);padding:14px 0;outline:none}'+
  '.sx-in kbd,.sx-x{font:600 .6875rem/1 var(--f-mono,monospace);border:1px solid var(--line,#ddd);border-radius:6px;padding:5px 7px;color:var(--muted,#666);background:transparent;cursor:pointer}'+
  '.sx-res{max-height:min(60vh,520px);overflow:auto;padding:6px 6px 10px}'+
  '.sx-h{font:600 .6875rem/1 var(--f-mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#666);padding:12px 12px 6px}'+
  '.sx-res a{display:flex;align-items:center;gap:12px;min-height:48px;padding:8px 12px;border-radius:10px;color:inherit;text-decoration:none}'+
  '.sx-res a[aria-selected="true"],.sx-res a:hover{background:var(--surface-2,#f1f3f6)}'+
  '.sx-res a b{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:var(--surface-2,#f1f3f6);color:var(--gold,#b8892a);font:700 .75rem/1 var(--f-body,system-ui)}'+
  '.sx-res a span{flex:1;min-width:0}.sx-res a strong{display:block;font-weight:500;font-size:.9375rem;line-height:1.3}'+
  '.sx-res a small{display:block;color:var(--muted,#666);font-size:.75rem;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.sx-res mark{background:rgba(216,173,70,.35);color:inherit;border-radius:3px;padding:0 1px}'+
  '.sx-empty{padding:18px 14px;color:var(--muted,#666);font-size:.9375rem}.sx-empty a{display:inline;min-height:0;padding:0;color:var(--gold,#b8892a);text-decoration:underline}'+
  '.sx-foot{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid var(--line,#ddd);font-size:.75rem;color:var(--muted,#666)}'+
  '.sx-foot a{color:inherit}'+
  '.sx-bar{display:none}'+
  '@media (max-width:640px){header.site .sx-btn{display:none}.sx-bar{display:flex;align-items:center;gap:10px;width:calc(100% - 32px);margin:12px 16px 0;min-height:46px;padding:0 14px;border-radius:12px;border:1px solid var(--line,#ddd);background:var(--surface,#fff);color:var(--muted,#666);font:500 .9375rem/1 var(--f-body,system-ui);text-align:left;cursor:pointer}.sx-bar svg{width:18px;height:18px;flex:none}'+
  '.sx-dlg{margin:0;width:100vw;max-width:100vw;height:100%;max-height:100%}.sx-box{border-radius:0;height:100%;display:flex;flex-direction:column}.sx-res{max-height:none;flex:1}.sx-in kbd{display:none}.sx-foot .sx-k{display:none}}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var dlg = document.createElement("dialog"); dlg.className = "sx-dlg"; dlg.setAttribute("aria-label", "Buscar produtos");
  dlg.innerHTML = '<div class="sx-box"><div class="sx-in">' + ICON + '<input type="search" id="sx-q" placeholder="Buscar produto, referência ou categoria" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="sx-res" aria-autocomplete="list"><kbd>Esc</kbd><button type="button" class="sx-x" aria-label="Fechar busca">Fechar</button></div>'+
    '<div class="sx-res" id="sx-res" role="listbox"></div><div class="sx-foot"><span class="sx-k">↑ ↓ para navegar · Enter para abrir</span><a href="' + BASE + 'produtos.html">Ver catálogo completo</a></div></div>';
  document.body.appendChild(dlg);
  var inp = dlg.querySelector("#sx-q"), res = dlg.querySelector("#sx-res"), sel = -1, timer = null;
  var SUG = ["vara de manobra", "aterramento temporário", "condulete", "cabo de alumínio", "luva isolante", "para-raios", "detector de tensão", "eletrocalha"];
  function render(){
    var q = inp.value.trim();
    if(!q){ res.innerHTML = '<p class="sx-h">Buscas comuns</p>' + SUG.map(function(s){ return '<a href="#" data-sug="' + s + '" role="option"><b>' + ICON + '</b><span><strong>' + s + '</strong></span></a>'; }).join(""); sel = -1; return; }
    var r = search(q), h = "";
    if(r.c.length) h += '<p class="sx-h">Categorias</p>' + r.c.map(function(c){ return '<a href="' + catUrl(c) + '" role="option"><b>' + esc(c.b) + '</b><span><strong>' + hl(c.n, r.toks) + '</strong><small>' + c.q + (c.q === 1 ? " produto" : " produtos") + '</small></span></a>'; }).join("");
    if(r.p.length) h += '<p class="sx-h">Produtos</p>' + r.p.map(function(p){ return '<a href="' + prodUrl(p) + '" role="option"><b>' + esc(p.b) + '</b><span><strong>' + hl(p.n, r.toks) + '</strong><small>' + esc(p.g) + (p.r ? " · " + hl(p.r, r.toks) : "") + '</small></span></a>'; }).join("");
    if(!h) h = '<p class="sx-empty">Nada encontrado para "<b>' + esc(q) + '</b>". Temos mais de 2.300 referências: <a href="https://wa.me/5586994540900?text=' + encodeURIComponent("Olá, equipe MAXX! Procuro: " + q) + '" target="_blank" rel="noopener">pergunte à equipe no WhatsApp</a>.</p>';
    res.innerHTML = h; sel = -1;
    clearTimeout(timer); timer = setTimeout(function(){ try{ (window.dataLayer = window.dataLayer || []).push({event:"busca_produto", termo:q, resultados:r.p.length + r.c.length, origem:"busca_rapida"}); }catch(e){} }, 900);
  }
  function items(){ return res.querySelectorAll("a[role=option]"); }
  function move(d){ var it = items(); if(!it.length) return; sel = (sel + d + it.length) % it.length; it.forEach(function(a,i){ a.setAttribute("aria-selected", i === sel ? "true" : "false"); }); it[sel].scrollIntoView({block:"nearest"}); }
  function open(){ load().then(render); if(!dlg.open) dlg.showModal(); inp.focus(); inp.select(); render(); }
  inp.addEventListener("input", function(){ load().then(render); });
  inp.addEventListener("keydown", function(e){
    if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
    else if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
    else if(e.key === "Enter"){ var it = items(); if(sel < 0 && it.length) sel = 0; if(it[sel]){ e.preventDefault(); it[sel].click(); } }
  });
  res.addEventListener("click", function(e){ var a = e.target.closest("a[data-sug]"); if(a){ e.preventDefault(); inp.value = a.getAttribute("data-sug"); load().then(render); inp.focus(); return; }
    var l = e.target.closest("a[role=option]"); if(l && l.getAttribute("href").indexOf("#") > -1 && l.pathname === location.pathname){ dlg.close(); } });
  dlg.querySelector(".sx-x").addEventListener("click", function(){ dlg.close(); });
  dlg.addEventListener("click", function(e){ if(e.target === dlg) dlg.close(); });
  document.addEventListener("keydown", function(e){
    var t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)){ e.preventDefault(); open(); }
    else if(e.key === "/" && !typing){ e.preventDefault(); open(); }
  });
  // botão no cabeçalho, antes do botão de orçamento
  function addBtn(){
    var w = document.querySelector("header.site .wrap"); if(!w || w.querySelector(".sx-btn")) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "sx-btn"; b.setAttribute("aria-label", "Buscar produtos (atalho /)"); b.title = "Buscar produtos ( / )"; b.innerHTML = ICON;
    b.addEventListener("click", open);
    var ref = w.querySelector(".theme-tg") || w.querySelector(".btn-gold") || null; w.insertBefore(b, ref);
  }
  addBtn();
  (function(){ var h = document.querySelector("header.site"); if(!h || document.querySelector(".sx-bar")) return;
    var bar = document.createElement("button"); bar.type = "button"; bar.className = "sx-bar"; bar.setAttribute("aria-label", "Buscar produtos");
    bar.innerHTML = ICON + "<span>Buscar produto, referência ou categoria</span>"; bar.addEventListener("click", open);
    var main = document.querySelector("main"); if(main) main.insertBefore(bar, main.firstChild); else h.parentNode.insertBefore(bar, h.nextSibling); })();
  document.querySelectorAll("[data-open-search]").forEach(function(el){ el.addEventListener("click", function(e){ e.preventDefault(); open(); }); });
  // catálogo: ?q= preenche a busca da página
  var q0 = new URLSearchParams(location.search).get("q"), cq = document.getElementById("cat-q");
  if(q0 && cq){ cq.value = q0; cq.dispatchEvent(new Event("input", {bubbles:true})); }
  window.maxxBusca = open;
})();
