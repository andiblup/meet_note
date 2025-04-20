import { loadViewByHash } from './core/views.js';

console.log('🚀 Meet_Note App gestartet');

// Standardhash setzen, wenn keiner vorhanden
if (!window.location.hash) {
  window.location.hash = '#role';
}

// Event-Listener für Hash-Wechsel
window.addEventListener('hashchange', () => {
  console.log('📦 Hash geändert:', window.location.hash);
  loadViewByHash(window.location.hash);
});

// Event-Listener für Initial-Laden
window.addEventListener('DOMContentLoaded', () => {
  console.log('📦 DOM fertig');
  loadViewByHash(window.location.hash);
});

