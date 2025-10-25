const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Delta = require('quill-delta');
const os = require('os');
const net = require('net');

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
    } catch { }
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
  socket.emit('peers-updated', { peers: peersCache.peers, updatedAt: peersCache.updatedAt });
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

  socket.on('disconnect', () => { });
});

// IP Scanner endpoint

const SCAN_PORT = Number(PORT || process.env.PORT || 55555);
const SCAN_TIMEOUT = 300;          // ms pro TCP-Versuch
const SCAN_CONCURRENCY = 256;      // gleichzeitige Verbindungen
const SCAN_INTERVAL_MS = 30_000;   // 30s
const SCAN_CIDRS = process.env.SCAN_CIDRS?.split(',').map(s => s.trim()); // optional: "192.168.1.0/24,10.0.0.0/24"

const peersCache = {
  peers: [],         // [{ ip, port, healthy }]
  updatedAt: 0,      // epoch ms
  nextAllowedAt: 0,  // epoch ms – Rate-Limit
};

// kleine IP-Utils
function ipToInt(ip) { return ip.split('.').reduce((a, o) => (a << 8) + (+o), 0) >>> 0 }
function intToIp(i) { return [(i >>> 24) & 255, (i >>> 16) & 255, (i >>> 8) & 255, i & 255].join('.') }
function cidrToRange(cidr) {
  const [ip, p] = cidr.split('/');
  const prefix = Number(p);
  const base = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (~((1 << (32 - prefix)) - 1) >>> 0);
  const net = base & mask;
  const first = net + 1;
  const last = (net | (~mask >>> 0)) - 1;
  return { first, last };
}
function localCIDRsFallback24() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const infos of Object.values(nets)) {
    for (const i of infos || []) {
      if (i.family !== 'IPv4' || i.internal) continue;
      if (!/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(i.address)) continue;
      const [a, b, c] = i.address.split('.');
      out.push(`${a}.${b}.${c}.0/24`);
    }
  }
  // dedupe
  return [...new Set(out)];
}
function buildTargets() {
  const cidrs = SCAN_CIDRS && SCAN_CIDRS.length ? SCAN_CIDRS : localCIDRsFallback24();
  const ips = [];
  for (const cidr of cidrs) {
    const { first, last } = cidrToRange(cidr);
    for (let n = first; n <= last; n++) ips.push(intToIp(n));
  }
  return ips;
}
function checkPort(ip, port, timeoutMs) {
  return new Promise(res => {
    const s = new net.Socket();
    let done = false;
    const finish = ok => { if (!done) { done = true; s.destroy(); res(ok); } };
    s.setTimeout(timeoutMs);
    s.once('connect', () => finish(true));
    s.once('timeout', () => finish(false));
    s.once('error', () => finish(false));
    s.connect(port, ip);
  });
}
async function scanPeers() {
  const targets = buildTargets();
  const found = [];
  let i = 0;
  async function worker() {
    while (i < targets.length) {
      const idx = i++; const ip = targets[idx];
      const ok = await checkPort(ip, SCAN_PORT, SCAN_TIMEOUT);
      if (ok) {
        // optional: /health prüfen (robuster)
        try {
          const r = await fetch(`http://${ip}:${SCAN_PORT}/health`, { timeout: 500 }).catch(() => null);
          if (r && r.ok) found.push({ ip, port: SCAN_PORT, healthy: true });
          else found.push({ ip, port: SCAN_PORT, healthy: false });
        } catch {
          found.push({ ip, port: SCAN_PORT, healthy: false });
        }
      }
    }
  }
  const workers = Array.from({ length: Math.min(SCAN_CONCURRENCY, 512) }, worker);
  await Promise.all(workers);
  // Sortierung: healthy zuerst
  found.sort((a, b) => (b.healthy - a.healthy) || (a.ip > b.ip ? 1 : -1));
  return found;
}
// async function runScanAndBroadcast() {
//   peersCache.nextAllowedAt = Date.now() + SCAN_INTERVAL_MS; // sofort Cooldown setzen
//   const peers = await scanPeers();
//   peersCache.peers = peers;
//   peersCache.updatedAt = Date.now();
//   io.emit('peers-updated', { peers, updatedAt: peersCache.updatedAt });
// }
function canScanNow() { return Date.now() >= peersCache.nextAllowedAt; }

// --- REST: aktuelle Peers + manueller Refresh ---
app.get('/api/peers', (_req, res) => {
  res.json({
    peers: peersCache.peers,
    updatedAt: peersCache.updatedAt,
    nextAllowedAt: peersCache.nextAllowedAt,
    now: Date.now(),
  });
});
app.post('/api/peers/refresh', async (_req, res) => {
  if (!canScanNow()) {
    return res.status(429).json({
      error: 'cooldown',
      retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
      nextAllowedAt: peersCache.nextAllowedAt,
      updatedAt: peersCache.updatedAt,
      peers: peersCache.peers,
    });
  }
  await runScanAndBroadcast();
  res.json({
    ok: true,
    updatedAt: peersCache.updatedAt,
    peers: peersCache.peers,
    nextAllowedAt: peersCache.nextAllowedAt,
  });
});

// --- Socket.IO: beim Connect den aktuellen Stand pushen + Refresh anfordern ---
io.on('connection', (socket) => {
  socket.emit('peers-updated', { peers: peersCache.peers, updatedAt: peersCache.updatedAt });
  socket.on('peers:refresh', async () => {
    if (!canScanNow()) {
      socket.emit('peers-cooldown', {
        retryIn: Math.max(0, peersCache.nextAllowedAt - Date.now()),
        nextAllowedAt: peersCache.nextAllowedAt
      });
      return;
    }
    await runScanAndBroadcast(); // überschreibt Cache & broadcastet an alle
  });
});

// --- Initial: einmal scannen und danach alle 30s ---
// (async () => {
//   await runScanAndBroadcast();                    // sofort
//   setInterval(runScanAndBroadcast, SCAN_INTERVAL_MS); // periodisch
// })();

// scan on user demand only
async function runScanAndBroadcast() {
  const peers = await scanPeers();
  peersCache.peers = peers;
  peersCache.updatedAt = Date.now();
  // Cooldown *jetzt* setzen (nach Erfolg)
  peersCache.nextAllowedAt = Date.now() + SCAN_INTERVAL_MS;

  io.emit('peers-updated', { peers, updatedAt: peersCache.updatedAt });
}

// END

// Server start
server.listen(PORT, () => console.log(`[server] listening on :${PORT}`));
