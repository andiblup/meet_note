// // server/server.js
// const path = require('path');
// const fs = require('fs');
// const os = require('os');
// const http = require('http');
// const net = require('net');
// const express = require('express');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const Delta = require('quill-delta');

// /* ------------------------- Paths & constants ------------------------- */
// const ROOT_DIR = path.join(__dirname, '..');           // passe an, falls du server.js im Projektroot hast
// const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
// const DATA_DIR = path.join(ROOT_DIR, 'data');
// const ROOMS_DIR = path.join(DATA_DIR, 'rooms');
// const SETTINGS_DIR = path.join(DATA_DIR, 'settings');
// const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

// fs.mkdirSync(PUBLIC_DIR, { recursive: true });
// fs.mkdirSync(ROOMS_DIR, { recursive: true });
// fs.mkdirSync(SETTINGS_DIR, { recursive: true });

// // Netzwerk/Port
// const PORT = Number(process.env.PORT || 55555);

// // Peer-Scan (für peers-select.js)
// const SCAN_TIMEOUT = 300;
// const SCAN_CONCURRENCY = 256;
// const SCAN_INTERVAL_MS = 30_000;           // Cooldown NACH erfolgreichem Scan
// const SCAN_CIDRS = process.env.SCAN_CIDRS ? process.env.SCAN_CIDRS.split(',').map(s => s.trim()) : null;

// /* ------------------------------ Express ------------------------------ */
// const app = express();
// app.use(cors());
// app.use(express.json({ limit: '8mb' })); // Deltas mit kleinen Inline-Bildern erlauben
// app.use(express.static(PUBLIC_DIR));
// app.get('/health', (_req, res) => res.json({ ok: true }));

// const httpServer = http.createServer(app);
// const io = new Server(httpServer, { cors: { origin: '*' } });

// /* --------------------------- Settings storage ------------------------ */
// const DEFAULT_SETTINGS = {
//   username: null,
//   brand: 'default',
//   autosave: 3000,
//   port: PORT
// };
// function readSettings() {
//   try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
//   catch { return { ...DEFAULT_SETTINGS }; }
// }
// function writeSettings(obj) {
//   const data = { ...DEFAULT_SETTINGS, ...(obj || {}) };
//   fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
//   return data;
// }
// app.get('/api/settings', (_req, res) => res.json(readSettings()));
// app.post('/api/settings', (req, res) => res.json(writeSettings(req.body)));

// /* ------------------------------ Room model ---------------------------
//  * Datei: data/rooms/<roomId>.json
//  * {
//  *   "notes": { "<noteId>": Delta },
//  *   "owners": { "<noteId>": "<userId>" },
//  *   "updatedAt": 1730000000000
//  * }
//  * ------------------------------------------------------------------- */
// function roomFile(roomId) { return path.join(ROOMS_DIR, `${roomId}.json`); }
// function validRoomId(id) { return /^[a-z0-9\-_.]{1,64}$/i.test(id); }
// function loadRoom(roomId) {
//   const f = roomFile(roomId);
//   if (!fs.existsSync(f)) return { notes: {}, owners: {}, updatedAt: Date.now() };
//   try {
//     const data = JSON.parse(fs.readFileSync(f, 'utf8'));
//     data.notes = data.notes || {};
//     data.owners = data.owners || {};
//     Object.keys(data.notes).forEach(k => {
//       const d = data.notes[k];
//       if (!d || !Array.isArray(d.ops)) data.notes[k] = { ops: [] };
//     });
//     data.updatedAt = data.updatedAt || Date.now();
//     return data;
//   } catch {
//     return { notes: {}, owners: {}, updatedAt: Date.now() };
//   }
// }
// function saveRoom(roomId, state) {
//   const norm = {
//     notes: state.notes || {},
//     owners: state.owners || {},
//     updatedAt: state.updatedAt || Date.now()
//   };
//   fs.writeFileSync(roomFile(roomId), JSON.stringify(norm));
// }
// function listRooms() {
//   return fs.readdirSync(ROOMS_DIR)
//     .filter(f => f.endsWith('.json'))
//     .map(f => path.basename(f, '.json'))
//     .sort();
// }
// function createRoom(roomId) {
//   if (!validRoomId(roomId)) throw new Error('invalid room id');
//   const f = roomFile(roomId);
//   if (fs.existsSync(f)) throw new Error('exists');
//   const fresh = { notes: {}, owners: {}, updatedAt: Date.now() };
//   saveRoom(roomId, fresh);
//   return fresh;
// }
// function renameRoom(oldId, newId) {
//   if (!validRoomId(newId)) throw new Error('invalid');
//   const a = roomFile(oldId), b = roomFile(newId);
//   if (!fs.existsSync(a)) throw new Error('notfound');
//   if (fs.existsSync(b)) throw new Error('target-exists');
//   fs.renameSync(a, b);
// }
// function deleteRoom(roomId) {
//   const f = roomFile(roomId);
//   if (fs.existsSync(f)) fs.unlinkSync(f);
// }

// /* Default-Room ist Session-only: beim Start leeren */
// deleteRoom('default');
// createRoom('default');

// /* ---------------------------- Rooms REST API ------------------------- */
// app.get('/api/rooms', (_req, res) => {
//   res.json({ rooms: listRooms() });
// });
// app.post('/api/rooms', (req, res) => {
//   const id = String(req.body?.id || '').trim();
//   if (!id) return res.status(400).json({ error: 'missing id' });
//   try { createRoom(id); return res.json({ ok: true, id }); }
//   catch (e) {
//     const msg = String(e.message || e);
//     if (msg.includes('exists')) return res.status(409).json({ error: 'exists' });
//     if (msg.includes('invalid')) return res.status(400).json({ error: 'invalid' });
//     return res.status(500).json({ error: 'internal' });
//   }
// });
// app.get('/api/rooms/:id', (req, res) => {
//   const id = String(req.params.id);
//   if (!validRoomId(id)) return res.status(400).json({ error: 'invalid' });
//   const data = loadRoom(id);
//   res.json({ id, ...data });
// });
// app.put('/api/rooms/:id', (req, res) => {
//   const oldId = String(req.params.id);
//   const newId = String(req.body?._rename || '').trim();
//   if (!newId) return res.status(400).json({ error: 'missing new id' });
//   try { renameRoom(oldId, newId); res.json({ ok: true, from: oldId, to: newId }); }
//   catch (e) {
//     const msg = String(e.message || e);
//     if (msg.includes('notfound')) return res.status(404).json({ error: 'notfound' });
//     if (msg.includes('target-exists')) return res.status(409).json({ error: 'target-exists' });
//     return res.status(400).json({ error: 'invalid' });
//   }
// });
// app.delete('/api/rooms/:id', (req, res) => {
//   const id = String(req.params.id);
//   deleteRoom(id);
//   res.json({ ok: true });
// });

// /* -------------------------- Socket.IO (notes) ------------------------ */
// // In-Memory Cache, um nicht jedesmal von Platte zu lesen
// const roomCache = new Map(); // roomId -> { notes, owners, updatedAt }
// function ensureRoom(id) {
//   if (!roomCache.has(id)) roomCache.set(id, loadRoom(id));
//   return roomCache.get(id);
// }
// function persistAll() {
//   for (const [rid, state] of roomCache) saveRoom(rid, state);
// }
// setInterval(persistAll, 3000);

// io.on('connection', (socket) => {
//   // User-Identität (für Owner) – IP wenn möglich, sonst Socket-ID
//   const userId = socket.handshake.address || socket.id;
//   socket.emit('whoami', { userId });

//   let roomId = null;

//   // Client wählt den Raum (Client sendet bereits 'join', standardmäßig 'default')
//   socket.on('join', (rid) => {
//     const next = String(rid || 'default');
//     if (!validRoomId(next)) return;
//     if (roomId) socket.leave(roomId);
//     roomId = next;
//     socket.join(roomId);

//     const state = ensureRoom(roomId);
//     socket.emit('init', { notes: state.notes, meta: { owners: state.owners }, updatedAt: state.updatedAt });
//   });

//   // Quill-Delta Patch (wird serverseitig mit dem Full-Delta zusammenkomponiert)
//   // payload: { noteId, delta, ts }
//   socket.on('delta', (payload) => {
//     if (!roomId) return;
//     if (!payload?.noteId || !payload?.delta) return;
//     const noteId = String(payload.noteId);
//     const state = ensureRoom(roomId);
//     const current = new Delta(state.notes[noteId] || { ops: [] });
//     const composed = current.compose(new Delta(payload.delta));
//     state.notes[noteId] = composed;
//     state.owners[noteId] = state.owners[noteId] || userId;  // Owner einmalig setzen
//     state.updatedAt = Date.now();

//     // an alle anderen Clients im Raum
//     socket.to(roomId).emit('delta', { noteId, delta: payload.delta, author: userId });
//   });

//   socket.on('disconnect', () => { /* noop */ });
// });

// /* ---------------------------- Peer discovery ------------------------- */
// function ipToInt(ip) { return ip.split('.').reduce((a,o)=>(a<<8)+(+o),0)>>>0; }
// function intToIp(i) { return [(i>>>24)&255,(i>>>16)&255,(i>>>8)&255,i&255].join('.'); }
// function cidrToRange(cidr) {
//   const [ip,p] = cidr.split('/'); const prefix = Number(p);
//   const base = ipToInt(ip);
//   const mask = prefix===0?0:(~((1<<(32-prefix))-1)>>>0);
//   const net = base & mask;
//   const first = net + 1;
//   const last  = (net | (~mask>>>0)) - 1;
//   return { first, last };
// }
// function localCIDRsFallback24() {
//   const out = [];
//   const nets = os.networkInterfaces();
//   for (const infos of Object.values(nets)) {
//     for (const i of infos || []) {
//       if (i.family !== 'IPv4' || i.internal) continue;
//       if (!/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(i.address)) continue;
//       const [a,b,c]=i.address.split('.');
//       out.push(`${a}.${b}.${c}.0/24`);
//     }
//   }
//   return [...new Set(out)];
// }
// function buildTargets() {
//   const cidrs = SCAN_CIDRS && SCAN_CIDRS.length ? SCAN_CIDRS : localCIDRsFallback24();
//   const ips = [];
//   for (const cidr of cidrs) {
//     const { first, last } = cidrToRange(cidr);
//     for (let n = first; n <= last; n++) ips.push(intToIp(n));
//   }
//   return ips;
// }
// function checkPort(ip, port, timeoutMs) {
//   return new Promise(res => {
//     const s = new net.Socket();
//     let done = false;
//     const finish = ok => { if (!done) { done = true; s.destroy(); res(ok); } };
//     s.setTimeout(timeoutMs);
//     s.once('connect', () => finish(true));
//     s.once('timeout', () => finish(false));
//     s.once('error', () => finish(false));
//     s.connect(PORT, ip);
//   });
// }
// async function scanPeers() {
//   const targets = buildTargets();
//   const found = [];
//   let i = 0;
//   async function worker(){
//     while (i < targets.length) {
//       const ip = targets[i++];
//       const ok = await checkPort(ip, PORT, SCAN_TIMEOUT);
//       if (ok) {
//         let healthy = false;
//         try {
//           const resp = await fetch(`http://${ip}:${PORT}/health`, { signal: AbortSignal.timeout(500) });
//           healthy = resp.ok;
//         } catch {}
//         found.push({ ip, port: PORT, healthy });
//       }
//     }
//   }
//   const workers = Array.from({length: Math.min(SCAN_CONCURRENCY, 256)}, worker);
//   await Promise.all(workers);
//   found.sort((a,b) => (b.healthy - a.healthy) || (a.ip > b.ip ? 1 : -1));
//   return found;
// }
// const peersCache = { peers: [], updatedAt: 0, nextAllowedAt: 0 };
// function canScanNow(){ return Date.now() >= peersCache.nextAllowedAt; }
// async function runScanAndBroadcast() {
//   const peers = await scanPeers();
//   peersCache.peers = peers;
//   peersCache.updatedAt = Date.now();
//   peersCache.nextAllowedAt = Date.now() + SCAN_INTERVAL_MS;
//   io.emit('peers-updated', { peers, updatedAt: peersCache.updatedAt });
// }

// app.get('/api/peers', (_req,res) => {
//   res.json({ ...peersCache, now: Date.now() });
// });
// app.post('/api/peers/refresh', async (_req,res) => {
//   if (!canScanNow()) {
//     return res.status(429).json({
//       error: 'cooldown',
//       retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
//       nextAllowedAt: peersCache.nextAllowedAt,
//       updatedAt: peersCache.updatedAt,
//       peers: peersCache.peers
//     });
//   }
//   await runScanAndBroadcast();
//   res.json({ ok: true, peers: peersCache.peers, updatedAt: peersCache.updatedAt, nextAllowedAt: peersCache.nextAllowedAt });
// });

// // bei neuen Socket-Verbindungen aktuellen Peer-Stand mitgeben + optionaler manueller Refresh
// io.on('connection', (socket) => {
//   socket.emit('peers-updated', { peers: peersCache.peers, updatedAt: peersCache.updatedAt });
//   socket.on('peers:refresh', async () => {
//     if (!canScanNow()) {
//       socket.emit('peers-cooldown', { 
//         retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
//         nextAllowedAt: peersCache.nextAllowedAt
//       });
//       return;
//     }
//     await runScanAndBroadcast();
//   });
// });

// /* ------------------------------ Start ------------------------------- */
// httpServer.listen(PORT, () => {
//   console.log(`[server] listening on :${PORT}`);
// });
// // Initialer Peer-Scan
// runScanAndBroadcast().catch(err => {
//   console.error('[server] initial peer scan failed:', err);
// });

//! 
// // server/server.js
// const path = require('path');
// const fs = require('fs');
// const os = require('os');
// const http = require('http');
// const https = require('https');
// const net = require('net');
// const express = require('express');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const Delta = require('quill-delta');

// /* ====================== Pfade & Konstanten ====================== */
// const ROOT_DIR = path.join(__dirname, '..');
// const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
// const DATA_DIR = path.join(ROOT_DIR, 'data');
// const ROOMS_DIR = path.join(DATA_DIR, 'rooms');
// const SETTINGS_DIR = path.join(DATA_DIR, 'settings');
// const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

// // [PUBLIC_DIR, DATA_DIR, ROOMS_DIR, SETTINGS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));
// fs.mkdirSync(ROOMS_DIR, { recursive: true });

// const PORT = Number(process.env.PORT || 55555);

// /* ====================== Express / HTTP / IO ===================== */
// const app = express();
// app.use(cors());
// app.use(express.json({ limit: '12mb' })); // Platz für Deltas mit kleineren Inline-Images
// app.use(express.static(PUBLIC_DIR));
// app.get('/health', (_req, res) => res.json({ ok: true }));

// const httpServer = http.createServer(app);
// const io = new Server(httpServer, { cors: { origin: '*' } });

// /* ========================= Settings API ========================= */
// const DEFAULT_SETTINGS = { username: null, brand: 'default', autosave: 3000, port: PORT };
// function readSettings() {
//     try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
//     catch { return { ...DEFAULT_SETTINGS }; }
// }
// function writeSettings(obj) {
//     const data = { ...DEFAULT_SETTINGS, ...(obj || {}) };
//     fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
//     return data;
// }
// app.get('/api/settings', (_req, res) => res.json(readSettings()));
// app.post('/api/settings', (req, res) => res.json(writeSettings(req.body)));

// /* =========================== Room IO =========================== */
// function roomPath(roomId) {
//     return path.join(ROOMS_DIR, `${roomId}.json`);
// }
// function listRoomsOnDisk() {
//     return fs.readdirSync(ROOMS_DIR)
//         .filter(f => f.endsWith('.json'))
//         .map(f => path.basename(f, '.json'))
//         .sort((a, b) => a.localeCompare(b));
// }

// function slugRoomId(input) {
//     const s = String(input || '').trim().toLowerCase()
//         .replace(/\s+/g, '-')
//         .replace(/[^a-z0-9\-_.]/g, '')
//         .replace(/-+/g, '-')
//         .slice(0, 64);
//     return s || 'untitled';
// }
// function validRoomId(id) { return /^[a-z0-9\-_.]{1,64}$/i.test(String(id)); }
// function roomFile(roomId) { return path.join(ROOMS_DIR, `${roomId}.json`); }

// // function loadRoom(roomId) {
// //   const f = roomFile(roomId);
// //   if (!fs.existsSync(f)) return { notes: {}, owners: {}, updatedAt: Date.now() };
// //   try {
// //     const data = JSON.parse(fs.readFileSync(f, 'utf8'));
// //     const notes = data.notes || {};
// //     const owners = data.owners || {};
// //     Object.keys(notes).forEach(k => {
// //       const d = notes[k];
// //       if (!d || !Array.isArray(d.ops)) notes[k] = { ops: [] };
// //     });
// //     return { notes, owners, updatedAt: data.updatedAt || Date.now() };
// //   } catch {
// //     return { notes: {}, owners: {}, updatedAt: Date.now() };
// //   }
// // }
// function loadRoom(roomId) {
//     const p = roomPath(roomId);
//     if (fs.existsSync(p)) {
//         try {
//             const data = JSON.parse(fs.readFileSync(p, 'utf8'));
//             // defensiv: deltas
//             for (const k of Object.keys(data.notes || {})) {
//                 const d = data.notes[k];
//                 if (!d || !Array.isArray(d.ops)) data.notes[k] = { ops: [] };
//             }
//             return data;
//         } catch { }
//     }
//     return { notes: {}, meta: { owners: {} }, updatedAt: Date.now() };
// }

// // function saveRoom(roomId, state) {
// //   fs.writeFileSync(roomPath(roomId), JSON.stringify(state));
// // }
// function saveRoom(roomId, state) {
//     const payload = {
//         notes: state.notes || {},
//         owners: state.owners || {},
//         updatedAt: state.updatedAt || Date.now(),
//     };
//     fs.writeFileSync(roomFile(roomId), JSON.stringify(payload));
// }
// function listRooms() {
//     return fs.readdirSync(ROOMS_DIR)
//         .filter(f => f.endsWith('.json'))
//         .map(f => path.basename(f, '.json'))
//         .sort();
// }
// function createRoom(roomIdRaw) {
//     const id = slugRoomId(roomIdRaw);
//     if (!validRoomId(id)) throw new Error('invalid');
//     const f = roomFile(id);
//     if (fs.existsSync(f)) throw new Error('exists');
//     saveRoom(id, { notes: {}, owners: {}, updatedAt: Date.now() });
//     return id;
// }
// function renameRoom(oldId, newIdRaw) {
//     const target = slugRoomId(newIdRaw);
//     if (!validRoomId(target)) throw new Error('invalid');
//     const a = roomFile(oldId), b = roomFile(target);
//     if (!fs.existsSync(a)) throw new Error('notfound');
//     if (fs.existsSync(b)) throw new Error('target-exists');
//     fs.renameSync(a, b);
//     return target;
// }
// function deleteRoom(id) {
//     const f = roomFile(id);
//     if (fs.existsSync(f)) fs.unlinkSync(f);
// }

// /* ---------- Default-Room: beim Start NEU initialisieren ---------- */
// try { deleteRoom('default'); } catch { }
// saveRoom('default', { notes: {}, owners: {}, updatedAt: Date.now() });

// /* ===================== In-Memory Cache & Persist ===================== */
// const roomCache = new Map(); // roomId -> { notes, owners, updatedAt }
// function ensureRoom(id) {
//     if (!roomCache.has(id)) roomCache.set(id, loadRoom(id));
//     return roomCache.get(id);
// }

// // AUTO SAVE ROOM EVERY 3s
// // setInterval(() => {
// //   for (const [rid, state] of roomCache) saveRoom(rid, state);
// // }, 3000);

// /* ============================ Rooms REST ============================ */
// // app.get('/api/rooms', (_req, res) => {
// //   res.json({ rooms: listRooms() });
// // });
// // app.post('/api/rooms', (req, res) => {
// //   const raw = req.body?.id;
// //   if (!raw) return res.status(400).json({ error: 'missing id' });
// //   try {
// //     const id = createRoom(raw);
// //     io.emit('rooms:list', { rooms: listRooms() });
// //     io.emit('room:created', { id });
// //     return res.json({ ok: true, id });
// //   } catch (e) {
// //     const m = String(e.message || e);
// //     if (m.includes('exists'))  return res.status(409).json({ error: 'exists' });
// //     if (m.includes('invalid')) return res.status(400).json({ error: 'invalid' });
// //     return res.status(500).json({ error: 'internal' });
// //   }
// // });
// app.get('/api/rooms', (_req, res) => {
//     // Liste vom Disk + aktuell im Speicher
//     const disk = new Set(listRoomsOnDisk());
//     const mem = new Set(rooms.keys());
//     const all = new Set([...disk, ...mem]);
//     // sicherstellen, dass "default" existiert
//     if (!all.has('default')) all.add('default');
//     res.json({ rooms: Array.from(all).sort((a, b) => a.localeCompare(b)) });
// });
// app.post('/api/rooms', (req, res) => {
//     const id = String(req.body?.id || '').trim();
//     if (!id || /[^\w.-]/.test(id)) return res.status(400).json({ error: 'invalid id' });
//     if (id === 'default') return res.status(400).json({ error: 'default is reserved' });

//     if (fs.existsSync(roomPath(id))) return res.status(409).json({ error: 'exists' });
//     const state = { notes: {}, meta: { owners: {} }, updatedAt: Date.now() };
//     saveRoom(id, state);
//     rooms.set(id, state);

//     // broadcast vollständige Liste
//     const all = Array.from(new Set([...listRoomsOnDisk(), ...rooms.keys()])).sort();
//     io.emit('rooms:list', { rooms: all });

//     res.json({ ok: true, roomId: id });
// });

// app.get('/api/rooms/:id', (req, res) => {
//     const id = String(req.params.id);
//     if (!validRoomId(id)) return res.status(400).json({ error: 'invalid' });
//     const data = loadRoom(id);
//     res.json({ id, ...data });
// });
// app.put('/api/rooms/:id', (req, res) => {
//     const from = String(req.params.id);
//     const toRaw = String(req.body?._rename || '').trim();
//     if (!toRaw) return res.status(400).json({ error: 'missing new id' });
//     try {
//         const to = renameRoom(from, toRaw);
//         io.emit('rooms:list', { rooms: listRooms() });
//         io.emit('room:renamed', { from, to });
//         res.json({ ok: true, from, to });
//     } catch (e) {
//         const m = String(e.message || e);
//         if (m.includes('notfound')) return res.status(404).json({ error: 'notfound' });
//         if (m.includes('target-exists')) return res.status(409).json({ error: 'target-exists' });
//         return res.status(400).json({ error: 'invalid' });
//     }
// });
// app.delete('/api/rooms/:id', (req, res) => {
//     const id = String(req.params.id);
//     deleteRoom(id);
//     io.emit('rooms:list', { rooms: listRooms() });
//     io.emit('room:deleted', { id });
//     res.json({ ok: true });
// });

// /* ======================== Peer Discovery (opt) ======================= */
// const SCAN_TIMEOUT = 300;
// const SCAN_CONCURRENCY = 256;
// const SCAN_INTERVAL_MS = 30_000;
// const SCAN_CIDRS = process.env.SCAN_CIDRS ? process.env.SCAN_CIDRS.split(',').map(s => s.trim()) : null;

// function ipToInt(ip) { return ip.split('.').reduce((a, o) => (a << 8) + (+o), 0) >>> 0; }
// function intToIp(i) { return [(i >>> 24) & 255, (i >>> 16) & 255, (i >>> 8) & 255, i & 255].join('.'); }
// function cidrToRange(cidr) {
//     const [ip, p] = cidr.split('/'); const prefix = Number(p);
//     const base = ipToInt(ip); const mask = prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1) >>> 0);
//     const net = base & mask; const first = net + 1; const last = (net | (~mask >>> 0)) - 1;
//     return { first, last };
// }
// function localCIDRsFallback24() {
//     const out = []; const nets = os.networkInterfaces();
//     for (const infos of Object.values(nets)) {
//         for (const i of infos || []) {
//             if (i.family !== 'IPv4' || i.internal) continue;
//             if (!/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(i.address)) continue;
//             const [a, b, c] = i.address.split('.');
//             out.push(`${a}.${b}.${c}.0/24`);
//         }
//     }
//     return [...new Set(out)];
// }
// function buildTargets() {
//     const cidrs = SCAN_CIDRS && SCAN_CIDRS.length ? SCAN_CIDRS : localCIDRsFallback24();
//     const ips = []; for (const c of cidrs) { const { first, last } = cidrToRange(c); for (let n = first; n <= last; n++) ips.push(intToIp(n)); }
//     return ips;
// }
// function checkPort(ip, port, timeoutMs) {
//     return new Promise(res => {
//         const s = new net.Socket(); let done = false;
//         const finish = ok => { if (!done) { done = true; s.destroy(); res(ok); } };
//         s.setTimeout(timeoutMs);
//         s.once('connect', () => finish(true));
//         s.once('timeout', () => finish(false));
//         s.once('error', () => finish(false));
//         s.connect(port, ip);
//     });
// }
// // "best effort" fetch, bricht auf Node<18 nicht den Server:
// async function tryHealth(ip, port) {
//     const url = `http://${ip}:${port}/health`;
//     if (typeof fetch === 'function') {
//         try {
//             const ctrl = new AbortController();
//             const t = setTimeout(() => ctrl.abort(), 500);
//             const r = await fetch(url, { signal: ctrl.signal });
//             clearTimeout(t);
//             return r.ok;
//         } catch { return false; }
//     }
//     // Fallback: HEAD via http
//     return new Promise(resolve => {
//         const req = http.request(url, { method: 'HEAD', timeout: 500 }, res => {
//             resolve(res.statusCode >= 200 && res.statusCode < 400);
//         });
//         req.on('error', () => resolve(false));
//         req.on('timeout', () => { try { req.destroy(); } finally { resolve(false); } });
//         req.end();
//     });
// }
// async function scanPeers() {
//     const targets = buildTargets(); const found = []; let i = 0;
//     async function worker() {
//         while (i < targets.length) {
//             const ip = targets[i++]; const ok = await checkPort(ip, PORT, SCAN_TIMEOUT);
//             if (ok) {
//                 const healthy = await tryHealth(ip, PORT);
//                 found.push({ ip, port: PORT, healthy });
//             }
//         }
//     }
//     const workers = Array.from({ length: Math.min(SCAN_CONCURRENCY, 256) }, worker);
//     await Promise.all(workers);
//     found.sort((a, b) => (b.healthy - a.healthy) || (a.ip > b.ip ? 1 : -1));
//     return found;
// }
// const peersCache = { peers: [], updatedAt: 0, nextAllowedAt: 0 };
// function canScanNow() { return Date.now() >= peersCache.nextAllowedAt; }
// async function runScanAndBroadcast() {
//     const peers = await scanPeers();
//     peersCache.peers = peers;
//     peersCache.updatedAt = Date.now();
//     peersCache.nextAllowedAt = Date.now() + SCAN_INTERVAL_MS;
//     io.emit('peers-updated', { peers, updatedAt: peersCache.updatedAt });
// }
// app.get('/api/peers', (_req, res) => res.json({ ...peersCache, now: Date.now() }));
// app.post('/api/peers/refresh', async (_req, res) => {
//     if (!canScanNow()) {
//         return res.status(429).json({
//             error: 'cooldown',
//             retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
//             nextAllowedAt: peersCache.nextAllowedAt,
//             updatedAt: peersCache.updatedAt,
//             peers: peersCache.peers
//         });
//     }
//     await runScanAndBroadcast();
//     res.json({ ok: true, peers: peersCache.peers, updatedAt: peersCache.updatedAt, nextAllowedAt: peersCache.nextAllowedAt });
// });

// /* =========================== Socket.IO =========================== */
// // io.on('connection', (socket) => {
// //     const userId = socket.handshake.address || socket.id;
// //     socket.emit('whoami', { userId });

// //     // Rooms-Liste sofort liefern
// //     socket.emit('rooms:list', { rooms: listRooms() });

// //     // Automatisch dem default-Room beitreten + Zustand senden
// //     let currentRoom = 'default';
// //     socket.join(currentRoom);
// //     {
// //         const state = ensureRoom(currentRoom);
// //         socket.emit('init', { roomId: currentRoom, notes: state.notes, meta: { owners: state.owners }, updatedAt: state.updatedAt });
// //         socket.emit('joined', { roomId: currentRoom });
// //     }

// //     // Client möchte in einen anderen Room wechseln
// //     socket.on('join', (ridRaw) => {
// //         const rid = validRoomId(String(ridRaw)) ? String(ridRaw) : slugRoomId(ridRaw);
// //         if (!validRoomId(rid)) return;

// //         if (currentRoom) socket.leave(currentRoom);
// //         currentRoom = rid;
// //         socket.join(currentRoom);

// //         // ggf. neu anlegen (wenn unbekannt)
// //         if (!fs.existsSync(roomFile(currentRoom))) saveRoom(currentRoom, { notes: {}, owners: {}, updatedAt: Date.now() });

// //         const state = ensureRoom(currentRoom);
// //         socket.emit('init', { roomId: currentRoom, notes: state.notes, meta: { owners: state.owners }, updatedAt: state.updatedAt });
// //         socket.emit('joined', { roomId: currentRoom });
// //     });

// //     // Quill-Delta aus dem Client
// //     socket.on('delta', (payload) => {
// //         if (!currentRoom) return;
// //         if (!payload?.noteId || !payload?.delta) return;

// //         const noteId = String(payload.noteId);
// //         const state = ensureRoom(currentRoom);

// //         const prev = new Delta(state.notes[noteId] || { ops: [] });
// //         const next = prev.compose(new Delta(payload.delta));

// //         state.notes[noteId] = next;
// //         state.owners[noteId] = state.owners[noteId] || userId;
// //         state.updatedAt = Date.now();

// //         // an alle anderen Clients im selben Room
// //         socket.to(currentRoom).emit('delta', { noteId, delta: payload.delta, author: userId });
// //     });

// //     // Rooms via Socket (optional)
// //     socket.on('rooms:list', () => socket.emit('rooms:list', { rooms: listRooms() }));
// //     socket.on('room:create', ({ id }) => {
// //         try {
// //             const newId = createRoom(id);
// //             io.emit('rooms:list', { rooms: listRooms() });
// //             io.emit('room:created', { id: newId });
// //         } catch (e) {
// //             socket.emit('room:error', { action: 'create', message: String(e.message || e) });
// //         }
// //     });
// //     socket.on('room:delete', ({ id }) => {
// //         deleteRoom(id);
// //         io.emit('rooms:list', { rooms: listRooms() });
// //         io.emit('room:deleted', { id });
// //     });
// //     socket.on('room:rename', ({ from, to }) => {
// //         try {
// //             const newId = renameRoom(from, to);
// //             io.emit('rooms:list', { rooms: listRooms() });
// //             io.emit('room:renamed', { from, to: newId });
// //         } catch (e) {
// //             socket.emit('room:error', { action: 'rename', message: String(e.message || e) });
// //         }
// //     });

// //     // Peers live
// //     socket.emit('peers-updated', { peers: peersCache.peers, updatedAt: peersCache.updatedAt });
// //     socket.on('peers:refresh', async () => {
// //         if (!canScanNow()) {
// //             socket.emit('peers-cooldown', {
// //                 retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
// //                 nextAllowedAt: peersCache.nextAllowedAt
// //             });
// //             return;
// //         }
// //         await runScanAndBroadcast();
// //     });

// //     socket.on('disconnect', () => { });
// // });
// io.on('connection', (socket) => {
//     let roomId = null;
//     const userId = socket.handshake.address || socket.id;

//     socket.emit('whoami', { userId });

//     socket.on('join', (rid) => {
//         if (roomId) socket.leave(roomId);
//         roomId = String(rid || 'default');
//         socket.join(roomId);

//         const state = ensureRoom(roomId);
//         // vollständiger init: notes + meta (owners)
//         socket.emit('init', {
//             notes: state.notes || {},
//             meta: state.meta || { owners: {} },
//             updatedAt: state.updatedAt || Date.now(),
//             roomId
//         });
//         socket.emit('joined', { roomId });

//         // Liste immer vollständig
//         const all = Array.from(new Set([...listRoomsOnDisk(), ...rooms.keys()]));
//         socket.emit('rooms:list', { rooms: all.sort() });
//     });

//     socket.on('delta', ({ noteId, delta }) => {
//         if (!roomId || !noteId || !delta) return;
//         const state = ensureRoom(roomId);
//         const owners = state.meta?.owners || (state.meta = { owners: {} }, state.meta.owners);

//         const current = new Delta(state.notes[noteId] || { ops: [] });
//         const incoming = new Delta(delta);
//         const composed = current.compose(incoming);

//         state.notes[noteId] = composed;
//         state.updatedAt = Date.now();
//         if (!owners[noteId]) owners[noteId] = userId;

//         // speichern + broadcast
//         saveRoom(roomId, state);
//         socket.to(roomId).emit('delta', { noteId, delta, author: userId });
//     });

//     socket.emit('rooms:list', { rooms: Array.from(new Set([...listRoomsOnDisk(), ...rooms.keys()])).sort() });
// });


// /* ============================== Start ============================== */
// httpServer.listen(PORT, () => {
//     console.log(`[server] listening on :${PORT}`);
// });

// // // In-Memory Rooms Cache Auto-Persist
// // setInterval(() => {
// //   for (const [rid, state] of roomCache) saveRoom(rid, state);
// // }, 3000);

// // runScanAndBroadcast().catch(err => {
// //   console.error('[server] initial peer scan failed:', err);
// // });


// // // Beim Start: default neu (wipe) und anlegen
// (() => {
//     const defFile = roomPath('default');
//     try { if (fs.existsSync(defFile)) fs.unlinkSync(defFile); } catch { }
//     rooms.set('default', { notes: {}, meta: { owners: {} }, updatedAt: Date.now() });
// })();

//! ////////////////////////