import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { queryClient } from './lib/queryClient'
import { ensureTelegramWebAppReady } from './lib/telegramReady'
import {
  isClearlyOutsideTelegram,
  isTelegramMiniApp,
  persistTelegramLaunchHash,
  waitForTelegramMiniApp,
} from './lib/platform'
import { refreshBootQuotesCache } from './services/bootQuotes'
import './index.css'

const markOutsideTelegram = () => {
  document.documentElement.classList.add('outside-telegram')
}

const markInsideTelegram = () => {
  document.documentElement.classList.remove('outside-telegram')
}

const renderApp = () => {
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

const boot = async () => {
  persistTelegramLaunchHash()
  ensureTelegramWebAppReady()
  void refreshBootQuotesCache()

  if (isTelegramMiniApp()) {
    renderApp()
    return
  }

  // Desktop Chrome/Firefox/etc. — show Telegram gate immediately (no splash wait).
  if (isClearlyOutsideTelegram()) {
    markOutsideTelegram()
    return
  }

  // Mobile / ambiguous WebView — wait briefly for delayed initData (iOS/proxy).
  const inTelegram = await waitForTelegramMiniApp(3000)
  if (!inTelegram) {
    markOutsideTelegram()
    return
  }

  renderApp()
}

void boot()
