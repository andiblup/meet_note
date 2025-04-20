const socket = io();

function chooseRole(role) {
  localStorage.setItem('meet_note_role', role);
  alert(`Modus gewählt: ${role === 'host' ? 'Hosting' : 'Beitreten'}`);
  // Später: Weiterleitung auf Haupt-Notizen-UI
  window.location.href = '/app.html'
}

console.log('Socket.IO verbunden');