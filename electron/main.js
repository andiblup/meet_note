/* -----------------------------------------------------------
 *  Electron main‑process  •  Meet_Note
 * ----------------------------------------------------------- */
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');
const net = require('net');
const fs = require('fs');
// const { log } = require('console');
const log = require('../utils/logger.js');
// const ora = require('ora');
// const dotenv = require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings', 'settings.json');

// const PORT = 6060;
// const PORT = dotenv.parsed.PORT || 6060; // Port aus .env oder 6060
const PORT = process.env.PORT || 6060; // Port aus .env oder 6060
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

// read settings from /data/settings/settings.json

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


function readSettings() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings', 'settings.json'), 'utf8'));
    } catch {
        return { theme: 'light', autosave: 5000 };
    }
}

/* --------------------------------- IPC --------------------- */

// ipcMain.handle('get-settings', () => {
//   return readSettings();
// });

// ipcMain.handle('save-settings', (_evt, settings) => {
//   const SETTINGS_FILE = path.join(__dirname,'..','data','settings','settings.json');
//   fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings,null,2),'utf8');
//   return { ok:true };
// });

// SETTING

ipcMain.handle('get-settings', () => {
    return readSettings(); // liest settings.json
});
ipcMain.handle('save-settings', (_evt, settings) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return { ok: true };
});

// View Handling

ipcMain.handle('goto-home', () => {
    killOldServer(); // vorher aufräumen
    serverReady = false; // Server nicht bereit
    if (serverProc) serverProc.kill(); // alten Prozess kill
    serverProc = null; // alten Prozess auf null setzen

    win.loadFile(path.join(__dirname, '..', 'launcher', 'launcher.html'));
});


// SERVER

ipcMain.handle('start-server', async () => {
    killOldServer();                        // vorher aufräumen

    if (serverReady) return { ip: getIp(), port: PORT }; // läuft schon
    if (serverProc) return { ip: getIp(), port: PORT }; // bootet gerade

    // const spin = ora({
    //     text: 'Starting Express server …',
    //     spinner: 'dots'           // oder 'bouncingBar', 'moon', …
    // }).start();

    if (!(await portFree(PORT))) {                        // Port wirklich frei?
        // console.log('⚠️  Port 6060 schon belegt – überspringe Spawn');
        log.warn('Port 6060 schon belegt - überspringe Spawn');
        // spin.warn('Port 6060 schon belegt - überspringe Spawn');
        serverReady = true;
        return { ip: getIp(), port: PORT };
    }


    /* ---- Spawn ------------------------------------------------ */
    serverProc = spawn('node', ['server/server.js'], {
        stdio: ['ignore', 'pipe', 'pipe'],      // stdout & stderr als Stream
        env: { ...process.env, FORCE_COLOR: '1' }
    });

    // serverProc.stdout.pipe(process.stdout);

    return new Promise((resolve, reject) => {

        let readyLogged = false;
        /* stdout überwachen */
        serverProc.stdout.on('data', buf => {
            const line = buf.toString().trim();
            // console.log('[Express]', line);
            // log.ok(line.replace('✔', '🌐'));   // z.B. [Express] 20:50:26 🌐 Server started …
            // log.raw(`[Express] ${line.replace('', '')}`);
            // if (line.includes('Server started')) {
            if (!readyLogged) {
                // spin.succeed(' Server ready');
                // spin.succeed(' Server ready');
                log.raw(`[Express] ${line}`);
                // log.ok(line.replace('✔', '🌐'))

                serverReady = true;
                readyLogged = true;
                resolve({ ip: getIp(), port: PORT });
                return;
                // if (line.includes('http://')) {
                //     serverReady = true;
                //     resolve({ ip: getIp(), port: PORT });
                // }
            }
            if (readyLogged) {                     // alles danach
                log.raw(`[Express] ${line}`);
            }
        });

        /* stderr überwachen */
        serverProc.stderr.on('data', buf => {
            const err = buf.toString().trim();
            // console.error('[Express‑ERR]', err);
            // spin.fail('Server error ❌');
            log.err('Server error ❌');
            console.error('[Express-ERR]', err);
            if (err.includes('EADDRINUSE')) {
                serverProc.kill();
                serverProc = null;
                reject(new Error('Port already in use'));
            }
        });

        serverProc.on('exit', code => {
            if (!serverReady) {
                // spin.fail('Server exited');
                log.err('Server exited');
                reject(new Error('Server exited with code ' + code));
            }
        });

        /* Timeout (10 s) */
        setTimeout(() => {
            if (!serverReady) {
                serverProc.kill();
                serverProc = null;
                // spin.fail('Server start timeout');
                log.err('Server start timeout');
                reject(new Error('Server start timeout'));
            }
        }, 10000);
    });
});

/* URL‑Wechsel */
ipcMain.handle('open-url', (_e, url) => {

    const needsFrame = !url.includes(':6060')

    if (needsFrame && !win.isFramed) {
        const { width, height } = win.getBounds(); // Größe übernehmen

        const newWin = new BrowserWindow({
            width,
            height,
            frame: true,
            resizable: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        newWin.loadURL(url);

        win.destroy();            // altes Fenster schließen
        win = newWin;             // Referenz austauschen
        win.isFramed = true;      // neue Markierung
    } else {
        // Port 6060 → einfach im bestehenden Fenster laden
        win.loadURL(url);
    }


    // if (win) {

    //     if (!url.includes(':')){

    //         win.frame = true;
    //         win.autoHideMenuBar = true;
    //         // win.setMenuBarVisibility(true);
    //         // win.setFrame(true);

    //         win = new BrowserWindow({
    //             width: 1200,
    //             height: 800,
    //             frame: true,
    //             resizable: true,
    //             autoHideMenuBar: true,
    //             webPreferences: {
    //                 preload: path.join(__dirname, 'preload.js'),
    //                 contextIsolation: true,
    //                 nodeIntegration: false
    //             }
    //         });

    //     }
    //     win.loadURL(url);

    // }
});

/* --------------------------------- Fenster ----------------- */
function createWin() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        resizable: true,
        // autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    win.loadFile(path.join(__dirname, '../launcher/launcher.html'));

    // const template = [
    //     {
    //       label: 'Datei',
    //       submenu: [
    //         { label: 'Neu', accelerator: 'CmdOrCtrl+N', click: () => win.webContents.send('menu-new') },
    //         { label: 'Öffnen…', accelerator: 'CmdOrCtrl+O', click: () => win.webContents.send('menu-open') },
    //         { label: 'Speichern', accelerator: 'CmdOrCtrl+S', click: () => win.webContents.send('menu-save') },
    //         { label: 'Alle speichern', accelerator: 'CmdOrCtrl+Shift+S', click: () => win.webContents.send('menu-save-all') },
    //         { type: 'separator' },
    //         { role: 'close', accelerator: 'CmdOrCtrl+W' }
    //       ]
    //     },
    //     {
    //       label: 'Bearbeiten',
    //       submenu: [
    //         { role: 'undo',       accelerator: 'CmdOrCtrl+Z' },
    //         { role: 'redo',       accelerator: 'CmdOrCtrl+Y' },
    //         { type: 'separator' },
    //         { role: 'cut',        accelerator: 'CmdOrCtrl+X' },
    //         { role: 'copy',       accelerator: 'CmdOrCtrl+C' },
    //         { role: 'paste',      accelerator: 'CmdOrCtrl+V' },
    //         { role: 'selectAll',  accelerator: 'CmdOrCtrl+A' },
    //         { type: 'separator' },
    //         { label: 'Finden',    accelerator: 'CmdOrCtrl+F', click: () => win.webContents.send('menu-find') },
    //       ]
    //     },
    //     {
    //       label: 'Ansicht',
    //       submenu: [
    //         { role: 'togglefullscreen', accelerator: 'F11' },
    //         { role: 'toggledevtools',   accelerator: 'F12' },
    //         { role: 'reload',           accelerator: 'CmdOrCtrl+R' }
    //       ]
    //     }
    //   ];
    //   Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12' && input.type === 'keyDown') {
            win.webContents.toggleDevTools();
            event.preventDefault();
        }
    });
}

// app.whenReady().then(createWin);
app.whenReady().then(() => {
    createWin();

    // Variante B: als globalShortcut
    globalShortcut.register('F12', () => {
        const currWin = BrowserWindow.getFocusedWindow();
        if (currWin) currWin.webContents.toggleDevTools();
    });
});

// app.on('will-quit', () => {
//     globalShortcut.unregisterAll();
// });

app.on('window-all-closed', () => {
    if (serverProc) serverProc.kill();
    if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('window-minimize', e => e.sender.getOwnerBrowserWindow().minimize());
ipcMain.on('window-toggle-max', e => {
    const w = e.sender.getOwnerBrowserWindow();
    w.isMaximized() ? w.unmaximize() : w.maximize();
});
ipcMain.on('window-close', e => e.sender.getOwnerBrowserWindow().close());
ipcMain.on('window-toggle-full', e => {
    const w = e.sender.getOwnerBrowserWindow();
    w.setFullScreen(!w.isFullScreen());
});