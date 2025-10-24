const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Delta = require('quill-delta');

// TODO: setting || env || 55555
const PORT = process.env.PORT || 55555;
const DATA_DIR = path.join(__dirname, '..', 'data', 'rooms');

fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Room-Struktur: { notes: { [noteId]: fullDelta }, updatedAt }
const rooms = new Map();

function roomFile(roomId) {
  return path.join(DATA_DIR, `${roomId}.json`);
}

function loadRoom(roomId) {
  const file = roomFile(roomId);
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      // Delta-Objekte sicherstellen
      Object.keys(data.notes || {}).forEach(k => {
        const d = data.notes[k];
        if (!d || !Array.isArray(d.ops)) data.notes[k] = { ops: [] };
      });
      return data;
    } catch {}
  }
  return { notes: {}, updatedAt: Date.now() };
}

function saveRoom(roomId, state) {
  fs.writeFileSync(roomFile(roomId), JSON.stringify(state));
}

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, loadRoom(roomId));
  return rooms.get(roomId);
}

// Periodisches Autosave
setInterval(() => {
  for (const [rid, state] of rooms) saveRoom(rid, state);
}, 3000);

io.on('connection', (socket) => {
  let roomId = null;

  socket.on('join', (rid) => {
    if (roomId) socket.leave(roomId);
    roomId = String(rid || 'default');
    socket.join(roomId);

    const state = ensureRoom(roomId);
    socket.emit('init', state);
  });

  // { noteId, delta, ts }
  socket.on('delta', (payload) => {
    if (!roomId || !payload?.noteId || !payload?.delta) return;
    const { noteId, delta } = payload;
    const state = ensureRoom(roomId);

    const current = new Delta(state.notes[noteId] || { ops: [] });
    const incoming = new Delta(delta);
    const composed = current.compose(incoming);

    state.notes[noteId] = composed;
    state.updatedAt = Date.now();

    // an alle anderen Clients im Room
    socket.to(roomId).emit('delta', { noteId, delta });
  });

  socket.on('disconnect', () => {});
});

server.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
