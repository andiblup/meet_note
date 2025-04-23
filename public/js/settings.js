document.addEventListener('DOMContentLoaded', async () => {
    const isElectron = !!window.electronAPI;

    // 1) Settings-Button öffnet Drawer immer
    document.getElementById('btnSettings').addEventListener('click', () => {
        document.getElementById('settingsToggle').checked = true;
    });

    // x) Fullscreen
    const btnFull = document.getElementById('btnFull');
    if (document.fullscreenElement) {
        btnFull.firstElementChild.className = 'bx bx-exit-fullscreen';
    } else {
        btnFull.firstElementChild.className = 'bx bx-fullscreen';
    }
    btnFull.onclick = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            btnFull.firstElementChild.className = 'bx bx-exit-fullscreen';
        } else {
            document.exitFullscreen();
            btnFull.firstElementChild.className = 'bx bx-fullscreen';
        }
    };
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            btnFull.firstElementChild.className = 'bx bx-exit-fullscreen';
        } else {
            btnFull.firstElementChild.className = 'bx bx-fullscreen';
        }
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
        currentSettings = { theme, autosave: null, primaryColor: '#FF422AD5' };
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
                autosave: Number(document.getElementById('inpAutosave').value) || 5000,
                primaryColor: document.getElementById('argbOutput').value
            };
            await window.electronAPI.saveSettings(newSettings);
            document.getElementById('settingsToggle').checked = false;
        });
    } else {
        // Browser: Theme direkt in localStorage persistieren
        document.getElementById('chkDark').addEventListener('change', () => {
            const t = document.getElementById('chkDark').checked ? 'dark' : 'light';
            localStorage.setItem('theme', t);
            // .getPropertyValue('--color-primary')
        });
        document.getElementById('closeARGBPickerModal').addEventListener('click', e => {
            console.log("ananas");

            localStorage.setItem('primaryColor', document.getElementById('argbOutput').value);
            getComputedStyle(document.documentElement).setProperty('--color-primary', document.getElementById('argbOutput').value);
        });
    }

});



// // Parse OKLCH CSS-Funktion
// function parseOKLCH(css) {
//   const m = /oklch\(\s*([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)\s*\)/i.exec(css);
//   if (!m) return null;
//   return { L: parseFloat(m[1]), C: parseFloat(m[2]), h: parseFloat(m[3]) };
// }
// // Konvertierungshelfer
// function oklchToOklab(L, C, hDeg) {
//   const h = hDeg * Math.PI/180;
//   return { L: L/100, a: C*Math.cos(h), b: C*Math.sin(h) };
// }
// function oklabToLinearSRGB({ L, a, b }) {
//   const l_ = L + 0.3963377774*a + 0.2158037573*b;
//   const m_ = L - 0.1055613458*a - 0.0638541728*b;
//   const s_ = L - 0.0894841775*a - 1.2914855480*b;
//   const l = l_*l_*l_, m = m_*m_*m_, s = s_*s_*s_;
//   return {
//     r: 4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
//     g: -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
//     b: -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
//   };
// }
// function linearToSRGBChannel(c) {
//   c = Math.min(Math.max(c,0),1);
//   return c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055;
// }
// function toHexChannel(c) {
//   return Math.round(c*255).toString(16).padStart(2,'0').toUpperCase();
// }
// function oklchToRGBA(L, C, h) {
//   const lab = oklchToOklab(L,C,h);
//   const lin = oklabToLinearSRGB(lab);
//   return { r: linearToSRGBChannel(lin.r), g: linearToSRGBChannel(lin.g), b: linearToSRGBChannel(lin.b), a:1 };
// }

// // Elemente
// const dialog = document.getElementById('primaryColorPickModal');
// const [rIn,gIn,bIn,aIn] = ['r','g','b','a'].map(id => document.getElementById(id));
// const vals = { r:'rVal', g:'gVal', b:'bVal', a:'aVal' };
// const preview = document.getElementById('preview');
// const output = document.getElementById('argbOutput');

// function updatePicker() {
//   const r = +rIn.value, g = +gIn.value, b = +bIn.value, a = +aIn.value;
//   Object.entries({r,g,b,a}).forEach(([k,v]) => document.getElementById(vals[k]).textContent = k==='a'? v.toFixed(2) : v);
//   preview.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
//   const hex = [a, r, g, b].map((v,i)=> toHexChannel(i===0? v : v/255)).join('');
//   output.value = `#${hex}`;
// }
// document.querySelectorAll('#primaryColorPickModal input[type=range]').forEach(s => s.addEventListener('input', updatePicker));

// // Default-Werte aus CSS setzen
// function initFromCSS() {
//   const css = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
//   const o = parseOKLCH(css);
//   if (o) {
//     const rgba = oklchToRGBA(o.L,o.C,o.h);
//     rIn.value = Math.round(rgba.r*255);
//     gIn.value = Math.round(rgba.g*255);
//     bIn.value = Math.round(rgba.b*255);
//     aIn.value = rgba.a;
//     updatePicker();
//   }
// }
// window.addEventListener('DOMContentLoaded', initFromCSS);

// // Speichern-Handler
// document.getElementById('btnSaveSettings').addEventListener('click', () => {
//   const newColor = output.value;
//   localStorage.setItem('primaryColor', newColor);
//   document.documentElement.style.setProperty('--color-primary', newColor);
//   document.getElementById('settingsToggle').checked = false;
// });

// // Reset-Handler
// document.getElementById('btnResetPrimaryColor').addEventListener('click', () => {
//   localStorage.removeItem('primaryColor');
//   document.documentElement.style.removeProperty('--color-primary');
//   initFromCSS();
// });

// // Debug-Button
// document.getElementById('btnGetColor').addEventListener('click', () => {
//   console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim());
// });





// document.addEventListener('DOMContentLoaded', async () => {
//     const isElectron = !!window.electronAPI;

//     // Elemente
//     const btnSettings = document.getElementById('btnSettings');
//     const settingsToggle = document.getElementById('settingsToggle');
//     const chkDark = document.getElementById('chkDark');
//     const inpAutosave = document.getElementById('inpAutosave');
//     const autosaveControl = document.getElementById('autosaveControl');
//     const btnSaveSettings = document.getElementById('btnSaveSettings');
//     const inpPrimaryColor = document.getElementById('inpPrimaryColor');

//     // 1) Drawer öffnen
//     btnSettings.addEventListener('click', () => {
//         settingsToggle.checked = true;
//     });

//     // 2) Settings laden
//     let currentSettings;
//     if (isElectron) {
//         currentSettings = await window.electronAPI.getSettings();
//     } else {
//         const theme = localStorage.getItem('theme')
//             || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
//         const primary = localStorage.getItem('primaryColor') || '#FF422AD5';
//         currentSettings = { theme, autosave: null, primaryColor: primary };
//     }

//     // 3) Drawer‑Controls füllen
//     document.documentElement.setAttribute('data-theme', currentSettings.theme);
//     chkDark.checked = currentSettings.theme === 'dark';
//     if (currentSettings.autosave !== null) {
//         inpAutosave.value = currentSettings.autosave;
//     }
//     // Primärfarbe anwenden
//     applyPrimary(currentSettings.primaryColor);
//     inpPrimaryColor.value = currentSettings.primaryColor;

//     // 4) Browser‑Clients: Autosave‑Controls ausblenden
//     if (!isElectron) {
//         autosaveControl.classList.add('hidden');
//         btnSaveSettings.classList.add('hidden');
//     }

//     // 5) Event‑Handler für Theme
//     chkDark.addEventListener('change', () => {
//         const t = chkDark.checked ? 'dark' : 'light';
//         document.documentElement.setAttribute('data-theme', t);
//         if (!isElectron) localStorage.setItem('theme', t);
//     });

//     // 6) Handler für Primary‑Picker
//     inpPrimaryColor.addEventListener('input', async e => {
//         const c = e.target.value;
//         applyPrimary(c);
//         if (isElectron) {
//             // speichere mit deinen anderen Settings:
//             const newSettings = {
//                 theme: chkDark.checked ? 'dark' : 'light',
//                 autosave: Number(inpAutosave.value) || currentSettings.autosave,
//                 primaryColor: c
//             };
//             await window.electronAPI.saveSettings(newSettings);
//         } else {
//             localStorage.setItem('primaryColor', c);
//         }
//     });

//     // 7) Save‑Button (nur Electron)
//     if (isElectron) {
//         btnSaveSettings.addEventListener('click', async () => {
//             const newSettings = {
//                 theme: chkDark.checked ? 'dark' : 'light',
//                 autosave: Number(inpAutosave.value) || currentSettings.autosave,
//                 primaryColor: inpPrimaryColor.value
//             };
//             await window.electronAPI.saveSettings(newSettings);
//             settingsToggle.checked = false;
//         });
//     }
// });

// // Hilfsfunktion
// function applyPrimary(color) {
//     document.documentElement.style.setProperty('--pf', color);
//     document.documentElement.style.setProperty('--p', color);
// }
