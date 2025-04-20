// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// const app = express();
// const PORT = 3000;
// const notesDir = path.join(__dirname, 'notes');

// if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir);

// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.json());

// // Datei speichern
// app.post('/save', (req, res) => {
//   const { id, content } = req.body;
//   const filePath = path.join(notesDir, `${id}.json`);
//   fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
//   res.json({ status: 'ok' });
// });

const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { log } = require('console');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3333;
const notesDir = path.join(__dirname, 'notes');

// console.log(os.networkInterfaces()["WLAN 2"][0].address);


if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.on('connection', (socket) => {
  console.log('🔌 Neuer Client verbunden');

  socket.on('disconnect', () => {
    console.log('❌ Client getrennt');
  });
});

// Nach dem Speichern Broadcast an alle
app.post('/save', (req, res) => {
  const { id, content } = req.body;
  const filePath = path.join(notesDir, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  io.emit('update'); // 👉 Alle Clients benachrichtigen
  res.json({ status: 'ok' });
});

// Alle Dateien als Inhalte laden
app.get('/load', (req, res) => {
  const files = fs.readdirSync(notesDir);
  const notes = files.map(file => {
    const content = fs.readFileSync(path.join(notesDir, file));
    return { id: path.basename(file, '.json'), content: JSON.parse(content) };
  });
  res.json(notes);
});

// Alle Dateinamen laden
app.get('/files', (req, res) => {
  const files = fs.readdirSync(notesDir).map(f => path.basename(f, '.json'));
  res.json(files);
});

// Einzelne Datei laden
app.get('/file/:id', (req, res) => {
  const filePath = path.join(notesDir, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

  const content = JSON.parse(fs.readFileSync(filePath));
  res.json(content);
});

// Neue Datei anlegen
app.post('/file', (req, res) => {
  const { id } = req.body;
  const filePath = path.join(notesDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Datei existiert bereits' });
  }

  fs.writeFileSync(filePath, '[]'); // leeres Array für neue Notiz
  io.emit('update'); // Clients informieren
  res.json({ status: 'created' });
});

// Datei umbenennen
app.post('/rename', (req, res) => {
  const { oldName, newName } = req.body;
  const oldPath = path.join(notesDir, `${oldName}.json`);
  const newPath = path.join(notesDir, `${newName}.json`);

  if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'Alte Datei nicht gefunden' });
  if (fs.existsSync(newPath)) return res.status(400).json({ error: 'Zielname existiert bereits' });

  fs.renameSync(oldPath, newPath);
  io.emit('update'); // Clients informieren
  res.json({ status: 'renamed' });
});

// Datei löschen
// app.delete('/file/:id', (req, res) => {
//   const filePath = path.join(notesDir, `${req.params.id}.json`);
//   if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Datei nicht gefunden' });

//   fs.unlinkSync(filePath);
//   res.json({ status: 'deleted' });
// });
app.delete('/file/:id', (req, res) => {
  const filePath = path.join(notesDir, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Datei nicht gefunden' });

  fs.unlinkSync(filePath);
  io.emit('update'); // Clients informieren
  res.json({ status: 'deleted' });
});

// Server starten mit lokaler IP
// app.listen(PORT, () => {
//   const ip = Object.values(os.networkInterfaces())
//     .flat()
//     .find(i => i.family === 'IPv4' && !i.internal)?.address;

//   console.log(`🌐 Server läuft auf: http://${ip || 'localhost'}:${PORT}`);
// });

// function getLocalIps() {
//   const nets = Object.values(os.networkInterfaces()).flat();
//   const addresses = nets
//     .filter(i =>
//       i.family === 'IPv4' &&
//       !i.internal &&
//       (i.address.startsWith('192.') || i.address.startsWith('172.') || i.address.startsWith('10.'))
//     )
//     .map(i => i.address);
//   return addresses.length > 0 ? addresses : ['localhost'];
// }




// server.listen(PORT, '0.0.0.0', () => {
//   // const ip = Object.values(os.networkInterfaces())
//   //   .flat()
//   //   .find(i => i.family === 'IPv4' && !i.internal)?.address;

//   // const ip = getLocalIp();
    
//   console.log(`🌐 Server läuft auf: http://${ip || 'localhost'}:${PORT}`);
// });
// const ips = getLocalIps();
// server.listen(PORT, '0.0.0.0', () => {
//   console.log('🌐 Server erreichbar unter:');
//   ips.forEach(ip => console.log(`→ http://${ip}:${PORT}`));
// });

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
const ip = getRealLocalIp();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server läuft auf: http://${ip}:${PORT}`);
});
