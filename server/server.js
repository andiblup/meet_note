const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const os = require('os');

const PORT = 6060;
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const srv = http.createServer(app);
const io = new Server(srv, { cors: { origin: '*' } });

/* ---------- API ---------- */
app.get('/api/files', (_req, res) => {
  const files = fs.readdirSync(dataDir).map(f => path.basename(f, '.json'));
  res.json(files);
});
app.get('/api/file/:id', (req, res) => {
  const f = path.join(dataDir, `${req.params.id}.json`);
  if (!fs.existsSync(f)) return res.status(404).json({ error: 'not found' });
  res.json(JSON.parse(fs.readFileSync(f)));
});
app.post('/api/file/:id', (req, res) => {
  fs.writeFileSync(path.join(dataDir, `${req.params.id}.json`),
    JSON.stringify(req.body, null, 2));
  io.emit('file-updated', req.params.id);
  res.json({ status: 'ok' });
});
app.get('/api/info', (_q, res) => {
  res.json({ ip: IP, port: PORT, status: 'online', version: '0.1.0' });
});

/* ---------- Socket.IO ---------- */
io.on('connection', socket => {
  const addr = socket.handshake.address;        // IP des Clients
  const time = new Date().toLocaleTimeString(); // HH:MM:SS

  console.log(`[${time}] 🔵 Client joined  ${addr}  id:${socket.id}`);

  socket.on('disconnect', reason => {
    const t = new Date().toLocaleTimeString();
    console.log(`[${t}] 🔴 Client left    ${addr}  reason:${reason}`);
  });
});

/**
 * Get the best available private local IP (192/10/172).
 * Falls nichts gefunden wird, fallback auf 'localhost'
 */
function getRealLocalIp() {
  const interfaces = os.networkInterfaces();
  const preferred = ['Wi-Fi', 'WLAN', 'LAN', 'Ethernet'];

  for (const [name, infos] of Object.entries(interfaces)) {
    if (!preferred.some(word => name.toLowerCase().includes(word.toLowerCase()))) continue;

    for (const info of infos) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address;
      }
    }
  }

  // Falls nichts unter bevorzugten Adaptern gefunden: irgendeine private IP nehmen
  const fallback = Object.values(interfaces).flat()
    .find(i => i.family === 'IPv4' && !i.internal && (
      i.address.startsWith('192.') ||
      i.address.startsWith('10.') ||
      i.address.startsWith('172.')
    ));

  return fallback?.address || 'localhost';
}
const IP = getRealLocalIp();

/* ---------- Start ---------- */
srv.listen(PORT, '0.0.0.0', () => console.log(`🌐 http://${IP}:${PORT}`));
