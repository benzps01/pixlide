import { defineConfig } from 'vite'
import path from 'path' // <-- Import the 'path' module
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple' // <-- Import the electron plugin

export default defineConfig({
  plugins: [
    // React plugin with the compiler
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    // Electron plugin configuration
    electron({
      main: {
        // The entry file for your Electron Main Process
        entry: 'electron/main.js',
      },
      preload: {
        // The entry file for your Preload script
        input: path.join(__dirname, 'electron/preload.js'),
      },
      // Optional: Use Node.js API in the Renderer process
      renderer: {},
    }),
  ],
})