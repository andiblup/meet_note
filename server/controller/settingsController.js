// /server/controller/settingsController.js

const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../../data/settings.json');

function getDefaultSettings() {
  return {
    theme: 'light',
    autosave: true,
    autosaveInterval: 5000
  };
}

exports.getSettings = (req, res) => {
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify(getDefaultSettings(), null, 2));
  }
  const settings = JSON.parse(fs.readFileSync(settingsPath));
  res.json(settings);
};

exports.saveSettings = (req, res) => {
  const newSettings = req.body;
  fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
  res.json({ status: 'saved' });
};
