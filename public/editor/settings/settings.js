// settings.js
const settingsKey = "meet_note_settings";
let settings = {
  theme: 'light',
  fontSize: '16px',
  autosave: false
};

export function loadSettings() {
  const stored = localStorage.getItem(settingsKey);
  if (stored) {
    settings = JSON.parse(stored);
    applySettings();
  }
}

export function saveSetting(key, value) {
  settings[key] = value;
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  applySettings();
}

function applySettings() {
  document.documentElement.setAttribute('data-theme', settings.theme);
  document.getElementById('editor')?.style.fontSize = settings.fontSize;
}

export function initSettingsUI() {
  // Theme Select
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.value = settings.theme;
  themeSelect.onchange = (e) => saveSetting('theme', e.target.value);

  // Font Size
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  fontSizeSelect.value = settings.fontSize;
  fontSizeSelect.onchange = (e) => saveSetting('fontSize', e.target.value);

  // Autosave Toggle
  const autosaveToggle = document.getElementById('autosaveToggle');
  autosaveToggle.checked = settings.autosave;
  autosaveToggle.onchange = (e) => saveSetting('autosave', e.target.checked);
}
