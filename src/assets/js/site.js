/* Liga PuraSport — comportamiento del sitio (sin dependencias).
   Configuración en assets/config.js (generado desde site.config.json). */
(function () {
  "use strict";
  var CFG = window.LIGA_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function (ev, params, custom) {
    if (typeof window.fbq !== "function") return;
    custom ? window.fbq("trackCustom", ev, params || {}) : window.fbq("track", ev, params || {});
  };
  var store = {
    set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    get: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
  };

  /* ---------- Categoría por año de nacimiento ---------- */
  function categoriaPorAnio(anio) {
    anio = parseInt(anio, 10);
    if (!anio) return null;
    var cats = CFG.categorias || [];
    for (var i = 0; i < cats.length; i++) {
      if (anio >= cats[i].anios[0] && anio <= cats[i].anios[1]) return { cat: cats[i] };
    }
    var minY = Math.min.apply(null, cats.map(function (c) { return c.anios[0]; }));
    return anio < minY ? { mayor: true } : { menor: true };
  }
  function textoCategoria(anio) {
    var r = categoriaPorAnio(anio);
    if (!r) return "";
    if (r.cat) return "Juega en <b class=\"text-brand\">PuraSport " + r.cat.nombre + "</b> (" + r.cat.anios[0] + "–" + r.cat.anios[1] + ").";
    if (r.menor) return "Todavía es muy pequeño para esta temporada. Pre-inscríbelo y te avisamos para 2027.";
    return "Esta temporada la Liga llega hasta nacidos en 2013. Pre-inscríbelo y te contamos las opciones.";
  }

  // Calculadora de la sección Categorías
  var calc = $("[data-calc]");
  if (calc) calc.addEventListener("change", function () {
    $("[data-calc-out]").innerHTML = textoCategoria(calc.value);
    var r = categoriaPorAnio(calc.value);
    $$(".cat-card").forEach(function (c) { c.classList.toggle("is-match", !!(r && r.cat && c.dataset.cat === r.cat.id)); });
    track("CalculoCategoria", { anio: calc.value }, true);
  });

  /* ---------- Selección de tipo de registro ---------- */
  function elegirRol(rol, enfocar) {
    $$("[data-role-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.roleBtn === rol)); });
    $$(".liga-form").forEach(function (f) { f.classList.toggle("hidden", f.dataset.role !== rol); });
    var f = $('.liga-form[data-role="' + rol + '"]');
    if (f && enfocar) { var first = f.querySelector("input:not([type=hidden]):not([name=bot-field]), select"); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350); }
    track("EligeTipoRegistro", { tipo: rol }, true);
  }
  $$("[data-role-btn]").forEach(function (b) { b.addEventListener("click", function () { elegirRol(b.dataset.roleBtn, true); }); });
  $$("[data-role-link]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var f = $('.liga-form[data-role="' + a.dataset.roleLink + '"]');
      if (!f) return; // en otras páginas el enlace lleva al inicio
      e.preventDefault();
      elegirRol(a.dataset.roleLink, false);
      setTimeout(function () { f.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    });
  });
  var hashRol = (location.hash.match(/rol=(entrenador|familia|arbitro)/) || [])[1];
  if (hashRol) elegirRol(hashRol, false);

  /* ---------- Hijos: filas fijas que se muestran una a una ---------- */
  var addHijo = $("[data-add-hijo]");
  if (addHijo) addHijo.addEventListener("click", function () {
    var next = $$(".hijo-row.hidden")[0];
    if (!next) return;
    next.classList.remove("hidden"); next.classList.add("grid");
    next.querySelector("select").focus();
    if (!$$(".hijo-row.hidden").length) addHijo.classList.add("hidden");
  });
  $$("[data-anio]").forEach(function (sel) {
    sel.addEventListener("change", function () {
      var row = sel.closest(".hijo-row");
      row.querySelector("[data-cat-out]").innerHTML = textoCategoria(sel.value) || "Elige el año para ver su categoría.";
      var sexo = row.querySelector('select[name$="_sexo"]');
      if (sexo) sexo.required = !!sel.value;
    });
  });
  $$("[data-toggle-equipo]").forEach(function (r) {
    r.addEventListener("change", function () {
      var field = r.form.querySelector("[data-equipo-field]");
      var si = r.value.indexOf("Sí") === 0 && r.checked;
      field.classList.toggle("hidden", !si);
      field.querySelector("input").required = si;
    });
  });

  /* ---------- UTM de los anuncios ---------- */
  var qs = new URLSearchParams(location.search);
  ["utm_source", "utm_campaign", "utm_content"].forEach(function (k) {
    var v = qs.get(k) || (store.get("utm") || {})[k];
    if (v) $$('input[name="' + k + '"]').forEach(function (i) { i.value = v; });
  });
  if (qs.get("utm_source")) store.set("utm", { utm_source: qs.get("utm_source"), utm_campaign: qs.get("utm_campaign"), utm_content: qs.get("utm_content") });

  /* ---------- Envío ---------- */
  function validar(form) {
    var ok = true, primero = null;
    $$("[data-min-check]", form).forEach(function (g) {
      var name = g.dataset.minCheck, marcado = $$('input[name="' + name + '"]:checked', form).length > 0;
      var err = form.querySelector('[data-error="' + name + '"]');
      if (err) err.classList.toggle("hidden", marcado);
      if (!marcado) { ok = false; primero = primero || g; }
    });
    var tel = form.querySelector('input[name="whatsapp"]');
    if (tel) tel.setCustomValidity(tel.value.replace(/\D/g, "").length >= 8 ? "" : "Escribe un número de WhatsApp válido (8 dígitos o más).");
    $$("input, select", form).forEach(function (el) {
      if (!el.checkValidity()) { ok = false; primero = primero || el; }
    });
    if (primero) { primero.scrollIntoView({ behavior: "smooth", block: "center" }); if (primero.reportValidity) primero.reportValidity(); }
    return ok;
  }

  $$(".liga-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errBox = form.querySelector("[data-form-error]");
      errBox.classList.add("hidden");
      if (!validar(form)) return;

      // Resumen de categorías (familias) para el equipo de la Liga
      var cats = [];
      $$("[data-anio]", form).forEach(function (s) {
        var r = categoriaPorAnio(s.value);
        var sexo = (s.closest(".hijo-row").querySelector('select[name$="_sexo"]') || {}).value || "";
        if (r) cats.push(s.value + " " + sexo + " → " + (r.cat ? r.cat.nombre : (r.menor ? "menor" : "mayor")));
      });
      var calcField = form.querySelector('input[name="categorias_calculadas"]');
      if (calcField) calcField.value = cats.join(" | ");

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = "Enviando…";
      var data = new URLSearchParams(new FormData(form)).toString();
      var endpoint = CFG.formEndpoint || "/";

      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          var tipo = form.dataset.role;
          track("Lead", { content_name: form.getAttribute("name"), content_category: tipo });
          store.set("preinscripcion", { tipo: tipo, nombre: (form.nombre && form.nombre.value) || "", equipo: (form.equipo && form.equipo.value) || "", categorias: cats });
          var root = (document.querySelector('meta[name="liga-root"]') || {}).content || "./";
          location.href = root + "gracias/?tipo=" + tipo;
        })
        .catch(function () {
          errBox.textContent = "No pudimos enviar el formulario. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.";
          errBox.classList.remove("hidden");
          btn.disabled = false; btn.textContent = "Enviar pre-inscripción";
        });
    });
  });

  /* ---------- Clics a WhatsApp ---------- */
  $$('a[href*="wa.me"]').forEach(function (a) { a.addEventListener("click", function () { track("Contact", { method: "whatsapp", lugar: a.dataset.track || "" }); }); });

  /* ---------- Cuenta regresiva ---------- */
  var cd = $("[data-countdown]");
  if (cd && CFG.temporadaInicio) {
    var target = new Date(CFG.temporadaInicio).getTime();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      $('[data-cd="d"]', cd).textContent = Math.floor(s / 86400);
      $('[data-cd="h"]', cd).textContent = pad(Math.floor(s % 86400 / 3600));
      $('[data-cd="m"]', cd).textContent = pad(Math.floor(s % 3600 / 60));
      $('[data-cd="s"]', cd).textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Menú en celular ---------- */
  var mBtn = $("[data-menu-toggle]"), mPanel = $("[data-menu-panel]");
  function menu(abrir) {
    if (!mBtn || !mPanel) return;
    mPanel.classList.toggle("hidden", !abrir);
    mBtn.setAttribute("aria-expanded", String(abrir));
    mBtn.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    $("[data-icon-open]", mBtn).classList.toggle("hidden", abrir);
    $("[data-icon-close]", mBtn).classList.toggle("hidden", !abrir);
    document.body.classList.toggle("menu-abierto", abrir);
  }
  if (mBtn) {
    mBtn.addEventListener("click", function () { menu(mBtn.getAttribute("aria-expanded") !== "true"); });
    $$("[data-menu-link]").forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") menu(false); });
    window.matchMedia("(min-width: 768px)").addEventListener("change", function (m) { if (m.matches) menu(false); });
  }

  /* ---------- Aviso de cookies ---------- */
  var aviso = $("#aviso-cookies");
  if (aviso) {
    var visto = false;
    try { visto = localStorage.getItem("liga_cookies_ok") === "1"; } catch (e) {}
    if (!visto) aviso.classList.remove("hidden");
    $("[data-cookie-ok]", aviso).addEventListener("click", function () {
      aviso.classList.add("hidden");
      try { localStorage.setItem("liga_cookies_ok", "1"); } catch (e) {}
    });
  }

  window.LigaPuraSport = { categoriaPorAnio: categoriaPorAnio, store: store };
})();
