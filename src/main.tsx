import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import * as Sentry from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';

// --- VITE ENV DEBUGGING ---
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("All VITE ENV vars:", import.meta.env);
// --- END DEBUGGING ---

// Initialize services
try {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: "https://a4a5db569a9cdd15228670868f611155@o4507647248105472.ingest.us.sentry.io/4507647250268160",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0, 
      replaysSessionSampleRate: 0.1, 
      replaysOnErrorSampleRate: 1.0, 
    });
  }
} catch (error) {
    console.error("Sentry initialization failed:", error);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
  );
} else {
  console.error("Could not find root element to mount the app.");
}
