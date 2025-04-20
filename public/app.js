const socket = io();

function chooseMode(mode) {
  localStorage.setItem('meet_note_mode', mode);
  alert(`Modus gewählt: ${mode === 'host' ? 'Hosting' : 'Beitreten'}`);
  // Später: Weiterleitung auf Haupt-Notizen-UI
}

console.log('Socket.IO verbunden');