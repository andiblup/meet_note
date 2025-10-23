import { createSocket } from './socket.js';
import { EditorManager } from './editorManager.js';

const statusEl = document.getElementById('status');
const roomInput = document.getElementById('room');
const joinBtn = document.getElementById('join');

let currentRoom = 'default';
const socket = createSocket({
  onConnect: (id) => setStatus(`Verbunden als ${id}`),
  onDisconnect: () => setStatus('Getrennt.'),
});

const manager = new EditorManager({
  toolbarSelector: '#toolbar',
  editorSelector: '.editor',
  socket,
  onInit: (state) => {
    setStatus(`Room: ${currentRoom} — Stand: ${state?.updatedAt ? new Date(state.updatedAt).toLocaleString() : '—'}`);
  }
});

joinBtn?.addEventListener('click', () => {
  currentRoom = (roomInput?.value || '').trim() || 'default';
  socket.join(currentRoom);
  manager.joinRoom(currentRoom);
});

socket.join(currentRoom);
manager.joinRoom(currentRoom);

function setStatus(t) { if (statusEl) statusEl.textContent = t; }
