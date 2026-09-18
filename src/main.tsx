import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { queryClient } from './lib/queryClient'
import { ensureTelegramWebAppReady } from './lib/telegramReady'
import { persistTelegramLaunchHash } from './lib/platform'
import { refreshBootQuotesCache } from './services/bootQuotes'
import './index.css'

// Never hard-block boot on client Telegram detection — it false-positives on
// iOS / proxy WebViews (empty initData, Safari UA, no Android bridge).
persistTelegramLaunchHash()
document.documentElement.classList.remove('outside-telegram')
ensureTelegramWebAppReady()
void refreshBootQuotesCache()

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
)
