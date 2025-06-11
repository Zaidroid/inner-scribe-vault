import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import * as Sentry from '@sentry/electron/main';

// Initialize Sentry in the main process
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with your actual DSN
});

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist');
// ... (rest of the file) 