// /server/socket/socketHandler.js

function socketHandler(io) {
    io.on('connection', (socket) => {
      console.log('✅ Client verbunden:', socket.id);
  
      socket.on('editor-update', (data) => {
        socket.broadcast.emit('editor-update', data);
      });
  
      socket.on('editor-save', (data) => {
        console.log('💾 Save Event empfangen:', data);
      });
  
      socket.on('disconnect', () => {
        console.log('⚡ Client getrennt:', socket.id);
      });
    });
  }
  
  module.exports = socketHandler;
  