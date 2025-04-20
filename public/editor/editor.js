//== Editor Core ==//
// Handles formatting, code blocks, and theme application

import { saveContent } from './storage.js';
import { getRole } from './utils.js';
import { loadSettings, initSettingsUI } from './settings/settings.js';


export function initEditor() {
    const editor = document.getElementById('editor');
  
    // Auto save every 10 seconds
    setInterval(() => {
      saveContent();
    }, 10000);
  }

const socket = io();

// Load Settings
loadSettings();
window.addEventListener('DOMContentLoaded', initSettingsUI);

// Settings Drawer öffnen
document.getElementById('settingsButton').onclick = () => {
  const drawer = document.getElementById('settingsDrawer');
  drawer.classList.toggle('translate-x-full');
};

// LiveSync senden
document.getElementById('editor').addEventListener('input', (e) => {
  socket.emit('editor-update', { content: e.target.innerHTML });
});

// Empfangene Änderungen übernehmen
socket.on('editor-update', (data) => {
  document.getElementById('editor').innerHTML = data.content;
});



export function applyFormat(command, value = null) {
  document.execCommand(command, false, value);
}

export function insertCodeBlock(language = 'javascript') {
  const codeBlock = document.createElement('pre');
  const code = document.createElement('code');
  code.className = `language-${language}`;
  code.innerText = '// Code hier schreiben...';
  codeBlock.appendChild(code);

  const editor = document.getElementById('editor');
  editor.appendChild(codeBlock);

  // Re-highlight using Prism
  if (window.Prism) {
    Prism.highlightAll();
  }
}

export function applyTheme(theme) {
  const body = document.body;
  if (theme === 'dark') {
    body.classList.add('dark');
  } else {
    body.classList.remove('dark');
  }
}
