document.addEventListener('DOMContentLoaded', async () => {
    const isElectron = !!window.electronAPI;

    // 1) Settings-Button öffnet Drawer immer
    document.getElementById('btnSettings').addEventListener('click', () => {
        document.getElementById('settingsToggle').checked = true;
    });

    // 2) Theme‑Initialisierung
    let currentSettings;
    if (isElectron) {
        // Electron: aus Datei laden
        currentSettings = await window.electronAPI.getSettings();
    } else {
        // Browser: localStorage oder prefers-color
        const ls = localStorage.getItem('theme');
        const theme = ls || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        currentSettings = { theme, autosave: null };
    }

    // Drawer-Kontrollen füllen
    document.documentElement.setAttribute('data-theme', currentSettings.theme);
    document.getElementById('chkDark').checked = currentSettings.theme === 'dark';
    if (currentSettings.autosave !== null) {
        document.getElementById('inpAutosave').value = currentSettings.autosave;
    }

    // 3) Browser‑Clients: Autosave‑Controls ausblenden
    if (!isElectron) {
        document.getElementById('autosaveControl').classList.add('hidden');
        document.getElementById('btnSaveSettings').classList.add('hidden');
    }

    // 4) Event‑Handler
    document.getElementById('chkDark').addEventListener('change', () => {
        const t = document.getElementById('chkDark').checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', t);
    });

    if (isElectron) {
        // Speichern nur in Electron
        document.getElementById('btnSaveSettings').addEventListener('click', async () => {
            const newSettings = {
                theme: document.getElementById('chkDark').checked ? 'dark' : 'light',
                autosave: Number(document.getElementById('inpAutosave').value) || 5000
            };
            await window.electronAPI.saveSettings(newSettings);
            document.getElementById('settingsToggle').checked = false;
        });
    } else {
        // Browser: Theme direkt in localStorage persistieren
        document.getElementById('chkDark').addEventListener('change', () => {
            const t = document.getElementById('chkDark').checked ? 'dark' : 'light';
            localStorage.setItem('theme', t);
        });
    }

});