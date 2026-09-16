import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { queryClient } from './lib/queryClient'
import { ensureTelegramWebAppReady } from './lib/telegramReady'
import { waitForTelegramMiniApp } from './lib/platform'
import { refreshBootQuotesCache } from './services/bootQuotes'
import './index.css'

const mountApp = () => {
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
}

void (async () => {
  // Built-in Telegram proxy / slow WebViews often lack initData+hash on first tick.
  const inside = await waitForTelegramMiniApp(2500)
  if (!inside) {
    document.documentElement.classList.add('outside-telegram')
    return
  }
  mountApp()
})()
