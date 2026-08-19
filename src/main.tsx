import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from './lib/queryClient'
import { ensureTelegramWebAppReady } from './lib/telegramReady'
import { refreshBootQuotesCache } from './services/bootQuotes'
import './index.css'

// Block the entire app when opened outside Telegram.
const tg = window.Telegram?.WebApp
if (!tg?.initData) {
  document.documentElement.classList.add('outside-telegram')
  throw new Error('Not inside Telegram — app blocked.')
}

// Before first paint of React — reinforces index.html early ready() after SDK init.
ensureTelegramWebAppReady()

// Warm splash quote cache for the next boot (current paint already picked from cache/fallback).
void refreshBootQuotesCache()

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
) 