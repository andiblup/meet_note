// /server/controller/notesController.js

const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../../data/notes');

if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir);

exports.getAllFiles = (req, res) => {
  const files = fs.readdirSync(notesDir).map(f => path.basename(f, '.json'));
  res.json(files);
};

exports.getFile = (req, res) => {
  const filePath = path.join(notesDir, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

  const content = JSON.parse(fs.readFileSync(filePath));
  res.json(content);
};

exports.createFile = (req, res) => {
  const { id } = req.body;
  const filePath = path.join(notesDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Datei existiert bereits' });
  }
  fs.writeFileSync(filePath, '[]');
  res.json({ status: 'created' });
};

exports.renameFile = (req, res) => {
  const { oldName, newName } = req.body;
  const oldPath = path.join(notesDir, `${oldName}.json`);
  const newPath = path.join(notesDir, `${newName}.json`);

  if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'Old file not found' });
  if (fs.existsSync(newPath)) return res.status(400).json({ error: 'New filename exists' });

  fs.renameSync(oldPath, newPath);
  res.json({ status: 'renamed' });
};

exports.deleteFile = (req, res) => {
  const filePath = path.join(notesDir, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

  fs.unlinkSync(filePath);
  res.json({ status: 'deleted' });
};
