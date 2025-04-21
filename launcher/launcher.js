// launcher/launcher.js
// window.addEventListener('DOMContentLoaded', async () => {
//     // 1) Lade Settings via IPC
//     const settings = await window.electronAPI.getSettings();
//     const theme = settings.theme || 'light';
//     document.documentElement.setAttribute('data-theme', theme);
  
//     // Setze Toggle‑Checkbox entsprechend
//     const chkDark = document.getElementById('chkDark');
//     chkDark.checked = theme === 'dark';
  
//     const inpAutosave = document.getElementById('inpAutosave');
//     inpAutosave.value = settings.autosave || 5000;
  
//     // 2) Settings‑Drawer öffnen/schließen
//     document.getElementById('btnSettings').addEventListener('click', () => {
//       document.getElementById('settingsToggle').checked = true;
//     });
  
//     // 3) Wenn Theme wechselt, live im UI ändern
//     chkDark.addEventListener('change', () => {
//       const newTheme = chkDark.checked ? 'dark' : 'light';
//       document.documentElement.setAttribute('data-theme', newTheme);
//     });
  
//     // 4) Speichern‑Button
//     document.getElementById('btnSaveSettings').addEventListener('click', async () => {
//       const newSettings = {
//         theme: chkDark.checked ? 'dark' : 'light',
//         autosave: Number(inpAutosave.value) || 5000
//       };
//       await window.electronAPI.saveSettings(newSettings);
//       // Drawer schließen
//       document.getElementById('settingsToggle').checked = false;
//     });
  
//     // 5) Host / Join
//     document.getElementById('hostBtn').addEventListener('click', async () => {
//       const { ip, port } = await window.electronAPI.startServer();
//       window.electronAPI.openURL(`http://${ip}:${port}`);
//     });
//     document.getElementById('joinBtn').addEventListener('click', () => {
//       const addr = document.getElementById('joinIp').value.trim();
//       if (!addr) return alert('Bitte IP:Port eingeben!');
//       window.electronAPI.openURL(`http://${addr}`);
//     });
//   });

// In launcher.js (analog auch in editor.js)
window.addEventListener('DOMContentLoaded', async () => {
    const isElectron = !!window.electronAPI;
  
    // 1) Settings‑UI nur in Electron aktivieren
    if (isElectron) {
      document.getElementById('electronSettings').classList.remove('hidden');
      document.getElementById('btnSettings').classList.remove('hidden');
    } else {
      // Browser‑Fallback: Theme aus localStorage oder prefers-color-scheme
      const saved = localStorage.getItem('theme');
      const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
  
      // Einfacher Toggle im Browser
      document.getElementById('chkDark').checked = theme === 'dark';
      document.getElementById('chkDark').addEventListener('change', () => {
        const t = document.getElementById('chkDark').checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
      });
  
      // Verstecke Autosave‑Steuerung im Browser
      document.getElementById('inpAutosave').parentElement.classList.add('hidden');
      document.getElementById('btnSaveSettings').classList.add('hidden');
    }
  
    // 2) Wenn Electron, lade & speichere via IPC
    if (isElectron) {
      const settings = await window.electronAPI.getSettings();
      document.documentElement.setAttribute('data-theme', settings.theme);
      document.getElementById('chkDark').checked = settings.theme === 'dark';
      document.getElementById('inpAutosave').value = settings.autosave;
  
      document.getElementById('btnSettings').addEventListener('click', () => {
        document.getElementById('settingsToggle').checked = true;
      });
      document.getElementById('chkDark').addEventListener('change', () => {
        document.documentElement.setAttribute(
          'data-theme',
          document.getElementById('chkDark').checked ? 'dark' : 'light'
        );
      });
      document.getElementById('btnSaveSettings').addEventListener('click', async () => {
        const newSettings = {
          theme: document.getElementById('chkDark').checked ? 'dark' : 'light',
          autosave: Number(document.getElementById('inpAutosave').value) || 5000
        };
        await window.electronAPI.saveSettings(newSettings);
        document.getElementById('settingsToggle').checked = false;
      });
    }
  
    // 3) Host / Join
    document.getElementById('hostBtn').addEventListener('click', async () => {
        const { ip, port } = await window.electronAPI.startServer();
        window.electronAPI.openURL(`http://${ip}:${port}`);
      });
      document.getElementById('joinBtn').addEventListener('click', () => {
        const addr = document.getElementById('joinIp').value.trim();
        if (!addr) return alert('Bitte IP:Port eingeben!');
        window.electronAPI.openURL(`http://${addr}`);
      });
  });
  
  