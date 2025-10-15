import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Ignore the build output directory globally
  globalIgnores(['dist']),

  // --- Configuration for Node.js files ---
  // This applies to the Electron main process and config files
  {
    files: ['electron/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node, // Use Node.js global variables (like 'process')
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // --- Configuration for React/Browser files ---
  // This applies only to the files in the 'src' directory
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // Note: React plugins are only extended here, not for Node files
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser, // Use Browser global variables
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '18.2' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // Apply React Hooks rules
      'react-refresh/only-export-components': 'warn',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);