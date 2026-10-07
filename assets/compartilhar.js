/* Compartilhar: monta os links de compartilhamento, copia o link e registra o clique.
   Mesmo código roda no navegador (modal do catálogo e leitor do blog) e no Node (tools/compartilhar-paginas.js),
   então o HTML estático das páginas e o gerado na tela são idênticos. Sem scripts de terceiros: são links comuns. */
(function (root) {
  "use strict";
  var SITE = "https://maxxeletricasolar.com.br";
  var REDES = [
    { id: "whatsapp", nome: "WhatsApp", icone: "sh-wa" },
    { id: "facebook", nome: "Facebook", icone: "sh-fb" },
    { id: "linkedin", nome: "LinkedIn", icone: "sh-in" },
    { id: "x", nome: "X", icone: "sh-x" },
    { id: "email", nome: "E-mail", icone: "sh-mail" }
  ];
  var SPRITE = "/img/share.svg";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function enc(s) { return encodeURIComponent(s); }

  // endereço de cada rede para o link e o título informados
  function hrefs(url, titulo) {
    var t = titulo + " | MAXX Elétrica Solar";
    return {
      whatsapp: "https://wa.me/?text=" + enc(t + "\n" + url),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + enc(url),
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + enc(url),
      x: "https://twitter.com/intent/tweet?text=" + enc(t) + "&url=" + enc(url),
      email: "mailto:?subject=" + enc(t) + "&body=" + enc(t + "\n\n" + url)
    };
  }

  // variante "ic": só ícones (cabem em qualquer lugar); "txt": ícone e nome da rede
  function html(url, titulo, variante, rotulo, chamada) {
    var h = hrefs(url, titulo), txt = variante === "txt";
    var itens = REDES.map(function (r) {
      var externo = r.id !== "email" ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<li><a class="sh" data-rede="' + r.id + '" href="' + esc(h[r.id]) + '"' + externo + ' aria-label="Compartilhar no ' + r.nome + '" title="' + r.nome + '">' +
        '<svg aria-hidden="true"><use href="' + SPRITE + "#" + r.icone + '"/></svg>' + (txt ? "<span>" + r.nome + "</span>" : "") + "</a></li>";
    }).join("");
    var copiar = '<li><button type="button" class="sh" data-rede="copiar" data-copy="' + esc(url) + '" aria-label="Copiar link" title="Copiar link">' +
      '<svg aria-hidden="true"><use href="' + SPRITE + '#sh-link"/></svg>' + (txt ? "<span>Copiar link</span>" : "") + "</button></li>";
    return '<div class="share share-' + (txt ? "txt" : "ic") + '" role="group" aria-label="' + esc(rotulo || "Compartilhar") + '">' +
      '<span class="share-t">' + esc(chamada || "Compartilhar") + "</span><ul>" + itens + copiar + "</ul>" +
      '<span class="share-ok" role="status" aria-live="polite"></span></div>';
  }

  var api = { html: html, hrefs: hrefs, site: SITE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root || !root.document) return;
  root.MaxxShare = api;

  function aviso(btn, msg) {
    var box = btn.closest(".share"), ok = box && box.querySelector(".share-ok");
    if (!ok) return;
    ok.textContent = msg;
    clearTimeout(ok._t); ok._t = setTimeout(function () { ok.textContent = ""; }, 2600);
  }
  function copiarTexto(url, cb) {
    function reserva() {
      var ta = document.createElement("textarea");
      ta.value = url; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); cb(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { cb(true); }, reserva);
    else reserva();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".share .sh");
    if (!a) return;
    var rede = a.getAttribute("data-rede") || "";
    try { (root.dataLayer = root.dataLayer || []).push({ event: "compartilhar", metodo: rede, pagina: location.pathname }); } catch (err) {}
    if (rede === "copiar") {
      copiarTexto(a.getAttribute("data-copy") || location.href, function (ok) {
        aviso(a, ok ? "Link copiado." : "Não foi possível copiar. Selecione o endereço na barra do navegador.");
      });
    }
  });
})(typeof window !== "undefined" ? window : this);
