// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const os = require('os');

// const PORT = 6060;
// const dataDir = path.join(__dirname, '../data');
// if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, '../public')));

// const srv = http.createServer(app);
// const io = new Server(srv, { cors: { origin: '*' } });

// /* ---------- API ---------- */
// // ---- Files ----------------------------------------------
// app.get('/api/files', (_req, res) => {
//   const files = fs.readdirSync(dataDir).map(f => path.basename(f, '.json'));
//   res.json(files);
// });
// app.get('/api/file/:id', (req, res) => {
//   const f = path.join(dataDir, `${req.params.id}.json`);
//   if (!fs.existsSync(f)) return res.status(404).json({ error: 'not found' });
//   res.json(JSON.parse(fs.readFileSync(f)));
// });
// app.post('/api/file/:id', (req, res) => {
//   fs.writeFileSync(path.join(dataDir, `${req.params.id}.json`),
//     JSON.stringify(req.body, null, 2));
//   io.emit('file-updated', req.params.id);
//   res.json({ status: 'ok' });
// });
// app.get('/api/info', (_q, res) => {
//   res.json({ ip: IP, port: PORT, status: 'online', version: '0.1.0' });
// });

// // ---- Settings ----------------------------------------------
// app.get('/api/settings', (_req, res) => {
//   try {
//     const raw = fs.readFileSync(settingsFile, 'utf8');
//     res.json(JSON.parse(raw));
//   } catch {
//     res.json({ theme: 'light', autosave: 1000 });   // Fallback defaults
//   }
// });

// app.post('/api/settings', (req, res) => {
//   fs.writeFileSync(settingsFile, JSON.stringify(req.body, null, 2));
//   io.emit('settings-updated', req.body);            // Live‑Push
//   res.json({ status: 'ok' });
// });
// const ora = require('ora');
// const cliSpinners = require('cli-spinners');
// const spinner = ora({ text:'Build …', spinner:cliSpinners.dots }).start();
const log = require('../utils/logger.js');
// const ora = require('ora');
/* ------------------------------------------------------------------
 *  Meet_Note ‑ Express + Socket.IO Back‑End  (server/server.js)
 * -----------------------------------------------------------------*/
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

/* ---------- Verzeichnisse / Konstanten --------------------------- */
const PORT = 6060;
const DATA_ROOT = path.join(__dirname, '..', 'data');
const NOTES_DIR = path.join(DATA_ROOT, 'notes');
const SETTINGS_DIR = path.join(DATA_ROOT, 'settings');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

/* Ordner sicherstellen */
[DATA_ROOT, NOTES_DIR, SETTINGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* ---------- Express Grundsetup ---------------------------------- */
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });



/* =================================================================
 *  NOTES  – CRUD  (eine Datei == ein JSON‑Array aus Blöcken)
 * =================================================================*/

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

/* =================================================================
 *  FILES  – CRUD  (eine Datei == ein JSON‑Array aus Blöcken)
 * =================================================================*/
app.get('/api/files', (_req, res) => {
    const list = fs.readdirSync(NOTES_DIR).map(f => path.basename(f, '.json'));
    res.json(list);
});

app.get('/api/file/:id', (req, res) => {
    const file = path.join(NOTES_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'not found' });
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
});

app.post('/api/file/:id', (req, res) => {
    fs.writeFileSync(
        path.join(NOTES_DIR, `${req.params.id}.json`),
        JSON.stringify(req.body, null, 2)
    );
    io.emit('file-updated', req.params.id);

    // RTP: alle Clients benachrichtigen
    io.emit('file-list-changed');
    res.json({ status: 'ok' });
});

// app.put('/api/file/:id/rename', (req, res) => {
//   const oldPath = path.join(NOTES_DIR, `${req.params.id}.json`);
//   const newPath = path.join(NOTES_DIR, `${req.body.newId}.json`);
//   fs.renameSync(oldPath, newPath);
//   io.emit('file-list-changed');
//   res.json({ status:'renamed' });
// });
app.put('/api/file/:id', (req, res) => {
    const oldId = req.params.id;
    const newId = req.body._rename;
    const oldPath = path.join(NOTES_DIR, `${oldId}.json`);
    const newPath = path.join(NOTES_DIR, `${newId}.json`);

    if (!fs.existsSync(oldPath)) {
        return res.status(404).json({ error: 'not found' });
    }
    if (fs.existsSync(newPath)) {
        return res.status(409).json({ error: 'target exists' });
    }

    fs.renameSync(oldPath, newPath);
    // Benachrichtige Clients
    io.emit('file-updated', newId);
    io.emit('file-deleted', oldId);
    
    // RTP: alle Clients benachrichtigen
    io.emit('file-list-changed');
    res.json({ status: 'renamed', from: oldId, to: newId });
});

app.delete('/api/file/:id', (req, res) => {
    const file = path.join(NOTES_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'not found' });
    fs.unlinkSync(file);
    io.emit('file-deleted', req.params.id);
    
    // RTP: alle Clients benachrichtigen
    io.emit('file-list-changed');
    res.json({ status: 'deleted' });
});

/* =================================================================
 *  SETTINGS  – global persistentes JSON‑Objekt
 * =================================================================*/
const DEFAULT_SETTINGS = { theme: 'light', autosave: 5000, primaryColor: '#FF422AD5', tabSize: 4 };

function readSettings() {
    try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
    catch { return DEFAULT_SETTINGS; }
}

app.get('/api/settings', (_req, res) => {
    res.json(readSettings());
});

app.post('/api/settings', (req, res) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    io.emit('settings-updated', req.body);      // Live‑Push an Clients
    res.json({ status: 'ok' });
});

/* ---------- Zusatzinfo für Client ------------------------------- */
app.get('/api/info', (_rq, res) => {
    res.json({ ip: getRealLocalIp(), port: PORT, status: 'online', version: '0.1.0' });
});

/* =================================================================
 *  SOCKET.IO  – Join / Leave Log
 * =================================================================*/
io.on('connection', socket => {
    const addr = socket.handshake.address;
    // log.ok(` Client joined 🌐 ${addr}  id:${socket.id}`);
    log.ok(` Client joined 🌐 ${addr}  id:${socket.id}`);
    // const spinner = ora({text: ` Client joined 🌐 ${addr}  id:${socket.id}`, spinner: 'dots' }).start() 
    // spinner.succeed(` Client joined 🌐 ${addr}  id:${socket.id}`);

    socket.on('disconnect', reason => {
        // log.err(` Client left   🚫 ${addr}  reason:${reason}`);
        log.err(` Client left   🚫 ${addr}  reason:${reason}`);
        // const spinner = ora({text: ` Client left 🚫 ${addr}  id:${socket.id}`, spinner: 'dots' }).start() 
        // spinner.fail(` Client left   🚫 ${addr}  id:${socket.id}`);
    });
    // const time = new Date().toLocaleTimeString();
    // console.log(`[${time}] 🔵 Client joined  ${addr}  id:${socket.id}`);

    // socket.on('disconnect', reason => {
    //     const t = new Date().toLocaleTimeString();
    //     console.log(`[${t}] 🔴 Client left    ${addr}  reason:${reason}`);
    // });
});

/* ---------- Hilfs‑Funktionen ----------------------------------- */
function getRealLocalIp() {
    const nets = os.networkInterfaces();
    const preferred = ['Wi-Fi', 'WLAN', 'LAN', 'Ethernet'];

    /* bevorzugte Adapter */
    for (const [name, infos] of Object.entries(nets)) {
        if (!preferred.some(w => name.toLowerCase().includes(w.toLowerCase()))) continue;
        for (const info of infos) {
            if (info.family === 'IPv4' && !info.internal) return info.address;
        }
    }
    /* Fallback irgendeine private IP */
    const any = Object.values(nets).flat().find(
        i => i.family === 'IPv4' && !i.internal &&
            (i.address.startsWith('192.') || i.address.startsWith('10.') || i.address.startsWith('172.'))
    );
    return any?.address || 'localhost';
}


/* ---------- Start ---------------------------------------------- */
server.listen(PORT, '0.0.0.0', () => {
    // console.log(`Server started at: http://${getRealLocalIp()}:${PORT}`)
    // log.ok(` Server started at: http://${getRealLocalIp()}:${PORT}`)
    // log.ok(` Server started at: http://${getRealLocalIp()}:${PORT}`)
    log.ok(` Server started at: http://${getRealLocalIp()}:${PORT}`)
    // console.log(` Server started at: http://${getRealLocalIp()}:${PORT}`)
    // log.info(`ANANAS`)


});
