// import { createSocket } from './socket.js';
// import { EditorManager } from './editorManager.js';

// const statusEl = document.getElementById('status');
// const roomInput = document.getElementById('room');
// const joinBtn = document.getElementById('join');

// let currentRoom = 'default';
// const socket = createSocket({
//   onConnect: (id) => setStatus(`Verbunden als ${id}`),
//   onDisconnect: () => setStatus('Getrennt.'),
// });

// const manager = new EditorManager({
//   toolbarSelector: '#toolbar',
//   editorSelector: '.editor',
//   socket,
//   onInit: (state) => {
//     setStatus(`Room: ${currentRoom} — Stand: ${state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—'}`);
//   }
// });

// joinBtn?.addEventListener('click', () => {
//   currentRoom = (roomInput?.value || '').trim() || 'default';
//   socket.join(currentRoom);
//   manager.joinRoom(currentRoom);
// });

// socket.join(currentRoom);
// manager.joinRoom(currentRoom);

// function setStatus(t) { if (statusEl) statusEl.textContent = t; }
// //////////////////////////////
// import { createSocket } from './socket.js';
// import { EditorManager } from './editorManager.js';
// import { initTheme, setTheme, getTheme } from './theme.js';

// initTheme(); // ← wichtig, bevor UI gezeichnet wird

// const statusEl = document.getElementById('status');
// const roomInput = document.getElementById('room');
// const joinBtn = document.getElementById('join');

// const themeSelect = document.getElementById('theme-select');
// if (themeSelect) {
//   themeSelect.value = getTheme();
//   themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
// }

// let currentRoom = 'default';
// const socket = createSocket({
//   onConnect: (id) => setStatus(`Verbunden als ${id}`),
//   onDisconnect: () => setStatus('Getrennt.'),
// });

// const manager = new EditorManager({
//   toolbarSelector: '#toolbar',
//   editorSelector: '.editor',
//   socket,
//   onInit: (state) => {
//     setStatus(`Room: ${currentRoom} — Stand: ${state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—'}`);
//   }
// });

// joinBtn?.addEventListener('click', () => {
//   currentRoom = (roomInput?.value || '').trim() || 'default';
//   socket.join(currentRoom);
//   manager.joinRoom(currentRoom);
// });

// socket.join(currentRoom);
// manager.joinRoom(currentRoom);

// function setStatus(t) { if (statusEl) statusEl.textContent = t; }
///////////////////////////////////
import { createSocket } from './socket.js';
import { EditorManager } from './editorManager.js';
import { initThemeControls } from './theme.js';


// // 1) Theme initialisieren + Controls binden (muss vor UI-Interaktion passieren)
// initThemeControls(); // nutzt #theme-family und #theme-mode aus index.html

// // 2) DOM-Refs & Themes
// const statusEl = document.getElementById('status');
// const roomInput = document.getElementById('room');
// const joinBtn   = document.getElementById('join');

// const themeBtn = document.getElementById('theme-toggle');
// themeBtn?.addEventListener('click', () => {
//     document.dispatchEvent(new CustomEvent('basecoat:theme')); // toggle
// });

const brandSel = document.getElementById('brand-select');
const themeBtn = document.getElementById('theme-toggle');

brandSel?.addEventListener('change', (e) => {
  document.dispatchEvent(new CustomEvent('basecoat:brand', { detail: { brand: e.target.value } }));
});

themeBtn?.addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('basecoat:theme')); // toggle
});



// 3) Helpers
function setStatus(text) { if (statusEl) statusEl.textContent = text; }

// 4) Socket verbinden
let currentRoom = 'default';
const socket = createSocket({
    onConnect: (id) => setStatus(`Verbunden als ${id}`),
    onDisconnect: () => setStatus('Getrennt.'),
});

// 5) Editor-Manager mit gemeinsamer Toolbar
const manager = new EditorManager({
    toolbarSelector: '#toolbar',
    editorSelector: '.editor',
    socket,
    onInit: (state) => {
        const ts = state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—';
        setStatus(`Room: ${currentRoom} — Stand: ${ts}`);
    }
});

// 6) Raumwechsel (Button)
joinBtn?.addEventListener('click', () => {
    currentRoom = (roomInput?.value || '').trim() || 'default';
    socket.join(currentRoom);
    manager.joinRoom(currentRoom);
});

// 7) Initial in Default-Raum
socket.join(currentRoom);
manager.joinRoom(currentRoom);