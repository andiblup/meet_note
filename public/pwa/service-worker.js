self.addEventListener('install', event => {
    console.log('Service Worker installiert');
  });
  
  self.addEventListener('fetch', event => {
    // Offline-Caching Logik kann hier später rein
  });