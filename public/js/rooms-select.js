
// public/js/rooms-select.js
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const socket = window.io ? window.io() : null;

  // --- Wrapper finden (id="rooms-select" ODER Heading "Rooms")
  let root = document.getElementById('rooms-select');
  if (!root) {
    for (const wrap of $$('.select')) {
      const heading = $('[role="listbox"] [role="heading"]', wrap);
      if (heading && /rooms/i.test(heading.textContent.trim())) { root = wrap; break; }
    }
  }
  if (!root) { console.warn('[rooms-select] Kein Rooms-Select gefunden.'); return; }

  const trigger = $('[aria-controls$="listbox"]', root);
  const popover = $('[data-popover]', root);
  const listbox = $('[role="listbox"]', root);
  const group = $('[role="group"]', listbox);
  const currentEl = $('#rooms-current', root) || $('[role="option"][aria-selected="true"]', listbox);
  const anchor = $('#rooms-dynamic-anchor', root) || $('[aria-hidden="true"][style*="height:0"]', listbox);
  const hiddenInp = $('input[name="rooms-value"]', root);
  const labelEl = $('#rooms-label', root) || $('.truncate', trigger);

  const searchInp = $('#rooms-search');
  const createForm = $('#rooms-create-form');
  const createBtn = $('#room-create-btn');
  const createInp = $('#room-create-input');

  if (!trigger || !popover || !listbox || !group || !currentEl || !anchor || !hiddenInp || !labelEl) {
    console.warn('[rooms-select] Unvollständiges Markup.');
    return;
  }

  // --- Hover wie Basecoat (class="active") ---
  function addHover(el) {
    el.addEventListener('mouseenter', () => {
      listbox.querySelectorAll('.active').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
    });
    el.addEventListener('mouseleave', () => el.classList.remove('active'));
  }

  // --- State ---
  let currentRoom = 'default';
  let roomsAll = [];

  function setCurrent(roomId) {
    currentRoom = roomId || 'default';
    currentEl.dataset.value = currentRoom;
    currentEl.textContent = currentRoom;
    currentEl.setAttribute('aria-selected', 'true');
    hiddenInp.value = currentRoom;
    labelEl.textContent = currentRoom;

    $$('#rooms-listbox [role="option"][data-value]').forEach(o => {
      if (o === currentEl) return;
      o.setAttribute('aria-selected', String(o.dataset.value === currentRoom));
    });
  }

  function clearDynamic() {
    $$('#rooms-listbox [data-dynamic="1"]').forEach(n => n.remove());
  }

  // function appendRoom(id) {
  //   if (!id) return;
  //   if ($(`[role="option"][data-value="${CSS.escape(id)}"]`, listbox)) return;

  //   const el = document.createElement('div');
  //   el.setAttribute('role', 'option');
  //   el.setAttribute('data-value', id);
  //   el.setAttribute('data-dynamic', '1');
  //   el.setAttribute('aria-selected', String(id === currentRoom));
  //   el.textContent = id;
  //   addHover(el);
  //   el.addEventListener('click', () => {
  //     if (id === currentRoom) return;
  //     socket?.emit('join', id);
  //     setCurrent(id); // UI sofort updaten; Server bestätigt zusätzlich mit 'joined'
  //   });
  //   anchor.insertAdjacentElement('beforebegin', el);
  // }
  function appendRoom(id) {
    if (!id) return;
    if ($(`[role="option"][data-value="${CSS.escape(id)}"]`, listbox)) return;

    const el = document.createElement('div');
    el.setAttribute('role', 'option');
    el.setAttribute('data-value', id);
    el.setAttribute('data-dynamic', '1');
    el.setAttribute('aria-selected', String(id === currentRoom));
    el.textContent = id;
    addHover(el);
    el.addEventListener('click', () => {
      if (id === currentRoom) return;
      socket?.emit('join', id);
      setCurrent(id);
    });
    anchor.insertAdjacentElement('beforebegin', el);
  }




  // function renderRooms(list) {
  //   clearDynamic();
  //   if (!Array.isArray(list) || !list.length) {
  //     const info = document.createElement('div');
  //     info.setAttribute('role', 'option');
  //     info.setAttribute('data-dynamic', '1');
  //     info.setAttribute('aria-disabled', 'true');
  //     info.setAttribute('data-value', '__info');
  //     info.textContent = 'Keine Räume gefunden';
  //     addHover(info);
  //     anchor.insertAdjacentElement('beforebegin', info);
  //     return;
  //   }
  //   list.forEach(appendRoom);
  //   applyFilter(searchInp?.value || '');
  // }
  function renderRooms(list) {
    clearDynamic();

    const arr = Array.isArray(list) ? list.slice() : [];
    // fallback: default immer sichtbar
    if (!arr.includes('default')) arr.unshift('default');

    if (!arr.length) {
      const info = document.createElement('div');
      info.setAttribute('role', 'option');
      info.setAttribute('data-dynamic', '1');
      info.setAttribute('aria-disabled', 'true');
      info.setAttribute('data-value', '__info');
      info.textContent = 'Keine Räume gefunden';
      addHover(info);
      anchor.insertAdjacentElement('beforebegin', info);
      return;
    }

    arr.forEach(id => appendRoom(id));
    applyFilter(searchInp?.value || '');
  }


  function applyFilter(q) {
    const needle = (q || '').trim().toLowerCase();
    $$('#rooms-listbox [role="option"][data-value]').forEach(opt => {
      if (opt === currentEl) return;
      const id = (opt.dataset.value || '').toLowerCase();
      opt.style.display = !needle || id.includes(needle) ? '' : 'none';
    });
  }

  async function loadRoomsOnce() {
    try {
      const r = await fetch('/api/rooms');
      const j = await r.json();
      roomsAll = j.rooms || [];
      renderRooms(roomsAll);
    } catch (e) {
      console.warn('[rooms-select] /api/rooms fehlgeschlagen', e);
    }
  }

  // Live vom Server
  if (socket) {
    socket.on('rooms:list', ({ rooms }) => {
      roomsAll = rooms || [];
      renderRooms(roomsAll);
    });
    socket.on('joined', ({ roomId }) => roomId && setCurrent(roomId));
  }

  searchInp?.addEventListener('input', () => applyFilter(searchInp.value));
  createForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = (createInp?.value || '').trim();
    if (!raw) return;
    try {
      const r = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: raw })
      });
      if (r.ok) {
        createInp.value = '';
        // 'rooms:list' kommt via Socket automatisch
      } else {
        const j = await r.json().catch(() => ({}));
        alert('Room konnte nicht erstellt werden: ' + (j.error || r.status));
      }
    } catch (err) {
      console.warn('[rooms-select] create failed', err);
    }
  });

  addHover(currentEl);
  setCurrent('default');
  loadRoomsOnce();
})();

