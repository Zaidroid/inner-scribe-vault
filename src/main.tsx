import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import { BrowserRouter } from 'react-router-dom';

// --- VITE ENV DEBUGGING ---
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("All VITE ENV vars:", import.meta.env);
// --- END DEBUGGING ---

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
