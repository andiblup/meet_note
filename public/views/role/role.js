console.log('⚡️ role.js geladen');

const hostBtn = document.getElementById('hostBtn');
const connectBtn = document.getElementById('connectBtn');

if (hostBtn) {
  hostBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.setItem('role', 'host');
    localStorage.setItem('server_address', 'self');
    location.hash = '#editor'; // Hash ändern
  });
}

if (connectBtn) {
  connectBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const addressInput = document.getElementById('clientAddress');
    const address = addressInput.value.trim();
    
    if (!address) {
      alert('Bitte IP:Port eingeben!');
      return;
    }

    localStorage.setItem('role', 'client');
    localStorage.setItem('server_address', address);
    location.hash = '#editor'; // Hash ändern
  });
}
