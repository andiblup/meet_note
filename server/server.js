require('dotenv').config(); // .env laden

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: process.env.SOCKET_PATH || '/socket.io'
});

// Statische Dateien aus /public bereitstellen
app.use(express.static(path.join(__dirname, '../public')));

// Websocket Logik
io.on('connection', (socket) => {
  console.log('✅ Client verbunden');

  socket.on('disconnect', () => {
    console.log('⚡ Client getrennt');
  });
});

// Port aus .env oder 6060 nehmen
const PORT = process.env.PORT || 6060;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, () => {
  console.log(`🌐 Server läuft auf http://${HOST}:${PORT}`);
});
