// // public/js/rooms-select.js
// (() => {
//   const $ = (s, r = document) => r.querySelector(s);
//   const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

//   const root = $('#rooms-select');
//   if (!root) return;
//   const trigger = $('#rooms-trigger', root);
//   const popover = $('#rooms-popover', root);
//   const listbox = $('#rooms-listbox', root);
//   const labelEl = $('#rooms-label', root);
//   const current = $('#rooms-current', root);
//   const anchor = $('#rooms-dynamic-anchor', root);
//   const hidden = $('input[name="rooms-value"]', root);
//   const searchIn = $('#rooms-search', root);
//   const createBt = $('#room-create-btn', root);

//   const ADMIN_TOKEN = ''; // Optional: hier Client-seitig setzen oder via preload/Electron einfügen

//   function open() { popover.setAttribute('aria-hidden', 'false'); trigger.setAttribute('aria-expanded', 'true'); }
//   function close() { popover.setAttribute('aria-hidden', 'true'); trigger.setAttribute('aria-expanded', 'false'); }

//   trigger.addEventListener('click', (e) => { e.stopPropagation(); (popover.getAttribute('aria-hidden') === 'true') ? open() : close(); });
//   document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });

//   function currentRoom() {
//     const url = new URL(location.href);
//     return url.searchParams.get('room') || 'default';
//   }
//   function setCurrent(id) {
//     current.dataset.value = id; current.textContent = id; current.setAttribute('aria-selected', 'true');
//     labelEl.textContent = id; hidden.value = id;
//   }

//   function clearDynamic() { $$('#rooms-listbox [data-dynamic="1"]', root).forEach(n => n.remove()); }
//   function appendRoom(room) {
//     const id = room.id;
//     if ($(`[role="option"][data-value="${CSS.escape(id)}"]`, listbox)) return;
//     const el = current.cloneNode(true);
//     el.removeAttribute('id');
//     el.setAttribute('data-dynamic', '1');
//     el.setAttribute('aria-selected', 'false');
//     el.dataset.value = id;
//     el.textContent = room.title ? `${room.title} · ${id}` : id;

//     el.addEventListener('click', () => {
//       // Wechsel: Seite mit ?room= neu laden (einfach und robust)
//       const url = new URL(location.href);
//       url.searchParams.set('room', id);
//       location.href = url.toString();
//     });

//     // Basecoat hover
//     el.addEventListener('mouseenter', () => {
//       listbox.querySelectorAll('.active').forEach(o => o.classList.remove('active'));
//       el.classList.add('active');
//     });
//     el.addEventListener('mouseleave', () => el.classList.remove('active'));

//     anchor.insertAdjacentElement('beforebegin', el);
//   }

//   function applyFilter(q) {
//     const needle = (q || '').trim().toLowerCase();
//     $$('#rooms-listbox [role="option"][data-value]', root).forEach(opt => {
//       if (opt === current) return;
//       const text = (opt.textContent || '').toLowerCase();
//       opt.style.display = !needle || text.includes(needle) ? '' : 'none';
//     });
//   }

//   // CRUD Calls
//   async function fetchRooms() {
//     const r = await fetch('/api/rooms');
//     const j = await r.json();
//     return j.rooms || [];
//   }
//   async function createRoomReq(id, title) {
//     const r = await fetch('/api/rooms', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json', ...(ADMIN_TOKEN ? { 'x-admin': ADMIN_TOKEN } : {}) },
//       body: JSON.stringify({ id, title })
//     });
//     if (!r.ok) throw new Error((await r.json()).error || 'create failed');
//   }
//   async function deleteRoomReq(id) {
//     const r = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
//       method: 'DELETE',
//       headers: { ...(ADMIN_TOKEN ? { 'x-admin': ADMIN_TOKEN } : {}) }
//     });
//     if (!r.ok) throw new Error((await r.json()).error || 'delete failed');
//   }
//   async function renameRoomReq(id, newId, title) {
//     const r = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json', ...(ADMIN_TOKEN ? { 'x-admin': ADMIN_TOKEN } : {}) },
//       body: JSON.stringify({ newId, title })
//     });
//     if (!r.ok) throw new Error((await r.json()).error || 'rename failed');
//   }

//   async function refreshList() {
//     const rooms = await fetchRooms();
//     clearDynamic();
//     rooms.forEach(appendRoom);
//     applyFilter(searchIn.value);
//   }

//   // Create Button → kleines Prompt (kannst du später in-line editing bauen)
//   createBt.addEventListener('click', async () => {
//     const id = prompt('Neuer Room ID (a-z,0-9,_,-):', 'room-' + Date.now().toString(36).slice(-4));
//     if (!id) return;
//     const title = prompt('Titel (optional):', id) || id;
//     try {
//       await createRoomReq(id, title);
//       await refreshList();
//       // gleich in den neuen Room wechseln
//       const url = new URL(location.href);
//       url.searchParams.set('room', id);
//       location.href = url.toString();
//     } catch (e) {
//       alert('Erstellen fehlgeschlagen: ' + e.message);
//     }
//   });

//   searchIn.addEventListener('input', () => applyFilter(searchIn.value));

//   // Live-Update (wenn andere Clients Rooms ändern)
//   if (window.io) {
//     const s = window.io();
//     s.on('rooms-updated', ({ rooms }) => {
//       clearDynamic();
//       rooms.forEach(appendRoom);
//       applyFilter(searchIn.value);
//     });
//   }

//   // z.B. in deinem rooms-select.js
//   listbox.addEventListener('click', (e) => {
//     const opt = e.target.closest('[role="option"][data-room-id]');
//     if (!opt) return;
//     const roomId = opt.dataset.roomId;
//     window.socket?.emit('join', roomId);   // <— wichtig
//     // optional: UI schließen/markieren …
//   });


//   // Boot
//   setCurrent(currentRoom());
//   refreshList();
// })();

//! ////////////////
