import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Registered in production only — a service worker caching Vite's dev
  // module graph causes stale-module bugs (React hook-order mismatches)
  // across edits and reloads.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
