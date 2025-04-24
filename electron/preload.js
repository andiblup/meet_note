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
  gotoHome: () => ipcRenderer.invoke('goto-home'),
  minimize:     () => ipcRenderer.send('window-minimize'),
  toggleMax:    () => ipcRenderer.send('window-toggle-max'),
  close:        () => ipcRenderer.send('window-close'),
  toggleFull:   () => ipcRenderer.send('window-toggle-full'),
});