// const { app, BrowserWindow } = require('electron');
// const path = require('path');
// const { exec } = require('child_process');
// const net = require('net');
// require('dotenv').config(); // .env laden

// const PORT = process.env.PORT || 6060;
// const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js')
//     }
//   });
//   win.loadURL(FRONTEND_URL);
// }

// // Prüft, ob der Server auf dem Port schon läuft
// function isPortAvailable(port, callback) {
//   const tester = net.createServer()
//     .once('error', err => (err.code === 'EADDRINUSE' ? callback(false) : callback(false)))
//     .once('listening', () => tester.close(() => callback(true)))
//     .listen(port);
// }

// app.whenReady().then(() => {
//   isPortAvailable(PORT, (available) => {
//     if (available) {
//       console.log(`⚡ Starte lokalen Server auf Port ${PORT}...`);
//       exec('npm run dev', (error, stdout, stderr) => {
//         if (error) {
//           console.error(`❗ Fehler beim Starten des Servers: ${error.message}`);
//           return;
//         }
//       });
//     } else {
//       console.log(`✅ Server bereits aktiv auf Port ${PORT}`);
//     }
//     createWindow();
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const PORT = process.env.PORT || 6060;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadURL(FRONTEND_URL);
}

function isPortAvailable(port, callback) {
  const net = require('net');
  const tester = net.createServer()
    .once('error', err => (err.code === 'EADDRINUSE' ? callback(false) : callback(false)))
    .once('listening', () => tester.close(() => callback(true)))
    .listen(port);
}

app.whenReady().then(() => {
  isPortAvailable(PORT, (available) => {
    if (available) {
      console.log(`⚡ Starte lokalen Server auf Port ${PORT}...`);
      exec('npm run dev');
    } else {
      console.log(`✅ Server läuft bereits auf Port ${PORT}`);
    }
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

