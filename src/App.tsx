import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import WebApp from '@twa-dev/sdk'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { useTheme } from './utils/theme'
import { useAppAuth } from './hooks/useAppAuth'
import { isTelegramMiniApp } from './lib/platform'
import { useTelegramStartNavigation } from './hooks/useTelegramStartNavigation'
import { useTelegramUserSync } from './hooks/useTelegramUserSync'
import { useTelegramLinkComplete } from './hooks/useTelegramLinkComplete'

const Home = lazy(() => import('./pages/Home'))
const AnimeDetail = lazy(() => import('./pages/AnimeDetail'))
const Schedule = lazy(() => import('./pages/Schedule'))
const Search = lazy(() => import('./pages/Search'))
const Explore = lazy(() => import('./pages/Explore'))
const MyList = lazy(() => import('./pages/MyList'))
const ShioriListDetail = lazy(() => import('./pages/ShioriListDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Support = lazy(() => import('./pages/Support'))
const SupportTicketDetail = lazy(() => import('./pages/SupportTicketDetail'))
const TranslatorProfile = lazy(() => import('./pages/TranslatorProfile'))
const StudioDetail = lazy(() => import('./pages/StudioDetail'))
// Subscribe page kept for later monetization relaunch (see monetizationFlags.ts)
const Subscribe = lazy(() => import('./pages/Subscribe'))

function App() {
  const { isReady } = useAppAuth()
  const { applyTheme } = useTheme()
  useTelegramStartNavigation(isReady)
  useTelegramUserSync(isReady)
  useTelegramLinkComplete(isReady)

  useEffect(() => {
    if (!isReady) return
    if (isTelegramMiniApp()) {
      try {
        WebApp.expand()
      } catch {
        // ignore
      }
      // BotFather fullscreen + explicit request so contentSafeAreaInset includes chrome.
      try {
        const wa = WebApp as unknown as {
          isFullscreen?: boolean
          requestFullscreen?: () => void
          isVersionAtLeast?: (v: string) => boolean
        }
        if (
          !wa.isFullscreen &&
          typeof wa.requestFullscreen === 'function' &&
          (typeof wa.isVersionAtLeast !== 'function' || wa.isVersionAtLeast('8.0'))
        ) {
          wa.requestFullscreen()
        }
      } catch {
        // Unsupported client
      }
    }
    applyTheme()
  }, [isReady, applyTheme])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <Layout>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/studios/:slug" element={<StudioDetail />} />
          <Route path="/translators/:slug" element={<TranslatorProfile />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/my-list/lists/:listId" element={<ShioriListDetail />} />
          <Route path="/profile" element={<Profile />} />
          {/* Monetization routes kept; UI entry points gated by ENABLE_SUBSCRIPTION_DOWNLOAD_GATE */}
          <Route path="/donate" element={<Navigate to="/subscribe" replace />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support/:ticketId" element={<SupportTicketDetail />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
