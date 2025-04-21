const THEMES = ['light', 'dark'];
let settings = { theme: 'light', autosave: 1000 };



export function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
}
// export async function initTheme(socket) {
//   // --- 1. Settings laden
//   try {
//     settings = await fetch('/api/settings').then(r => r.json());
//   } catch { /* falls offline */ }

//   applyTheme(settings.theme);

//   // --- 2. Button‑Logik
//   const btn = document.getElementById('themeBtn');
//   btn.textContent = icon(settings.theme);
//   btn.onclick = () => {
//     // nächsten Theme‑Index wählen
//     const idx = (THEMES.indexOf(settings.theme) + 1) % THEMES.length;
//     settings.theme = THEMES[idx];
//     applyTheme(settings.theme);
//     save();
//   };

//   // --- 3. Live‑Update von anderen Fenstern
//   socket.on('settings-updated', s => {
//     settings = s;
//     applyTheme(settings.theme);
//   });
// }

// function applyTheme(name) {
//   document.documentElement.dataset.theme = name;
//   const btn = document.getElementById('themeBtn');
//   if (btn) btn.textContent = icon(name);
// }

// function save() {
//   fetch('/api/settings', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(settings)
//   });
// }

// function icon(theme) {
//   return theme === 'dark' ? '🌙' : '☀️';
// }
