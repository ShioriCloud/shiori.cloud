import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { queryClient } from './lib/queryClient'
import { ensureTelegramWebAppReady } from './lib/telegramReady'
import { persistTelegramLaunchHash, waitForTelegramMiniApp } from './lib/platform'
import { refreshBootQuotesCache } from './services/bootQuotes'
import './index.css'

const markOutsideTelegram = () => {
  document.documentElement.classList.add('outside-telegram')
}

const markInsideTelegram = () => {
  document.documentElement.classList.remove('outside-telegram')
}

const boot = async () => {
  persistTelegramLaunchHash()
  ensureTelegramWebAppReady()
  void refreshBootQuotesCache()

  // Wait for slow iOS / proxy WebViews before locking out browsers.
  const inTelegram = await waitForTelegramMiniApp(3000)
  if (!inTelegram) {
    markOutsideTelegram()
    return
  }

  markInsideTelegram()

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
}

void boot()
