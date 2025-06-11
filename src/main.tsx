import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import * as Sentry from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';
import { initializeObsidianSync } from './lib/obsidian';

// Initialize services
initializeObsidianSync();

Sentry.init({
  dsn: 'https://774393b2280a37397c6d1d0c272a5f15@o4507423982485504.ingest.us.sentry.io/4507423985434624',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
