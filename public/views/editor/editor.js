// /views/editor/editor.js

import { initSocket } from '../../app/core/socket.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('✍️ editor.js loaded');

  const role = localStorage.getItem('role');
  const serverAddr = localStorage.getItem('server_address');
  const infoBox = document.getElementById('infoWidget');



  // Socket initialisieren
  initSocket();
});

const role = localStorage.getItem('role');
const serverAddr = localStorage.getItem('server_address');
const infoBox = document.getElementById('infoWidget');
if (!infoBox) {
  console.error('❗ infoWidget nicht gefunden! Redirect zu Startseite.');
  window.location.hash = '#role';
  // return;
}

if (!role) {
  console.warn('❗ Keine Rolle gesetzt! Redirect zu Startseite.');
  infoBox.innerHTML = `⚠️ Keine Rolle gesetzt!`;
  setTimeout(() => window.location.hash = '#role', 1500);
  // return;
}

if (role === 'host') {
  infoBox.innerHTML = '⏳ Lade Server Info...';

  fetch('/api/info')
    .then(res => {
      if (!res.ok) throw new Error('Serverantwort fehlerhaft');
      return res.json();
    })
    .then(data => {
      console.log('📡 Server Info:', data);
      
      infoBox.innerHTML = `📡 Deine Session läuft auf: ${data.ip}:${data.port}`;
    })
    .catch((err) => {
      console.error('❗ Fehler beim Laden der Server Info:', err);
      infoBox.innerHTML = `⚠️ Fehler beim Laden der Server Info`;
    });

} else if (role === 'client') {
  infoBox.innerHTML = `🔗 Verbunden mit: ${serverAddr}`;
}
