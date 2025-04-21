// // /* Host */
// document.getElementById('hostBtn').addEventListener('click', async () => {
//     // const { ip, port } = await window.electronAPI.startServer();
//     // window.electronAPI.openURL(`http://${ip}:${port}`);

//     const hostBtn = document.getElementById('hostBtn');
//     hostBtn.disabled = true;          // Doppelklicks verhindern
//     const { ip, port } = await window.electronAPI.startServer().catch(e => {
//         alert('Server konnte nicht starten: ' + e.message);
//         hostBtn.disabled = false;
//     });
//     if (!ip) return;                  // Fehlerfall
//     window.electronAPI.openURL(`http://${ip}:${port}`);
// });

// /* Join */
// document.getElementById('joinBtn').addEventListener('click', () => {
//     const addr = document.getElementById('joinIp').value.trim();
//     if (!addr) return alert('IP:Port eingeben!');
//     window.electronAPI.openURL(`http://${addr}`);
// });






// window.addEventListener('DOMContentLoaded', async () => {
//     // Settings aus Main holen
//     const settings = await window.electronAPI.getSettings();
//     // Dark/Light/DaisyUI-Theme setzen
//     document.documentElement.setAttribute('data-theme', settings.theme || 'light');
// });

// hostBtn.addEventListener('click', async () => {
//     hostBtn.disabled = true;
//     try {
//         const { ip, port } = await window.electronAPI.startServer();
//         window.electronAPI.openURL(`http://${ip}:${port}`);
//     } catch (err) {
//         alert('Server konnte nicht starten:\n' + err.message);
//         hostBtn.disabled = false;
//     }
// });

// document.getElementById('joinBtn').addEventListener('click', () => {
//     const addr = document.getElementById('joinIp').value.trim();
//     if (addr) window.electronAPI.openURL(`http://${addr}`);
// });



// launcher/launcher.js
window.addEventListener('DOMContentLoaded', async () => {
    // 1) Lade Settings via IPC
    const settings = await window.electronAPI.getSettings();
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  
    // Setze Toggle‑Checkbox entsprechend
    const chkDark = document.getElementById('chkDark');
    chkDark.checked = theme === 'dark';
  
    const inpAutosave = document.getElementById('inpAutosave');
    inpAutosave.value = settings.autosave || 5000;
  
    // 2) Settings‑Drawer öffnen/schließen
    document.getElementById('btnSettings').addEventListener('click', () => {
      document.getElementById('settingsToggle').checked = true;
    });
  
    // 3) Wenn Theme wechselt, live im UI ändern
    chkDark.addEventListener('change', () => {
      const newTheme = chkDark.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    });
  
    // 4) Speichern‑Button
    document.getElementById('btnSaveSettings').addEventListener('click', async () => {
      const newSettings = {
        theme: chkDark.checked ? 'dark' : 'light',
        autosave: Number(inpAutosave.value) || 5000
      };
      await window.electronAPI.saveSettings(newSettings);
      // Drawer schließen
      document.getElementById('settingsToggle').checked = false;
    });
  
    // 5) Host / Join
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
  