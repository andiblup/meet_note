// electron/preload.js
// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electronAPI', {
//   startServer: () => ipcRenderer.invoke('start-server'),
//   openURL: url   => ipcRenderer.invoke('open-url', url),
//   getSettings:  () => ipcRenderer.invoke('get-settings'),
//   saveSettings: settings => ipcRenderer.invoke('save-settings', settings)
// });

const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  startServer:  () => ipcRenderer.invoke('start-server'),
  openURL:      url => ipcRenderer.invoke('open-url', url),
  getSettings:  () => ipcRenderer.invoke('get-settings'),
  saveSettings: settings => ipcRenderer.invoke('save-settings', settings),
});