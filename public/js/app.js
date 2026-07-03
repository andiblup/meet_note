// // import { createSocket } from './socket.js';
// // import { EditorManager } from './editorManager.js';

// // const statusEl = document.getElementById('status');
// // const roomInput = document.getElementById('room');
// // const joinBtn = document.getElementById('join');

// // let currentRoom = 'default';
// // const socket = createSocket({
// //   onConnect: (id) => setStatus(`Verbunden als ${id}`),
// //   onDisconnect: () => setStatus('Getrennt.'),
// // });

// // const manager = new EditorManager({
// //   toolbarSelector: '#toolbar',
// //   editorSelector: '.editor',
// //   socket,
// //   onInit: (state) => {
// //     setStatus(`Room: ${currentRoom} — Stand: ${state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—'}`);
// //   }
// // });

// // joinBtn?.addEventListener('click', () => {
// //   currentRoom = (roomInput?.value || '').trim() || 'default';
// //   socket.join(currentRoom);
// //   manager.joinRoom(currentRoom);
// // });

// // socket.join(currentRoom);
// // manager.joinRoom(currentRoom);

// // function setStatus(t) { if (statusEl) statusEl.textContent = t; }
// // //////////////////////////////
// // import { createSocket } from './socket.js';
// // import { EditorManager } from './editorManager.js';
// // import { initTheme, setTheme, getTheme } from './theme.js';

// // initTheme(); // ← wichtig, bevor UI gezeichnet wird

// // const statusEl = document.getElementById('status');
// // const roomInput = document.getElementById('room');
// // const joinBtn = document.getElementById('join');

// // const themeSelect = document.getElementById('theme-select');
// // if (themeSelect) {
// //   themeSelect.value = getTheme();
// //   themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
// // }

// // let currentRoom = 'default';
// // const socket = createSocket({
// //   onConnect: (id) => setStatus(`Verbunden als ${id}`),
// //   onDisconnect: () => setStatus('Getrennt.'),
// // });

// // const manager = new EditorManager({
// //   toolbarSelector: '#toolbar',
// //   editorSelector: '.editor',
// //   socket,
// //   onInit: (state) => {
// //     setStatus(`Room: ${currentRoom} — Stand: ${state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—'}`);
// //   }
// // });

// // joinBtn?.addEventListener('click', () => {
// //   currentRoom = (roomInput?.value || '').trim() || 'default';
// //   socket.join(currentRoom);
// //   manager.joinRoom(currentRoom);
// // });

// // socket.join(currentRoom);
// // manager.joinRoom(currentRoom);

// // function setStatus(t) { if (statusEl) statusEl.textContent = t; }
// ///////////////////////////////////
// import { createSocket } from './socket.js';
// import { EditorManager } from './editorManager.js';
// import { initThemeControls } from './theme.js';


// // // 1) Theme initialisieren + Controls binden (muss vor UI-Interaktion passieren)
// // initThemeControls(); // nutzt #theme-family und #theme-mode aus index.html

// // // 2) DOM-Refs & Themes
// // const statusEl = document.getElementById('status');
// // const roomInput = document.getElementById('room');
// // const joinBtn   = document.getElementById('join');

// // const themeBtn = document.getElementById('theme-toggle');
// // themeBtn?.addEventListener('click', () => {
// //     document.dispatchEvent(new CustomEvent('basecoat:theme')); // toggle
// // });

// const brandSel = document.getElementById('brand-select');
// const themeBtn = document.getElementById('theme-toggle');

// brandSel?.addEventListener('change', (e) => {
//   document.dispatchEvent(new CustomEvent('basecoat:brand', { detail: { brand: e.target.value } }));
// });

// themeBtn?.addEventListener('click', () => {
//   document.dispatchEvent(new CustomEvent('basecoat:theme')); // toggle
// });



// // 3) Helpers
// function setStatus(text) { if (statusEl) statusEl.textContent = text; }

// // 4) Socket verbinden
// let currentRoom = 'default';
// const socket = createSocket({
//     onConnect: (id) => setStatus(`Verbunden als ${id}`),
//     onDisconnect: () => setStatus('Getrennt.'),
// });

// // 5) Editor-Manager mit gemeinsamer Toolbar
// const manager = new EditorManager({
//     toolbarSelector: '#toolbar',
//     editorSelector: '.editor',
//     socket,
//     onInit: (state) => {
//         const ts = state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—';
//         setStatus(`Room: ${currentRoom} — Stand: ${ts}`);
//     }
// });

// // 6) Raumwechsel (Button)
// joinBtn?.addEventListener('click', () => {
//     currentRoom = (roomInput?.value || '').trim() || 'default';
//     socket.join(currentRoom);
//     manager.joinRoom(currentRoom);
// });

// // 7) Initial in Default-Raum
// socket.join(currentRoom);
// manager.joinRoom(currentRoom);

// onclick main container add note



// NotesUI.addEditor('noteC', document.querySelector('#noteC .editor'));

//! ////////////////
// public/js/app.js
(() => {
  const socket = window.io ? window.io() : null;
  if (!socket) return;

  let currentRoom = 'default';

  // UI: Dropdown (nutze bitte eine EIGENE Select-ID für Rooms, nicht die 445592!)
  const roomsSelect = document.getElementById('rooms-select');      // dein eigener Wrapper
  const roomsLabel  = document.getElementById('rooms-select-label'); // im Trigger-Button
  const roomsListbox= document.getElementById('rooms-select-list');  // listbox-Container

  function renderRoomsDropdown(roomIds) {
    if (!roomsListbox) return;
    roomsListbox.innerHTML = '';
    roomIds.forEach(id => {
      const opt = document.createElement('div');
      opt.setAttribute('role', 'option');
      opt.dataset.value = id;
      opt.textContent = id;
      if (id === currentRoom) opt.setAttribute('aria-selected', 'true');
      opt.addEventListener('click', () => {
        if (id === currentRoom) return;
        // UI-Selection
        roomsListbox.querySelectorAll('[role="option"]').forEach(o => o.removeAttribute('aria-selected'));
        opt.setAttribute('aria-selected', 'true');
        currentRoom = id;
        if (roomsLabel) roomsLabel.textContent = id;
        // eigentlicher Wechsel
        socket.emit('join', id);
      });
      roomsListbox.appendChild(opt);
    });
  }

  // beim ersten Laden: Liste holen (zur Not per REST, aber Socket reicht meist)
  fetch('/api/rooms').then(r=>r.json()).then(j=>{
    renderRoomsDropdown(j.rooms || []);
  }).catch(()=>{});

  // Socket-Events
  socket.on('rooms:list', ({ rooms }) => {
    renderRoomsDropdown(rooms || []);
  });

  // WICHTIG: Wenn der Server init sendet → Notes neu laden!
  socket.on('init', (state) => {
    currentRoom = state?.roomId || currentRoom;
    if (roomsLabel) roomsLabel.textContent = currentRoom;
    // Quill/Notizen austauschen
    if (window.NotesUI && typeof window.NotesUI.resetAndLoad === 'function') {
      window.NotesUI.resetAndLoad(state);
    }
  });

  // Optional debug
  socket.on('joined', ({ roomId }) => {
    currentRoom = roomId;
    if (roomsLabel) roomsLabel.textContent = roomId;
  });

})();


