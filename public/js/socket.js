export function createSocket({ onConnect, onDisconnect } = {}) {
  const sio = io();

  sio.on('connect', () => onConnect?.(sio.id));
  sio.on('disconnect', () => onDisconnect?.());

  function join(roomId) {
    sio.emit('join', roomId);
  }

  function sendDelta(noteId, delta) {
    sio.emit('delta', { noteId, delta, ts: Date.now() });
  }

  function onInit(cb) { sio.on('init', cb); }
  function onDelta(cb) { sio.on('delta', cb); }

  return { join, sendDelta, onInit, onDelta };
}
