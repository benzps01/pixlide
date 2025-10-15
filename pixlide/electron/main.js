import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import fs from 'fs/promises';
import db, { setupDatabase, getAllLocalImageServerIds, getLocalImages } from './database.js';

const store = new Store();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const imagesDir = path.join(app.getPath('userData'), 'images');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('media', (request, callback) => {
    const url = request.url.replace('media://', '');
    const filePath = path.join(imagesDir, url);
    callback({ path: filePath });
  });

  ipcMain.handle('get-app-version', () => app.getVersion());

  ipcMain.handle('login', async (event, credentials) => {
    console.log('[Main Process] Login attempt received with:', credentials.username);
    try {
      console.log('[Main Process] Sending login request to server...');
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      console.log('[Main Process] Server responded with status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      store.set('accessToken', data.accessToken);
      console.log('[Main Process] Login successful, token saved.');
      
      return { success: true, data: data };
    } catch (error) {
      console.error('[Main Process] Login Error:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('get-token', () => store.get('accessToken'));
  ipcMain.handle('clear-token', () => store.delete('accessToken'));
  ipcMain.handle('get-local-images', async () => await getLocalImages());

  // UPDATED SYNC HANDLER WITH DETAILED LOGGING
  ipcMain.handle('sync-images', async (event) => {
    const token = store.get('accessToken');
    if (!token) {
      console.error('[Sync] Error: Not authenticated.');
      return { success: false, message: 'Not authenticated.' };
    }

    const sender = event.sender;
    console.log('[Sync] Starting image synchronization...');
    sender.send('sync-progress', 'Starting sync...');

    try {
      await fs.mkdir(imagesDir, { recursive: true });
      console.log('[Sync] Image directory ensured.');

      const localImageIds = await getAllLocalImageServerIds();
      sender.send('sync-progress', `Found ${localImageIds.size} images locally.`);
      console.log(`[Sync] Found ${localImageIds.size} images in local DB.`);

      let currentPage = 1;
      let hasMore = true;
      let newImagesFound = 0;

      while (hasMore) {
        sender.send('sync-progress', `Fetching page ${currentPage} from server...`);
        console.log(`[Sync] Fetching page ${currentPage}...`);
        
        const response = await fetch(`http://localhost:3000/api/images?page=${currentPage}&limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(`[Sync] Server responded for page ${currentPage} with status: ${response.status}`);
        if (!response.ok) throw new Error(`Server fetch failed with status ${response.status}`);
        
        const serverImages = await response.json();
        if (serverImages.length === 0) {
          hasMore = false;
          console.log('[Sync] No more images on server. Ending fetch loop.');
          continue;
        }

        const newImages = serverImages.filter(img => !localImageIds.has(img.id));
        console.log(`[Sync] Page ${currentPage} has ${newImages.length} new images to download.`);

        if (newImages.length > 0) {
          newImagesFound += newImages.length;
          for (const image of newImages) {
            const filename = image.url.split('/').pop();
            sender.send('sync-progress', `Downloading ${filename}...`);
            console.log(`[Sync] Downloading ${filename}...`);

            const imageResponse = await fetch(image.url);
            const buffer = Buffer.from(await imageResponse.arrayBuffer());
            const localPath = path.join(imagesDir, filename);
            await fs.writeFile(localPath, buffer);
            console.log(`[Sync] Saved ${filename} to ${localPath}`);
            
            await db('images').insert({
              server_id: image.id,
              filename: filename,
              local_path: localPath,
            });
            console.log(`[Sync] Added ${filename} to local database.`);
          }
        }
        currentPage++;
      }
      
      const successMsg = `Sync complete. Found ${newImagesFound} new image(s).`;
      sender.send('sync-progress', successMsg);
      console.log(`[Sync] ${successMsg}`);
      return { success: true, message: successMsg };
    } catch (error) {
      const errorMsg = `Error: ${error.message}`;
      console.error('[Sync] A critical error occurred:', error);
      sender.send('sync-progress', errorMsg);
      return { success: false, message: errorMsg };
    }
  });

  setupDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});