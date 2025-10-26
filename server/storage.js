// server/storage.js
const fs = require('fs');
const path = require('path');

const ROOMS_DIR = path.join(__dirname, '..', 'data', 'rooms');
fs.mkdirSync(ROOMS_DIR, { recursive: true });

// Room Datei
const roomFile = (id) => path.join(ROOMS_DIR, `${id}.json`);

// Default Room State
const emptyState = () => ({ notes: {}, updatedAt: Date.now() });

// Index lesen (oder ableiten)
function listRooms() {
  const files = fs.readdirSync(ROOMS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const id = path.basename(f, '.json');
    try {
      const j = JSON.parse(fs.readFileSync(path.join(ROOMS_DIR, f), 'utf8'));
      return { id, title: j.title || id, updatedAt: j.updatedAt || 0, count: Object.keys(j.notes||{}).length };
    } catch {
      return { id, title: id, updatedAt: 0, count: 0 };
    }
  }).sort((a,b) => (b.updatedAt - a.updatedAt) || a.id.localeCompare(b.id));
}

function loadRoom(id) {
  const f = roomFile(id);
  if (!fs.existsSync(f)) return { ...emptyState(), title: id };
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    // sanity for Quill ops
    for (const k of Object.keys(j.notes || {})) {
      const d = j.notes[k];
      if (!d || !Array.isArray(d.ops)) j.notes[k] = { ops: [] };
    }
    return j;
  } catch {
    return { ...emptyState(), title: id };
  }
}

function saveRoom(id, state) {
  fs.writeFileSync(roomFile(id), JSON.stringify(state, null, 2), 'utf8');
}

function createRoom(id, title) {
  id = String(id).trim();
  if (!/^[a-z0-9_-]{1,64}$/i.test(id)) throw new Error('invalid id');
  const f = roomFile(id);
  if (fs.existsSync(f)) throw new Error('exists');
  const st = { ...emptyState(), title: title || id };
  saveRoom(id, st);
  return st;
}

function renameRoom(oldId, newId) {
  if (!/^[a-z0-9_-]{1,64}$/i.test(newId)) throw new Error('invalid id');
  const src = roomFile(oldId), dst = roomFile(newId);
  if (!fs.existsSync(src)) throw new Error('not found');
  if (fs.existsSync(dst)) throw new Error('target exists');
  fs.renameSync(src, dst);
}

function deleteRoom(id) {
  const f = roomFile(id);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

function wipeDefaultOnStart() {
  const f = roomFile('default');
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

module.exports = {
  listRooms, loadRoom, saveRoom, createRoom, renameRoom, deleteRoom, wipeDefaultOnStart
};
