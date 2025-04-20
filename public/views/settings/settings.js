// /views/settings/settings.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('⚙️ settings.js loaded');
  
    const backBtn = document.getElementById('backBtn');
    const leaveBtn = document.getElementById('leaveBtn');
  
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#editor';
      });
    }
  
    if (leaveBtn) {
      leaveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('role');
        window.location.hash = '#role';
      });
    }
  });
  
  