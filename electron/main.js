/* -----------------------------------------------------------
 *  Electron main‑process  •  Meet_Note
 * ----------------------------------------------------------- */
const { app, BrowserWindow, ipcMain } = require('electron');
const path   = require('path');
const { spawn, execSync } = require('child_process');
const os     = require('os');
const net    = require('net');



const PORT = 6060;
let win;                    // BrowserWindow‑Instanz
let serverProc = null;      // Kindprozess (node server.js)
let serverReady = false;    // wurde „🌐 http://…“ ausgegeben?

/* --------------------------------- Helpers ----------------- */
function getIp() {
  return (
    Object.values(os.networkInterfaces())
      .flat()
      .find(i => i.family === 'IPv4' && !i.internal)?.address || 'localhost'
  );
}

// const getIp = require('../server/server.js').getRealLocalIp;



function portFree(port) {
  return new Promise(res => {
    const t = net
      .createServer()
      .once('error', () => res(false))
      .once('listening', () => t.close(() => res(true)))
      .listen(port);
  });
}

/* 🔪  Reste alter server.js‑Prozesse killen (dev‑Modus) */
function killOldServer() {
  try {
    if (process.platform === 'win32') {
      const pids = execSync(
        'wmic process where "CommandLine like \'%server\\\\server.js%\'" get ProcessId /format:list'
      )
        .toString()
        .match(/\d+/g) || [];
      pids.forEach(pid => execSync(`taskkill /PID ${pid} /F`));
    } else {
      execSync('pkill -f server/server.js');
    }
    if (pids?.length) console.log('🗑️  Alte server.js‑Instanzen beendet:', pids.join(', '));
  } catch {
    /* none */
  }
}

/* --------------------------------- IPC --------------------- */
ipcMain.handle('start-server', async () => {
  killOldServer();                        // vorher aufräumen

  if (serverReady) return { ip: getIp(), port: PORT }; // läuft schon
  if (serverProc)  return { ip: getIp(), port: PORT }; // bootet gerade

  if (!(await portFree(PORT))) {                        // Port wirklich frei?
    console.log('⚠️  Port 6060 schon belegt – überspringe Spawn');
    serverReady = true;
    return { ip: getIp(), port: PORT };
  }

  /* ---- Spawn ------------------------------------------------ */
  serverProc = spawn('node', ['server/server.js'], {
    stdio: ['ignore', 'pipe', 'pipe']      // stdout & stderr als Stream
  });

  return new Promise((resolve, reject) => {
    /* stdout überwachen */
    serverProc.stdout.on('data', buf => {
      const line = buf.toString().trim();
      console.log('[Express]', line);
      if (line.includes('http://')) {
        serverReady = true;
        resolve({ ip: getIp(), port: PORT });
      }
    });

    /* stderr überwachen */
    serverProc.stderr.on('data', buf => {
      const err = buf.toString().trim();
      console.error('[Express‑ERR]', err);
      if (err.includes('EADDRINUSE')) {
        serverProc.kill();
        serverProc = null;
        reject(new Error('Port already in use'));
      }
    });

    serverProc.on('exit', code => {
      if (!serverReady) reject(new Error('Server exited with code ' + code));
    });

    /* Timeout (10 s) */
    setTimeout(() => {
      if (!serverReady) {
        serverProc.kill();
        serverProc = null;
        reject(new Error('Server start timeout'));
      }
    }, 10000);
  });
});

/* URL‑Wechsel */
ipcMain.handle('open-url', (_e, url) => {
  if (win) win.loadURL(url);
});

/* --------------------------------- Fenster ----------------- */
function createWin() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, '../launcher/launcher.html'));
}

app.whenReady().then(createWin);

app.on('window-all-closed', () => {
  if (serverProc) serverProc.kill();
  if (process.platform !== 'darwin') app.quit();
});
