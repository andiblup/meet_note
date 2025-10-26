
// /* peers-select.js – Basecoat-konforme Populate-Logik für das "Connections"-Select.
//    - nutzt eine bestehende Basecoat-Option als Vorlage (cloneNode) -> garantiert Hover/Focus/Keyboard
//    - lädt /api/peers (Cache) + hört auf 'peers-updated' (Socket.IO)
//    - Header: Suchfeld + "Aktualisieren" mit 30s Cooldown (HTTP 429)
//    - Klick auf andere IP -> Redirect (http://<ip>:<port>)
// */

// (function () {
//   const $ = (s, r = document) => r.querySelector(s);
//   const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
//   const fmt = ts => ts ? new Date(ts).toLocaleTimeString() : '–';

//   // -------- die gewünschte Select-Instanz anhand der Überschrift "Connections" finden
//   function findConnectionsSelect() {
//     for (const wrap of $$('.select')) {
//       const heading = $('[role="listbox"] [role="heading"]', wrap);
//       if (heading && /connections/i.test(heading.textContent.trim())) return wrap;
//     }
//     return null;
//   }
//   const root = findConnectionsSelect();
//   if (!root) { console.warn('[peers-select] Keine "Connections"-Select gefunden.'); return; }

//   // Grund-Refs innerhalb der Komponente
//   const trigger = $('[aria-controls$="listbox"]', root);
//   const popover = $('[data-popover]', root);
//   const listbox = $('[role="listbox"]', root);
//   const current = $('#select-445592-current', root) || $('[role="option"][aria-selected="true"]', listbox);
//   const anchor = $('#select-445592-dynamic-anchor', root) || $('[aria-hidden="true"][style*="height:0"]', listbox);
//   const hidden = $('input[type="hidden"]', root);
//   const labelEl = $('#select-445592-label', root) || $('.truncate', trigger);
//   const group = $('[role="group"]', listbox);

//   if (!trigger || !popover || !listbox || !current || !anchor || !hidden || !labelEl || !group) {
//     console.warn('[peers-select] Unvollständiges Markup – bitte IDs/Struktur prüfen.');
//     return;
//   }

//   // --- Header: Search + Refresh (Button wie im Beispiel-Select)
//   const headerEl = $('header', popover) || (() => {
//     const h = document.createElement('header'); popover.prepend(h); return h;
//   })();

//   // Suchfeld (re-use falls vorhanden)
//   let searchInput = $('input[type="text"]', headerEl);
//   if (!searchInput) {
//     searchInput = document.createElement('input');
//     searchInput.type = 'text';
//     searchInput.placeholder = 'Search entries...';
//     searchInput.autocomplete = 'off';
//     searchInput.spellcheck = false;
//     headerEl.appendChild(searchInput);
//   } else {
//     searchInput.disabled = false;
//     searchInput.placeholder = 'Search entries...';
//   }

//   // Refresh-Button rechts daneben (Basecoat-Button-Stil)
//   let refreshBtn = $('#peers-refresh-btn', headerEl);
//   if (!refreshBtn) {
//     refreshBtn = document.createElement('button');
//     refreshBtn.id = 'peers-refresh-btn';
//     refreshBtn.type = 'button';
//     refreshBtn.className = 'btn-outline';
//     refreshBtn.style.marginLeft = '8px';
//     refreshBtn.textContent = 'Aktualisieren';
//     headerEl.appendChild(refreshBtn);
//   }

//   // --- Hilfsfunktionen
//   function enableBasecoatHover(optionEl, listboxEl) {
//     optionEl.addEventListener('mouseenter', () => {
//       // zuerst alle anderen deaktivieren
//       listboxEl.querySelectorAll('.active').forEach(o => o.classList.remove('active'));
//       optionEl.classList.add('active');
//     });
//     optionEl.addEventListener('mouseleave', () => {
//       optionEl.classList.remove('active');
//     });
//   }

//   function currentValue() {
//     if (hidden.value) return hidden.value;
//     const host = location.host; // "ip:port" oder "host:port"
//     return host.includes(':') ? host : `${host}:${location.port || 80}`;
//   }
//   function setCurrent(val) {
//     // Text + Daten in "current" + Label + Hidden
//     current.dataset.value = val || '';
//     current.setAttribute('data-value', val || '');
//     current.textContent = val || '—';
//     current.setAttribute('aria-selected', 'true');
//     labelEl.textContent = val || '—';
//     hidden.value = val || '';
//   }

//   // Vorlage für Optionen besorgen:
//   // wir nehmen eine existierende Basecoat-Option aus *einem anderen* Dropdown,
//   // wenn verfügbar; sonst klonen wir "current" und passen Attribute an.
//   function getOptionTemplate() {
//     // suche eine beliebige Option aus demselben Select (falls vorhanden)
//     const other = $$('[role="option"]', listbox).find(el => el !== current && !el.hasAttribute('aria-disabled'));
//     if (other) return other;
//     // Fallback: current klonen (aber aria-selected/reset)
//     const clone = current.cloneNode(true);
//     clone.removeAttribute('id');
//     clone.setAttribute('aria-selected', 'false');
//     return clone;
//   }
//   const optionTemplate = getOptionTemplate();

//   // dynamische Einträge entfernen
//   function clearDynamic() {
//     $$('#select-445592-listbox [data-dynamic="1"]', root).forEach(n => n.remove());
//   }

//   // Basecoat-konforme Option erzeugen (per cloneNode)
//   let autoIdCounter = 1;
//   function appendOption(ip, port, healthy) {
//     const val = `${ip}:${port}`;
//     if (val === currentValue()) return; // aktuelle steht oben separat
//     if ($(`[role="option"][data-value="${CSS.escape(val)}"]`, listbox)) return;

//     const el = optionTemplate.cloneNode(true);
//     el.id = el.id || `select-445592-items-1-${autoIdCounter++}`;
//     el.setAttribute('role', 'option');
//     el.setAttribute('data-value', val);
//     el.setAttribute('aria-selected', 'false');
//     el.setAttribute('data-dynamic', '1');
//     el.removeAttribute('aria-disabled');
//     // Label-Inhalt: nur Text setzen (Basecoat styled hover via :hover)
//     el.textContent = val + (healthy ? '' : ''); // Status-Badge optional weglassen für puren Basecoat-Look

//     // Klick -> Redirect wenn anderes Target
//     el.onclick = () => {
//       if (val === currentValue()) return;
//       const target = /^https?:\/\//i.test(val) ? val : `http://${val}`;
//       window.location.href = target;
//     };

//     // einfügen direkt vor dem Anchor (unter "current")
//     anchor.insertAdjacentElement('beforebegin', el);
//     enableBasecoatHover(el, listbox);
//   }

//   function renderPeers(peers) {
//     clearDynamic();
//     if (!Array.isArray(peers) || !peers.length) {
//       // Infozeile (deaktiviert)
//       const info = optionTemplate.cloneNode(true);
//       // info.removeAttribute('id');
//       info.setAttribute('role', 'option');
//       info.setAttribute('aria-disabled', 'true');
//       info.setAttribute('data-dynamic', '1');
//       info.setAttribute('data-value', '__info');
//       info.textContent = 'Keine Verbindungen gefunden';
//       info.onclick = null;
//       anchor.insertAdjacentElement('beforebegin', info);
//       return;
//     }
//     peers.forEach(p => appendOption(p.ip, p.port, !!p.healthy));
//   }

//   function applyFilter(query) {
//     const q = (query || '').trim().toLowerCase();
//     $$('#select-445592-listbox [role="option"][data-value]', root).forEach(opt => {
//       if (opt === current) return;
//       const val = (opt.dataset.value || '').toLowerCase();
//       opt.style.display = !q || val.includes(q) ? '' : 'none';
//     });
//   }

//   // --- Cooldown/Button
//   let cooldownTimer = null;
//   function setButtonCountdown(ms) {
//     if (cooldownTimer) { clearTimeout(cooldownTimer); cooldownTimer = null; }
//     if (!ms || ms <= 0) { refreshBtn.disabled = false; refreshBtn.textContent = 'Aktualisieren'; return; }
//     refreshBtn.disabled = true;
//     const end = Date.now() + ms;
//     const tick = () => {
//       const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
//       refreshBtn.textContent = left ? `Aktualisieren (${left})` : 'Aktualisieren';
//       if (left > 0) cooldownTimer = setTimeout(tick, 500);
//       else { refreshBtn.disabled = false; refreshBtn.textContent = 'Aktualisieren'; }
//     };
//     tick();
//   }

//   // --- Netzwerk (REST + Socket.IO)
//   const ioClient = window.io ? window.io() : null;
//   let allPeers = [];
//   let updatedAt = 0;
//   let nextAllowedAt = 0;

//   async function loadOnce() {
//     try {
//       const r = await fetch('/api/peers');
//       const j = await r.json();
//       allPeers = j.peers || [];
//       updatedAt = j.updatedAt || Date.now();
//       nextAllowedAt = j.nextAllowedAt || (Date.now() + 30000);

//       setCurrent(currentValue());
//       renderPeers(allPeers);
//       setButtonCountdown(Math.max(0, nextAllowedAt - Date.now()));
//       applyFilter(searchInput.value);
//     } catch (e) {
//       console.warn('[peers-select] /api/peers fehlgeschlagen:', e);
//       setCurrent(currentValue());
//     }
//   }

//   async function doRefresh() {
//     try {
//       const r = await fetch('/api/peers/refresh', { method: 'POST' });
//       if (r.status === 429) {
//         const j = await r.json();
//         setButtonCountdown(Number(j.retryIn || 0));
//         return;
//       }
//       const j = await r.json();
//       allPeers = j.peers || [];
//       updatedAt = j.updatedAt || Date.now();
//       nextAllowedAt = j.nextAllowedAt || (Date.now() + 30000);
//       renderPeers(allPeers);
//       setButtonCountdown(Math.max(0, nextAllowedAt - Date.now()));
//       applyFilter(searchInput.value);
//     } catch (e) {
//       console.warn('[peers-select] Refresh fehlgeschlagen:', e);
//     }
//   }

//   if (ioClient) {
//     ioClient.on('peers-updated', ({ peers, updatedAt: ts }) => {
//       if (cooldownTimer) { clearTimeout(cooldownTimer); cooldownTimer = null; }
//       allPeers = peers || [];
//       updatedAt = ts || Date.now();
//       nextAllowedAt = Date.now() + 30000; // konservativ
//       renderPeers(allPeers);
//       setButtonCountdown(Math.max(0, nextAllowedAt - Date.now()));
//       applyFilter(searchInput.value);
//     });
//     ioClient.on('peers-cooldown', ({ retryIn, nextAllowedAt: na }) => {
//       setButtonCountdown(Number(retryIn || 0));
//       nextAllowedAt = na || (Date.now() + Number(retryIn || 0));
//     });
//   }

//   // Events
//   searchInput.addEventListener('input', () => applyFilter(searchInput.value));
//   refreshBtn.addEventListener('click', doRefresh);

//   // Initial: aktuelle Verbindung setzen + einmalig laden
//   setCurrent(currentValue());
//   loadOnce();
// })();

//! ///////////////////////////////////

/* peers-select.js – Basecoat-konforme Populate-Logik für das "Connections"-Select.
   - KEIN Autoscan mehr (nur manuell)
   - Button zeigt Countdown NUR bei 429 (Cooldown). Nach erfolgreichem Scan wieder "Aktualisieren".
   - nutzt Basecoat-Optionen (cloneNode) -> Hover/Focus wie im anderen Dropdown
*/

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = ts => ts ? new Date(ts).toLocaleTimeString() : '–';

  // -------- Select-Instanz "Connections" finden
  function findConnectionsSelect() {
    for (const wrap of $$('.select')) {
      const heading = $('[role="listbox"] [role="heading"]', wrap);
      if (heading && /connections/i.test(heading.textContent.trim())) return wrap;
    }
    return null;
  }
  const root = findConnectionsSelect();
  if (!root) { console.warn('[peers-select] Keine "Connections"-Select gefunden.'); return; }

  const trigger = $('[aria-controls$="listbox"]', root);
  const popover = $('[data-popover]', root);
  const listbox = $('[role="listbox"]', root);
  const current = $('#select-445592-current', root) || $('[role="option"][aria-selected="true"]', listbox);
  const anchor = $('#select-445592-dynamic-anchor', root) || $('[aria-hidden="true"][style*="height:0"]', listbox);
  const hidden = $('input[type="hidden"]', root);
  const labelEl = $('#select-445592-label', root) || $('.truncate', trigger);
  const group = $('[role="group"]', listbox);
  if (!trigger || !popover || !listbox || !current || !anchor || !hidden || !labelEl || !group) {
    console.warn('[peers-select] Unvollständiges Markup.');
    return;
  }

  // --- Header: Suchfeld + Refresh
  const headerEl = $('header', popover) || (() => {
    const h = document.createElement('header'); popover.prepend(h); return h;
  })();
  let searchInput = $('input[type="text"]', headerEl);
  if (!searchInput) {
    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search entries...';
    searchInput.autocomplete = 'off';
    searchInput.spellcheck = false;
    headerEl.appendChild(searchInput);
  } else {
    searchInput.disabled = false;
    searchInput.placeholder = 'Search entries...';
  }
  let refreshBtn = $('#peers-refresh-btn', headerEl);
  if (!refreshBtn) {
    refreshBtn = document.createElement('button');
    refreshBtn.id = 'peers-refresh-btn';
    refreshBtn.type = 'button';
    refreshBtn.className = 'btn-outline';
    refreshBtn.style.marginLeft = '8px';
    refreshBtn.textContent = 'Aktualisieren';
    headerEl.appendChild(refreshBtn);
  }

  // --- Hover wie Basecoat (klasse "active")
  function enableBasecoatHover(optionEl, listboxEl) {
    optionEl.addEventListener('mouseenter', () => {
      listboxEl.querySelectorAll('.active').forEach(o => o.classList.remove('active'));
      optionEl.classList.add('active');
    });
    optionEl.addEventListener('mouseleave', () => {
      optionEl.classList.remove('active');
    });
  }

  // --- aktueller Wert
  function currentValue() {
    if (hidden.value) return hidden.value;
    const host = location.host; // "ip:port" oder "host:port"
    return host.includes(':') ? host : `${host}:${location.port || 80}`;
  }
  function setCurrent(val) {
    current.setAttribute('data-value', val || '');
    current.textContent = val || '—';
    current.setAttribute('aria-selected', 'true');
    labelEl.textContent = val || '—';
    hidden.value = val || '';
    enableBasecoatHover(current, listbox);
  }

  // Vorlage für Optionen
  function getOptionTemplate() {
    const other = $$('[role="option"]', listbox).find(el => el !== current && !el.hasAttribute('aria-disabled'));
    if (other) return other;
    const clone = current.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-selected', 'false');
    return clone;
  }
  const optionTemplate = getOptionTemplate();

  // Liste rendern
  function clearDynamic() {
    $$('#select-445592-listbox [data-dynamic="1"]', root).forEach(n => n.remove());
  }
  let autoIdCounter = 1;
  function appendOption(ip, port, healthy) {
    const val = `${ip}:${port}`;
    if (val === currentValue()) return;
    if ($(`[role="option"][data-value="${CSS.escape(val)}"]`, listbox)) return;

    const el = optionTemplate.cloneNode(true);
    el.id = el.id || `select-445592-items-dyn-${autoIdCounter++}`;
    el.setAttribute('role', 'option');
    el.setAttribute('data-value', val);          // wichtig für Basecoat-Styles
    el.setAttribute('aria-selected', 'false');
    el.setAttribute('data-dynamic', '1');
    el.removeAttribute('aria-disabled');
    el.classList.remove('active');
    el.textContent = val; // purer Basecoat-Look
    el.onclick = () => {
      if (val === currentValue()) return;
      const target = /^https?:\/\//i.test(val) ? val : `http://${val}`;
      window.location.href = target;
    };

    anchor.insertAdjacentElement('beforebegin', el);
    enableBasecoatHover(el, listbox);
  }
  function renderPeers(peers) {
    clearDynamic();
    if (!Array.isArray(peers) || !peers.length) {
      const info = optionTemplate.cloneNode(true);
      info.removeAttribute('id');
      info.setAttribute('role', 'option');
      info.setAttribute('aria-disabled', 'true');
      info.setAttribute('data-dynamic', '1');
      info.setAttribute('data-value', '__info'); // nötig für Hover-Style
      info.textContent = 'Keine weiteren Verbindungen gefunden';
      info.onclick = null;
      anchor.insertAdjacentElement('beforebegin', info);
      enableBasecoatHover(info, listbox);
      return;
    }
    peers.forEach(p => appendOption(p.ip, p.port, !!p.healthy));
  }
  function applyFilter(query) {
    const q = (query || '').trim().toLowerCase();
    $$('#select-445592-listbox [role="option"][data-value]', root).forEach(opt => {
      if (opt === current) return;
      const val = (opt.dataset.value || '').toLowerCase();
      opt.style.display = !q || val.includes(q) ? '' : 'none';
    });
  }

  // --- Button-Countdown (nur bei 429)
  let cooldownTimer = null;
  function setButtonCountdown(ms) {
    if (cooldownTimer) { clearTimeout(cooldownTimer); cooldownTimer = null; }
    if (!ms || ms <= 0) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Aktualisieren';
      return;
    }
    refreshBtn.disabled = true;
    const end = Date.now() + ms;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      refreshBtn.textContent = left ? `Aktualisieren (${left})` : 'Aktualisieren';
      if (left > 0) cooldownTimer = setTimeout(tick, 500);
      else {
        refreshBtn.disabled = false;           // <- Button wieder klickbar
        refreshBtn.textContent = 'Aktualisieren';
      }
    };
    tick();
  }

  // --- Netzwerk
  const ioClient = window.io ? window.io() : null;
  let allPeers = [];

  async function loadOnce() {
    try {
      const r = await fetch('/api/peers');
      const j = await r.json();
      allPeers = j.peers || [];
      setCurrent(currentValue());
      renderPeers(allPeers);
      applyFilter(searchInput.value);
      // WICHTIG: KEIN Countdown hier; der Button bleibt "Aktualisieren"
    } catch (e) {
      console.warn('[peers-select] /api/peers fehlgeschlagen:', e);
      setCurrent(currentValue());
    }
  }

  async function doRefresh() {
    const original = refreshBtn.textContent;
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Aktualisieren …';
    try {
      const r = await fetch('/api/peers/refresh', { method: 'POST' });
      if (r.status === 429) {
        const j = await r.json();
        setButtonCountdown(Number(j.retryIn || 0)); // Countdown nur bei 429
        return;
      }
      const j = await r.json();
      allPeers = j.peers || [];
      renderPeers(allPeers);
      // Nach Erfolg: Button sofort wieder „Aktualisieren“ (kein Countdown)
      // refreshBtn.disabled = false;
      // refreshBtn.textContent = 'Aktualisieren';
      // applyFilter(searchInput.value);
      applyFilter(searchInput.value);
      const ms = Math.max(0, (j.nextAllowedAt || 0) - Date.now());
      setButtonCountdown(ms);
    } catch (e) {
      console.warn('[peers-select] Refresh fehlgeschlagen:', e);
      refreshBtn.disabled = false;
      refreshBtn.textContent = original;
    }
  }

  if (ioClient) {
    ioClient.on('peers-updated', ({ peers }) => {
      // kein automatischer Countdown – nur Liste aktualisieren
      allPeers = peers || [];
      renderPeers(allPeers);
      applyFilter(searchInput.value);
      // Button-Text in jedem Fall "Aktualisieren"
      // refreshBtn.disabled = false;
      // refreshBtn.textContent = 'Aktualisieren';
    });
    ioClient.on('peers-cooldown', ({ retryIn }) => {
      setButtonCountdown(Number(retryIn || 0)); // nur wenn Server blockt
    });
    
  }

  // Events
  searchInput.addEventListener('input', () => applyFilter(searchInput.value));
  refreshBtn.addEventListener('click', doRefresh);

  // Initial
  setCurrent(currentValue());
  // loadOnce();
})();

