import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getToken: () => ipcRenderer.invoke('get-token'),
  clearToken: () => ipcRenderer.invoke('clear-token'),
  syncImages: () => ipcRenderer.invoke('sync-images'),
  onSyncProgress: (callback) => ipcRenderer.on('sync-progress', (_event, value) => callback(value)),
  // --- Expose the new function ---
  getLocalImages: () => ipcRenderer.invoke('get-local-images'),
});