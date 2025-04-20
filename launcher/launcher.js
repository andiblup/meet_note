// // /* Host */
// document.getElementById('hostBtn').addEventListener('click', async () => {
//     // const { ip, port } = await window.electronAPI.startServer();
//     // window.electronAPI.openURL(`http://${ip}:${port}`);

//     const hostBtn = document.getElementById('hostBtn');
//     hostBtn.disabled = true;          // Doppelklicks verhindern
//     const { ip, port } = await window.electronAPI.startServer().catch(e => {
//         alert('Server konnte nicht starten: ' + e.message);
//         hostBtn.disabled = false;
//     });
//     if (!ip) return;                  // Fehlerfall
//     window.electronAPI.openURL(`http://${ip}:${port}`);
// });

// /* Join */
// document.getElementById('joinBtn').addEventListener('click', () => {
//     const addr = document.getElementById('joinIp').value.trim();
//     if (!addr) return alert('IP:Port eingeben!');
//     window.electronAPI.openURL(`http://${addr}`);
// });


hostBtn.addEventListener('click', async ()=>{
    hostBtn.disabled = true;
    try {
      const { ip, port } = await window.electronAPI.startServer();
      window.electronAPI.openURL(`http://${ip}:${port}`);
    } catch (err) {
      alert('Server konnte nicht starten:\n'+err.message);
      hostBtn.disabled = false;
    }
  });
  