/* Google Analytics 4 só depois do consentimento de medição (barra de cookies, chave maxx-consent).
   - Sem aceite: gtag.js não é baixado e nenhum dado vai ao Google.
   - Com aceite: carrega gtag.js, configura o GA4 e repassa ao GA4 os eventos que o site já empurra no dataLayer.
   - Se a pessoa retirar o consentimento depois, o envio é desligado (ga-disable) e o gtag para de enviar.
   O GA_ID do JS principal (assets/h/) fica vazio de propósito: ele carregaria o GA4 sem esperar o aceite. */
(function(){
  var ID = "G-30QV93FJ7E";
  var EVENTOS = {generate_lead:1, clique_whatsapp:1, add_to_cart:1, ver_orcamento:1, abrir_lista:1, busca_produto:1,
                 compartilhar:1, lista_na_home:1, pedido_preparado:1, copia_email_enviada:1, repetir_pedido:1, view_item:1};
  var carregado = false, ligado = false;
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  function ligar(){
    window["ga-disable-" + ID] = false; ligado = true;
    if(carregado) return; carregado = true;
    gtag("js", new Date());
    gtag("config", ID, {allow_google_signals: false, allow_ad_personalization_signals: false});
    var s = document.createElement("script"); s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID; document.head.appendChild(s);
  }
  function desligar(){ ligado = false; window["ga-disable-" + ID] = true; }
  function aplica(a){ if(a) ligar(); else desligar(); }

  // repassa os eventos do site (dataLayer.push({event: "..."})) ao GA4; ignora os objetos que o próprio gtag() empurra
  var push0 = window.dataLayer.push;
  window.dataLayer.push = function(o){
    var r = push0.apply(this, arguments);
    try{
      if(ligado && o && typeof o === "object" && !Array.isArray(o) && typeof o.event === "string" && EVENTOS[o.event]){
        var p = {}; Object.keys(o).forEach(function(k){
          if(k === "event" || k.indexOf("gtm.") === 0) return;
          var v = o[k]; p[k] = typeof v === "string" ? v.slice(0, 100) : v;
        });
        gtag("event", o.event, p);
      }
    }catch(e){}
    return r;
  };

  try{ var c = JSON.parse(localStorage.getItem("maxx-consent") || "null"); if(c && c.v === 1 && Date.now() - c.t < 31536e6) aplica(!!c.a); else desligar(); }catch(e){ desligar(); }
  document.addEventListener("maxx:consent", function(e){ aplica(!!(e.detail && e.detail.a)); });
})();
