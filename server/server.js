// require('dotenv').config(); // .env laden

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const { log } = require('console');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   path: process.env.SOCKET_PATH || '/socket.io'
// });
// const notesDir = path.join(__dirname, '../data/notes');

// // Statische Dateien aus /public bereitstellen
// app.use(express.static(path.join(__dirname, '../public')));

// // Websocket Logik
// io.on('connection', (socket) => {
//   console.log('✅ Client verbunden');

//   socket.on('disconnect', () => {
//     console.log('⚡ Client getrennt');
//   });
// });

// // Port aus .env oder 6060 nehmen
// const PORT = process.env.PORT || 6060;
// // const HOST = process.env.HOST || 'localhost';



// // Nach dem Speichern Broadcast an alle
// app.post('/save', (req, res) => {
//   const { id, content } = req.body;
//   const filePath = path.join(notesDir, `${id}.json`);
//   fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
//   io.emit('update'); // 👉 Alle Clients benachrichtigen
//   res.json({ status: 'ok' });
// });

// // Alle Dateien als Inhalte laden
// app.get('/load', (req, res) => {
//   const files = fs.readdirSync(notesDir);
//   const notes = files.map(file => {
//     const content = fs.readFileSync(path.join(notesDir, file));
//     return { id: path.basename(file, '.json'), content: JSON.parse(content) };
//   });
//   res.json(notes);
// });

// // Alle Dateinamen laden
// app.get('/files', (req, res) => {
//   const files = fs.readdirSync(notesDir).map(f => path.basename(f, '.json'));
//   res.json(files);
// });

// // Einzelne Datei laden
// app.get('/file/:id', (req, res) => {
//   const filePath = path.join(notesDir, `${req.params.id}.json`);
//   if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

//   const content = JSON.parse(fs.readFileSync(filePath));
//   res.json(content);
// });

// // Neue Datei anlegen
// app.post('/file', (req, res) => {
//   const { id } = req.body;
//   const filePath = path.join(notesDir, `${id}.json`);
//   if (fs.existsSync(filePath)) {
//     return res.status(400).json({ error: 'Datei existiert bereits' });
//   }

//   fs.writeFileSync(filePath, '[]'); // leeres Array für neue Notiz
//   io.emit('update'); // Clients informieren
//   res.json({ status: 'created' });
// });

// // Datei umbenennen
// app.post('/rename', (req, res) => {
//   const { oldName, newName } = req.body;
//   const oldPath = path.join(notesDir, `${oldName}.json`);
//   const newPath = path.join(notesDir, `${newName}.json`);

//   if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'Alte Datei nicht gefunden' });
//   if (fs.existsSync(newPath)) return res.status(400).json({ error: 'Zielname existiert bereits' });

//   fs.renameSync(oldPath, newPath);
//   io.emit('update'); // Clients informieren
//   res.json({ status: 'renamed' });
// });

// app.delete('/file/:id', (req, res) => {
//   const filePath = path.join(notesDir, `${req.params.id}.json`);
//   if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Datei nicht gefunden' });

//   fs.unlinkSync(filePath);
//   io.emit('update'); // Clients informieren
//   res.json({ status: 'deleted' });
// });


// function getRealLocalIp() {
//   const interfaces = os.networkInterfaces();
//   const preferred = ['Wi-Fi', 'WLAN', 'LAN', 'Ethernet'];

//   for (const [name, infos] of Object.entries(interfaces)) {
//     if (!preferred.some(word => name.toLowerCase().includes(word.toLowerCase()))) continue;

//     for (const info of infos) {
//       if (info.family === 'IPv4' && !info.internal) {
//         return info.address;
//       }
//     }
//   }

//   // Falls nichts unter bevorzugten Adaptern gefunden: irgendeine private IP nehmen
//   const fallback = Object.values(interfaces).flat()
//     .find(i => i.family === 'IPv4' && !i.internal && (
//       i.address.startsWith('192.') ||
//       i.address.startsWith('10.') ||
//       i.address.startsWith('172.')
//     ));

//   return fallback?.address || 'localhost';
// }
// const ip = getRealLocalIp();

// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`🌐 Server läuft auf: http://${ip}:${PORT}`);
// });

// // server.listen(PORT, () => {
// //   console.log(`🌐 Server läuft auf http://${HOST}:${PORT}`);
// // });









// // Load environment variables
// require('dotenv').config();

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const path = require('path');

// // Setup Express
// const app = express();
// const server = http.createServer(app);

// // Setup Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: '*', // Allow all origins (optional: restrict later if needed)
//   }
// });

// // Load static files from /public
// app.use(express.static(path.join(__dirname, '../public')));
// app.use(cors());
// app.use(express.json());

// // Basic Route for testing
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'));
// });

// // --- SOCKET.IO LOGIC ---
// io.on('connection', (socket) => {
//   console.log('✅ Client verbunden:', socket.id);

//   // Handle editor changes live
//   socket.on('editor-update', (data) => {
//     socket.broadcast.emit('editor-update', data);
//   });

//   // Handle save events (currently just log, later file storage)
//   socket.on('editor-save', (data) => {
//     console.log('💾 Save Event empfangen:', data);
//     // TODO: Optionale Speicherung auf dem Server
//   });

//   socket.on('disconnect', () => {
//     console.log('⚡ Client getrennt:', socket.id);
//   });
// });

// // --- SERVER START ---
// const PORT = process.env.PORT || 6060;
// server.listen(PORT, () => {
//   console.log(`🌐 Server läuft auf http://localhost:${PORT}`);
// });


// const settingsController = require('./controller/settingsController');

// app.get('/api/settings', settingsController.getSettings);
// app.post('/api/settings', settingsController.saveSettings);





// /server/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const socketHandler = require('./socket/socketHandler');

const settingsRoutes = require('./routes/settingsRoutes');
const notesRoutes = require('./routes/notesRoutes');
const infoRoutes = require('./routes/infoRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/info', infoRoutes);

// SPA fallback (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// WebSocket
socketHandler(io);

const getRealLocalIp = require('./utils/getRealLocalIp');

// Server starten auf lokaler IP
const PORT = process.env.PORT || 6060;
const HOST = getRealLocalIp();

server.listen(PORT, HOST, () => {
  console.log(`🌐 Server läuft auf: http://${HOST}:${PORT}`);
});
