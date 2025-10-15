"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => electron.ipcRenderer.invoke("get-app-version"),
  login: (credentials) => electron.ipcRenderer.invoke("login", credentials),
  getToken: () => electron.ipcRenderer.invoke("get-token"),
  clearToken: () => electron.ipcRenderer.invoke("clear-token"),
  syncImages: () => electron.ipcRenderer.invoke("sync-images"),
  onSyncProgress: (callback) => electron.ipcRenderer.on("sync-progress", (_event, value) => callback(value)),
  // --- Expose the new function ---
  getLocalImages: () => electron.ipcRenderer.invoke("get-local-images")
});
