// // Setup Socket.IO client connection
// export const socket = io({
//     path: '/socket.io'
//   });

//   socket.on('connect', () => {
//     console.log('✅ Verbunden mit Server');
//   });

//   socket.on('disconnect', () => {
//     console.log('❌ Verbindung verloren');
//   });

// /public/app/core/socket.js

// /public/app/core/socket.js

let socket;

export function initSocket() {
  const role = localStorage.getItem('role');
  let serverUrl;

  if (role === 'host') {
    serverUrl = window.location.origin;
  } else {
    const address = localStorage.getItem('server_address');
    serverUrl = `http://${address}`;
  }

  socket = io(serverUrl, {
    path: '/socket.io'
  });

  socket.on('connect', () => {
    console.log('✅ Verbunden mit:', serverUrl);
  });

  socket.on('disconnect', () => {
    console.log('⚡️ Verbindung verloren');
  });

  return socket;
}


