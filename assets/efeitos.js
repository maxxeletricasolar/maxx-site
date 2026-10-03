
(function(){
  if(!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* observa um "gatilho" e liga o efeito no alvo; para fotos recortadas o gatilho é o elemento pai,
     porque o recorte (clip-path) esconde o alvo do IntersectionObserver */
  var map = new Map();
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ (map.get(e.target) || []).forEach(function(t){ t.classList.add("fx-on"); }); map.delete(e.target); io.unobserve(e.target); } }); }, {rootMargin:"0px 0px -8% 0px", threshold:.05});
  function vis(el){ var r = el.getBoundingClientRect(); return r.top < innerHeight * .92 && r.bottom > 0; }
  function watch(el, trig){ trig = trig || el;
    if(vis(trig)) requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add("fx-on"); }); });
    else { if(!map.has(trig)){ map.set(trig, []); io.observe(trig); } map.get(trig).push(el); } }
  // 1) listas e grades em sequência
  ["main .cx-list","main .cg-grid",".pay ul",".foot-nav ul","main .tension","main .proof","main .cg-meta","main .rel ul","main .cg-more ul","main .groups","main .cat-tiles","main .posts","main .faq","main .cg-faq"].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(box){
      if(box.closest("dialog") || box.classList.contains("fx-st")) return;
      var kids = Array.prototype.slice.call(box.children).filter(function(k){ return k.tagName !== "H2" && k.tagName !== "SCRIPT"; });
      if(kids.length < 2) return;
      kids.forEach(function(k, i){ k.classList.add("fx-i"); k.style.setProperty("--i", Math.min(i, 14)); });
      box.classList.add("fx-st"); watch(box);
    });
  });
  // 2) linha dourada nos títulos das seções
  document.querySelectorAll("main section h2, main .sec-head h2, main .cg-intro h1, main .pp > h1").forEach(function(h){
    if(h.closest("dialog,.cx-card,.calc-card,.drawer,.hero,.cat-sec")) return;
    h.classList.add("fx-h"); watch(h);
  });
  // 3) fotos com revelação em cortina
  var wi = 0;
  document.querySelectorAll("main .hx-tile, main .gallery figure, main .qs-store, main .cx-help-img, main .capa").forEach(function(f){
    if(f.closest("dialog")) return;
    f.classList.add("fx-w"); f.style.setProperty("--i", f.classList.contains("hx-tile") ? (wi++) : 0); watch(f, f.parentElement);
  });
  // 4) parallax suave: a foto se move dentro da moldura do mosaico (a grade não se mexe)
  var tiles = document.querySelectorAll(".hx-tile img");
  if(tiles.length && matchMedia("(min-width: 961px)").matches){
    tiles.forEach(function(im){ im.classList.add("fx-px"); });
    var tick = false, sp = [0.05, -0.04, 0.06, -0.035];
    addEventListener("scroll", function(){ if(tick) return; tick = true; requestAnimationFrame(function(){
      var y = Math.min(scrollY, 700); tiles.forEach(function(t, i){ var v = Math.max(-14, Math.min(14, y * (sp[i] || 0))); t.style.translate = "0 " + v.toFixed(1) + "px"; }); tick = false; }); }, {passive:true});
  }
  // 5) onda ao tocar nos botões
  document.addEventListener("pointerdown", function(e){
    var b = e.target.closest && e.target.closest(".btn, .sx-btn, .ck-acts .btn");
    if(!b) return;
    if(getComputedStyle(b).position === "static") b.style.position = "relative";
    var w = b.querySelector(":scope > .fx-rp"); if(!w){ w = document.createElement("span"); w.className = "fx-rp"; w.setAttribute("aria-hidden", "true"); b.appendChild(w); }
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, i = document.createElement("i");
    i.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    w.appendChild(i); setTimeout(function(){ i.remove(); }, 650);
  }, {passive:true});
  // 6) contador da lista de orçamento pulsa quando muda
  document.querySelectorAll(".js-cart-count").forEach(function(c){
    new MutationObserver(function(){ c.classList.remove("fx-pop"); void c.offsetWidth; c.classList.add("fx-pop"); }).observe(c, {childList:true, characterData:true, subtree:true});
  });
})();
