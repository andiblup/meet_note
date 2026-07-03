
// server/server.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const net = require('net');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const Delta = require('quill-delta');

/* ====================== Pfade & Konstanten ====================== */
const ROOT_DIR    = path.join(__dirname, '..');
const PUBLIC_DIR  = path.join(ROOT_DIR, 'public');
const DATA_DIR    = path.join(ROOT_DIR, 'data');
const ROOMS_DIR   = path.join(DATA_DIR, 'rooms');
const SETTINGS_DIR= path.join(DATA_DIR, 'settings');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

fs.mkdirSync(ROOMS_DIR, { recursive: true });
fs.mkdirSync(SETTINGS_DIR, { recursive: true });

const PORT = Number(process.env.PORT || 55555);

/* ====================== Express / HTTP / IO ===================== */
const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));               // genug für Deltas mit kleineren Inline-Images
app.use(express.static(PUBLIC_DIR));
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

/* ========================= Settings API ========================= */
const DEFAULT_SETTINGS = { username: null, brand: 'default', autosave: 3000, port: PORT };
function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
  catch { return { ...DEFAULT_SETTINGS }; }
}
function writeSettings(obj) {
  const data = { ...DEFAULT_SETTINGS, ...(obj || {}) };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
  return data;
}
app.get('/api/settings', (_req, res) => res.json(readSettings()));
app.post('/api/settings', (req, res) => res.json(writeSettings(req.body)));

/* =========================== Room IO =========================== */
function roomPath(roomId) {
  return path.join(ROOMS_DIR, `${roomId}.json`);
}
function listRoomsOnDisk() {
  return fs.readdirSync(ROOMS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.basename(f, '.json'))
    .sort((a, b) => a.localeCompare(b));
}
function slugRoomId(input) {
  const s = String(input || '').trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_.]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 64);
  return s || 'untitled';
}
function validRoomId(id) {
  return /^[a-z0-9\-_.]{1,64}$/i.test(String(id));
}

function loadRoom(roomId) {
  const p = roomPath(roomId);
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const state = {
        notes: data.notes || {},
        meta:  data.meta  || { owners: data.owners || {} }, // Backcompat: owners auf Root zu meta.owners migrieren
        updatedAt: data.updatedAt || Date.now(),
      };
      for (const k of Object.keys(state.notes)) {
        const d = state.notes[k];
        if (!d || !Array.isArray(d.ops)) state.notes[k] = { ops: [] };
      }
      if (!state.meta) state.meta = { owners: {} };
      if (!state.meta.owners) state.meta.owners = {};
      return state;
    } catch {}
  }
  return { notes: {}, meta: { owners: {} }, updatedAt: Date.now() };
}

function saveRoom(roomId, state) {
  const payload = {
    notes: state.notes || {},
    meta:  { owners: (state.meta && state.meta.owners) ? state.meta.owners : {} },
    updatedAt: state.updatedAt || Date.now(),
  };
  fs.writeFileSync(roomPath(roomId), JSON.stringify(payload));
}

function createRoom(roomIdRaw) {
  const id = slugRoomId(roomIdRaw);
  if (!validRoomId(id)) throw new Error('invalid');
  const f = roomPath(id);
  if (fs.existsSync(f)) throw new Error('exists');
  const state = { notes: {}, meta: { owners: {} }, updatedAt: Date.now() };
  saveRoom(id, state);
  return id;
}
function renameRoom(oldId, newIdRaw) {
  const target = slugRoomId(newIdRaw);
  if (!validRoomId(target)) throw new Error('invalid');
  const a = roomPath(oldId), b = roomPath(target);
  if (!fs.existsSync(a)) throw new Error('notfound');
  if (fs.existsSync(b)) throw new Error('target-exists');
  fs.renameSync(a, b);
  return target;
}
function deleteRoom(id) {
  const f = roomPath(id);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
function listRoomsUnion(cacheKeys) {
  const disk = new Set(listRoomsOnDisk());
  const mem  = new Set(cacheKeys);
  const all  = new Set([...disk, ...mem]);
  if (!all.has('default')) all.add('default');
  return Array.from(all).sort((a, b) => a.localeCompare(b));
}

/* ===================== In-Memory Cache ===================== */
const roomCache = new Map(); // roomId -> { notes, meta:{owners:{}}, updatedAt }
function ensureRoom(id) {
  if (!roomCache.has(id)) roomCache.set(id, loadRoom(id));
  return roomCache.get(id);
}

/* ---------- Default-Room: beim Start NEU initialisieren ---------- */
try { deleteRoom('default'); } catch {}
const freshDefault = { notes: {}, meta: { owners: {} }, updatedAt: Date.now() };
saveRoom('default', freshDefault);
roomCache.set('default', freshDefault);

/* ============================ Rooms REST ============================ */
app.get('/api/rooms', (_req, res) => {
  res.json({ rooms: listRoomsUnion(roomCache.keys()) });
});

app.post('/api/rooms', (req, res) => {
  const raw = String(req.body?.id || '').trim();
  if (!raw) return res.status(400).json({ error: 'missing id' });
  if (raw === 'default') return res.status(400).json({ error: 'default is reserved' });
  try {
    const id = createRoom(raw);
    roomCache.set(id, loadRoom(id));
    const all = listRoomsUnion(roomCache.keys());
    io.emit('rooms:list', { rooms: all });
    io.emit('room:created', { id });
    return res.json({ ok: true, id });
  } catch (e) {
    const m = String(e.message || e);
    if (m.includes('exists'))  return res.status(409).json({ error: 'exists' });
    if (m.includes('invalid')) return res.status(400).json({ error: 'invalid' });
    return res.status(500).json({ error: 'internal' });
  }
});

app.get('/api/rooms/:id', (req, res) => {
  const id = String(req.params.id);
  if (!validRoomId(id)) return res.status(400).json({ error: 'invalid' });
  const data = loadRoom(id);
  res.json({ id, notes: data.notes, meta: data.meta, updatedAt: data.updatedAt });
});

app.put('/api/rooms/:id', (req, res) => {
  const from = String(req.params.id);
  const toRaw = String(req.body?._rename || '').trim();
  if (!toRaw) return res.status(400).json({ error: 'missing new id' });
  try {
    const to = renameRoom(from, toRaw);
    // Cache aktualisieren
    const state = loadRoom(to);
    roomCache.delete(from);
    roomCache.set(to, state);

    const all = listRoomsUnion(roomCache.keys());
    io.emit('rooms:list', { rooms: all });
    io.emit('room:renamed', { from, to });
    res.json({ ok: true, from, to });
  } catch (e) {
    const m = String(e.message || e);
    if (m.includes('notfound'))      return res.status(404).json({ error: 'notfound' });
    if (m.includes('target-exists')) return res.status(409).json({ error: 'target-exists' });
    return res.status(400).json({ error: 'invalid' });
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  const id = String(req.params.id);
  deleteRoom(id);
  roomCache.delete(id);
  const all = listRoomsUnion(roomCache.keys());
  io.emit('rooms:list', { rooms: all });
  io.emit('room:deleted', { id });
  res.json({ ok: true });
});

/* ======================== Peer Discovery (optional) ======================= */
const SCAN_TIMEOUT = 300;
const SCAN_CONCURRENCY = 256;
const SCAN_INTERVAL_MS = 30_000;
const SCAN_CIDRS = process.env.SCAN_CIDRS ? process.env.SCAN_CIDRS.split(',').map(s => s.trim()) : null;

function ipToInt(ip){ return ip.split('.').reduce((a,o)=>(a<<8)+(+o),0)>>>0; }
function intToIp(i){ return [(i>>>24)&255,(i>>>16)&255,(i>>>8)&255,i&255].join('.'); }
function cidrToRange(cidr){
  const [ip,p]=cidr.split('/'); const prefix=Number(p);
  const base=ipToInt(ip); const mask=prefix===0?0:(~((1<<(32-prefix))-1)>>>0);
  const net=base&mask; const first=net+1; const last=(net|(~mask>>>0))-1;
  return {first,last};
}
function localCIDRsFallback24(){
  const out=[]; const nets=os.networkInterfaces();
  for (const infos of Object.values(nets)) {
    for (const i of infos||[]) {
      if (i.family!=='IPv4'||i.internal) continue;
      if (!/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(i.address)) continue;
      const [a,b,c]=i.address.split('.');
      out.push(`${a}.${b}.${c}.0/24`);
    }
  }
  return [...new Set(out)];
}
function buildTargets(){
  const cidrs = SCAN_CIDRS && SCAN_CIDRS.length ? SCAN_CIDRS : localCIDRsFallback24();
  const ips=[]; for (const c of cidrs){ const {first,last}=cidrToRange(c); for(let n=first;n<=last;n++) ips.push(intToIp(n)); }
  return ips;
}
function checkPort(ip, port, timeoutMs){
  return new Promise(res=>{
    const s=new net.Socket(); let done=false;
    const finish=ok=>{ if(!done){ done=true; try{s.destroy();}catch{}; res(ok); } };
    s.setTimeout(timeoutMs);
    s.once('connect', ()=>finish(true));
    s.once('timeout', ()=>finish(false));
    s.once('error',  ()=>finish(false));
    s.connect(port, ip);
  });
}
async function tryHealth(ip, port){
  const url = `http://${ip}:${port}/health`;
  if (typeof fetch === 'function') {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(()=>ctrl.abort(), 500);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      return r.ok;
    } catch { return false; }
  }
  return new Promise(resolve=>{
    const req = http.request(url, { method:'HEAD', timeout:500 }, res=>{
      resolve(res.statusCode>=200 && res.statusCode<400);
    });
    req.on('error', ()=>resolve(false));
    req.on('timeout', ()=>{ try{ req.destroy(); } finally { resolve(false); } });
    req.end();
  });
}
async function scanPeers(){
  const targets=buildTargets(); const found=[]; let i=0;
  async function worker(){
    while(i<targets.length){
      const ip=targets[i++]; const ok=await checkPort(ip, PORT, SCAN_TIMEOUT);
      if(ok){ const healthy=await tryHealth(ip,PORT); found.push({ip,port:PORT,healthy}); }
    }
  }
  const workers=Array.from({length:Math.min(SCAN_CONCURRENCY,256)}, worker);
  await Promise.all(workers);
  found.sort((a,b)=>(b.healthy-a.healthy)||(a.ip>b.ip?1:-1));
  return found;
}
const peersCache = { peers: [], updatedAt: 0, nextAllowedAt: 0 };
function canScanNow(){ return Date.now() >= peersCache.nextAllowedAt; }
async function runScanAndBroadcast(){
  const peers = await scanPeers();
  peersCache.peers = peers;
  peersCache.updatedAt = Date.now();
  peersCache.nextAllowedAt = Date.now() + SCAN_INTERVAL_MS;
  io.emit('peers-updated', { peers, updatedAt: peersCache.updatedAt });
}
app.get('/api/peers', (_req,res)=>res.json({ ...peersCache, now: Date.now() }));
app.post('/api/peers/refresh', async (_req,res)=>{
  if (!canScanNow()) {
    return res.status(429).json({
      error:'cooldown',
      retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
      nextAllowedAt: peersCache.nextAllowedAt,
      updatedAt: peersCache.updatedAt,
      peers: peersCache.peers
    });
  }
  await runScanAndBroadcast();
  res.json({ ok:true, peers: peersCache.peers, updatedAt: peersCache.updatedAt, nextAllowedAt: peersCache.nextAllowedAt });
});

/* =========================== Socket.IO =========================== */
io.on('connection', (socket) => {
  let roomId = null;
  const userId = socket.handshake.address || socket.id;

  socket.emit('whoami', { userId });

  // sofort Räume schicken
  socket.emit('rooms:list', { rooms: listRoomsUnion(roomCache.keys()) });

  // standardmäßig default joinen
  roomId = 'default';
  socket.join(roomId);
  {
    const state = ensureRoom(roomId);
    socket.emit('init', {
      roomId,
      notes: state.notes || {},
      meta:  state.meta  || { owners: {} },
      updatedAt: state.updatedAt || Date.now(),
    });
    socket.emit('joined', { roomId });
  }

  // Raumwechsel
  socket.on('join', (ridRaw) => {
    const rid = validRoomId(String(ridRaw)) ? String(ridRaw) : slugRoomId(ridRaw);
    if (!validRoomId(rid)) return;

    if (roomId) socket.leave(roomId);
    roomId = rid;
    socket.join(roomId);

    // falls nicht vorhanden → anlegen
    if (!fs.existsSync(roomPath(roomId))) {
      const fresh = { notes: {}, meta: { owners: {} }, updatedAt: Date.now() };
      saveRoom(roomId, fresh);
      roomCache.set(roomId, fresh);
      io.emit('rooms:list', { rooms: listRoomsUnion(roomCache.keys()) });
    }

    const state = ensureRoom(roomId);
    socket.emit('init', {
      roomId,
      notes: state.notes || {},
      meta:  state.meta  || { owners: {} },
      updatedAt: state.updatedAt || Date.now(),
    });
    socket.emit('joined', { roomId });
  });

  // Quill-Delta
  socket.on('delta', ({ noteId, delta }) => {
    if (!roomId || !noteId || !delta) return;
    const state = ensureRoom(roomId);
    if (!state.meta) state.meta = { owners: {} };
    if (!state.meta.owners) state.meta.owners = {};

    const current  = new Delta(state.notes[noteId] || { ops: [] });
    const incoming = new Delta(delta);
    const composed = current.compose(incoming);

    state.notes[noteId] = composed;
    state.updatedAt = Date.now();
    if (!state.meta.owners[noteId]) state.meta.owners[noteId] = userId;

    saveRoom(roomId, state);
    roomCache.set(roomId, state);

    socket.to(roomId).emit('delta', { noteId, delta, author: userId });
  });

  // Rooms-Events (optional)
  socket.on('rooms:list', () => socket.emit('rooms:list', { rooms: listRoomsUnion(roomCache.keys()) }));

  socket.on('room:create', ({ id }) => {
    try {
      const newId = createRoom(id);
      roomCache.set(newId, loadRoom(newId));
      io.emit('rooms:list', { rooms: listRoomsUnion(roomCache.keys()) });
      io.emit('room:created', { id: newId });
    } catch (e) {
      socket.emit('room:error', { action: 'create', message: String(e.message || e) });
    }
  });

  socket.on('room:delete', ({ id }) => {
    if (id === 'default') return; // optional: default nicht löschen
    deleteRoom(id);
    roomCache.delete(id);
    io.emit('rooms:list', { rooms: listRoomsUnion(roomCache.keys()) });
    io.emit('room:deleted', { id });
  });

  socket.on('room:rename', ({ from, to }) => {
    try {
      const newId = renameRoom(from, to);
      const state = loadRoom(newId);
      roomCache.delete(from);
      roomCache.set(newId, state);
      io.emit('rooms:list', { rooms: listRoomsUnion(roomCache.keys()) });
      io.emit('room:renamed', { from, to: newId });
    } catch (e) {
      socket.emit('room:error', { action: 'rename', message: String(e.message || e) });
    }
  });

  // Peers live
  socket.emit('peers-updated', { peers: peersCache.peers, updatedAt: peersCache.updatedAt });
  socket.on('peers:refresh', async () => {
    if (!canScanNow()) {
      socket.emit('peers-cooldown', {
        retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
        nextAllowedAt: peersCache.nextAllowedAt
      });
      return;
    }
    await runScanAndBroadcast();
  });

  socket.on('disconnect', () => {});
});

/* ============================== Start ============================== */
httpServer.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
});





