(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const vista = $("#vista");

  const slug = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const leer = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const cat = CANCIONES.map((c) => Object.assign({}, c, { id: c.id || slug(c.titulo) }));
  cat.sort((a, b) => ((a.numero == null) - (b.numero == null)) || (a.numero - b.numero) || a.titulo.localeCompare(b.titulo, "es"));
  const etq = (c) => (c.numero != null ? String(c.numero).padStart(3, "0") + "- " : "") + c.titulo;
  const porId = {};
  cat.forEach((c) => (porId[c.id] = c));

  let marcas = leer("cancionero.marcas", []).filter((id) => porId[id]);
  let tam = leer("cancionero.tam", 20);
  let busqueda = "";

  const ICONO_MARCA = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  const ICONO_LUPA = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICONO_ASA = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function guardarMarcas() { guardar("cancionero.marcas", marcas); $("#contador").textContent = marcas.length || ""; }
  function alternar(id) {
    marcas = marcas.includes(id) ? marcas.filter((x) => x !== id) : marcas.concat(id);
    guardarMarcas();
  }

  /* ---------- Lista ---------- */
  function filaLista(c) {
    const on = marcas.includes(c.id);
    return `<li class="${on ? "marcada" : ""}" data-id="${esc(c.id)}">
      <a class="fila" href="#/c/${encodeURIComponent(c.id)}"><span class="t">${esc(etq(c))}</span><span class="a">${esc(c.autor)}</span></a>
      <button class="marca ${on ? "on" : ""}" aria-pressed="${on}" aria-label="Marcar ${esc(c.titulo)}">${ICONO_MARCA}</button></li>`;
  }

  function vistaLista() {
    vista.innerHTML = `<div class="barra"><h1>Corario Grupo de Varones</h1>
      <label class="buscar">${ICONO_LUPA}<input id="q" type="search" inputmode="search" autocomplete="off" placeholder="Buscar por número o título" value="${esc(busqueda)}"></label></div>
      <ul class="lista" id="ul"></ul>`;
    const ul = $("#ul");
    const pintar = () => {
      const q = norm(busqueda);
      const t = q.trim();
      const solo = /^\d+$/.test(t) ? String(Number(t)) : null;
      const r = cat.filter((c) => !t || (solo !== null && c.numero != null && String(c.numero).startsWith(solo)) || norm(c.titulo).includes(t));
      ul.innerHTML = r.length ? r.map(filaLista).join("")
        : `<li class="vacio">${cat.length ? "No hay alabanzas con esa búsqueda." : "Aún no hay alabanzas. Añade archivos en la carpeta letras."}</li>`;
    };
    pintar();
    $("#q").addEventListener("input", (e) => { busqueda = e.target.value; pintar(); });
    ul.addEventListener("click", (e) => {
      const b = e.target.closest(".marca");
      if (!b) return;
      const li = b.closest("li");
      alternar(li.dataset.id);
      const on = marcas.includes(li.dataset.id);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); li.classList.toggle("marcada", on);
    });
  }

  /* ---------- Marcas (ordenables) ---------- */
  function vistaMarcas() {
    vista.innerHTML = `<div class="barra"><h1>Marcas</h1>
      <p class="ayuda">Arrastra el icono de la izquierda para ordenar tu repertorio.</p></div>
      <ul class="lista orden" id="ul"></ul><div id="pie"></div>`;
    const ul = $("#ul");
    const pintar = () => {
      ul.innerHTML = marcas.length ? marcas.map((id) => {
        const c = porId[id];
        return `<li class="marcada" data-id="${esc(id)}"><span class="asa" aria-label="Arrastrar para ordenar">${ICONO_ASA}</span>
          <a class="fila" href="#/m/${encodeURIComponent(id)}"><span class="t">${esc(etq(c))}</span><span class="a">${esc(c.autor)}</span></a>
          <button class="quitar" aria-label="Quitar ${esc(c.titulo)}">✕</button></li>`;
      }).join("") : `<li class="vacio">Aún no hay alabanzas marcadas. En Alabanzas, toca el marcador de una alabanza para añadirla aquí.</li>`;
      $("#pie").innerHTML = marcas.length ? '<button class="vaciar" id="vaciar">Vaciar marcas</button>' : "";
    };
    pintar();

    ul.addEventListener("click", (e) => {
      const q = e.target.closest(".quitar");
      if (!q) return;
      alternar(q.closest("li").dataset.id); pintar();
    });
    $("#pie").addEventListener("click", (e) => {
      if (e.target.id === "vaciar" && confirm("¿Quitar todas las canciones de Marcas?")) { marcas = []; guardarMarcas(); pintar(); }
    });

    let arr = null;
    ul.addEventListener("pointerdown", (e) => {
      const asa = e.target.closest(".asa");
      if (!asa) return;
      e.preventDefault();
      arr = asa.closest("li");
      arr.classList.add("arrastrando");
      ul.setPointerCapture(e.pointerId);
    });
    ul.addEventListener("pointermove", (e) => {
      if (!arr) return;
      const y = e.clientY;
      const despues = [...ul.children].filter((x) => x !== arr).find((x) => {
        const r = x.getBoundingClientRect(); return y < r.top + r.height / 2;
      });
      if (despues) { if (arr.nextSibling !== despues) ul.insertBefore(arr, despues); }
      else if (ul.lastElementChild !== arr) ul.appendChild(arr);
      if (y < 90) scrollBy(0, -12); else if (y > innerHeight - 130) scrollBy(0, 12);
    });
    const fin = () => {
      if (!arr) return;
      arr.classList.remove("arrastrando"); arr = null;
      marcas = [...ul.children].map((x) => x.dataset.id).filter(Boolean);
      guardarMarcas();
    };
    ul.addEventListener("pointerup", fin);
    ul.addEventListener("pointercancel", fin);
  }

  /* ---------- Lector ---------- */
  function vistaLector(id, desdeMarcas) {
    const c = porId[id];
    if (!c) { location.hash = "#/"; return; }
    const orden = desdeMarcas ? marcas : cat.map((x) => x.id);
    const i = orden.indexOf(id);
    const ant = i > 0 ? orden[i - 1] : null;
    const sig = i >= 0 ? orden[i + 1] : null;
    const pre = desdeMarcas ? "#/m/" : "#/c/";
    const paso = (x, txt) => x ? `<a href="${pre}${encodeURIComponent(x)}">${txt}</a>` : "<span></span>";
    const on = marcas.includes(id);
    vista.innerHTML = `<div class="lector"><a class="volver" href="${desdeMarcas ? "#/marcas" : "#/"}">‹ Volver</a>
      <div class="herr"><button id="menos" aria-label="Letra más pequeña">A−</button><button id="mas" aria-label="Letra más grande">A+</button>
      <button class="marca ${on ? "on" : ""}" id="m" aria-pressed="${on}" aria-label="Marcar">${ICONO_MARCA}</button></div></div>
      <article><header class="cabeza"><h2>${esc(c.titulo)}</h2>${c.numero != null ? '<span class="num">' + String(c.numero).padStart(3, "0") + "</span>" : ""}</header>
      <p class="meta">${esc(c.autor)}${c.autor && c.tono ? "  " : ""}${c.tono ? "Tono " + esc(c.tono) : ""}</p>
      <div class="letra" id="letra" style="font-size:${tam}px"></div></article>
      <div class="pasos">${paso(ant, "‹ " + (ant ? esc(etq(porId[ant])) : ""))}${paso(sig, (sig ? esc(etq(porId[sig])) : "") + " ›")}</div>`;
    const el = $("#letra");
    let coro = false;
    String(c.letra || "").replace(/\r/g, "").trim().split("\n").forEach((l) => {
      const t = l.trim();
      const d = document.createElement("div");
      if (/^\[.+\]$/.test(t)) {
        const n = t.slice(1, -1).trim();
        if (/^estrofa/i.test(n)) return;
        coro = /^coro/i.test(n);
        d.className = "seccion"; d.textContent = n;
      } else if (!t) { coro = false; d.className = "hueco"; }
      else { d.textContent = t; if (coro) d.className = "coro"; }
      el.appendChild(d);
    });
    const cambiar = (d) => { tam = Math.max(14, Math.min(44, tam + d)); el.style.fontSize = tam + "px"; guardar("cancionero.tam", tam); };
    $("#menos").onclick = () => cambiar(-2);
    $("#mas").onclick = () => cambiar(2);
    $("#m").onclick = (e) => {
      alternar(id);
      const o = marcas.includes(id);
      e.currentTarget.classList.toggle("on", o); e.currentTarget.setAttribute("aria-pressed", o);
    };
  }

  /* ---------- Rutas ---------- */
  function ruta() {
    const h = location.hash || "#/";
    const m = h.match(/^#\/([cm])\/(.+)$/);
    let enMarcas = h === "#/marcas";
    if (m) { enMarcas = m[1] === "m"; vistaLector(decodeURIComponent(m[2]), enMarcas); }
    else if (enMarcas) vistaMarcas();
    else vistaLista();
    $("#tab-lista").classList.toggle("activa", !enMarcas);
    $("#tab-marcas").classList.toggle("activa", enMarcas);
    window.scrollTo(0, 0);
  }
  addEventListener("hashchange", ruta);
  guardarMarcas();
  ruta();
})();
