import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { BrandBootScreen } from './components/BrandBootScreen'
import { RouteFallback } from './components/RouteFallback'
import { AppFeedbackHost } from './components/AppFeedbackHost'
import { ReleaseNotesDialog } from './components/ReleaseNotesDialog'
import { useTheme } from './utils/theme'
import { useAppAuth } from './hooks/useAppAuth'
import { BOOT_SPLASH_MAX_MS, useBootLoadStages } from './hooks/useBootLoadStages'
import { useBootSplashHold } from './hooks/useBootSplashHold'
import { useTelegramStartNavigation } from './hooks/useTelegramStartNavigation'
import { useTelegramUserSync } from './hooks/useTelegramUserSync'
import { useTelegramLinkComplete } from './hooks/useTelegramLinkComplete'
import { prefetchSchedule } from './hooks/queries/prefetch'
import PublicUserProfile from './pages/PublicUserProfile'
import TranslatorProfile from './pages/TranslatorProfile'

const Home = lazy(() => import('./pages/Home'))
const AnimeDetail = lazy(() => import('./pages/AnimeDetail'))
const Schedule = lazy(() => import('./pages/Schedule'))
const Search = lazy(() => import('./pages/Search'))
const Explore = lazy(() => import('./pages/Explore'))
const MyList = lazy(() => import('./pages/MyList'))
const Feed = lazy(() => import('./pages/Feed'))
const ProfileFavorites = lazy(() => import('./pages/ProfileFavorites'))
const ProfileWatchArchive = lazy(() => import('./pages/ProfileWatchArchive'))
const ProfilePlaylists = lazy(() => import('./pages/ProfilePlaylists'))
const ShioriListDetail = lazy(() => import('./pages/ShioriListDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const SocialProfile = lazy(() => import('./pages/SocialProfile'))
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'))
const ProfileFullStats = lazy(() => import('./pages/ProfileFullStats'))
const ProfileFollowList = lazy(() => import('./pages/ProfileFollowList'))
const UserTranslationsPage = lazy(() => import('./pages/UserTranslationsPage'))
const ProfilePeopleSearch = lazy(() => import('./pages/ProfilePeopleSearch'))
const ProfileActivity = lazy(() => import('./pages/ProfileActivity'))
const PublicShioriListPage = lazy(() => import('./pages/PublicShioriListPage'))
const ProfileBlockedUsers = lazy(() => import('./pages/ProfileBlockedUsers'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Support = lazy(() => import('./pages/Support'))
const SupportTicketDetail = lazy(() => import('./pages/SupportTicketDetail'))
const StudioDetail = lazy(() => import('./pages/StudioDetail'))
// Subscribe page kept for later monetization relaunch (see monetizationFlags.ts)
const Subscribe = lazy(() => import('./pages/Subscribe'))

function App() {
  const { isReady } = useAppAuth()
  const bootLoad = useBootLoadStages(isReady)
  const { visible: showBootSplash, exiting: bootExiting } = useBootSplashHold(isReady, {
    maxMs: BOOT_SPLASH_MAX_MS,
    dataReady: bootLoad.dataReady,
  })
  const { applyTheme } = useTheme()
  useTelegramStartNavigation(isReady)
  useTelegramUserSync(isReady)
  useTelegramLinkComplete(isReady)

  // Warm likely route chunks while splash is up so Suspense does not flash a spinner.
  useEffect(() => {
    void import('./pages/Home')
    void import('./pages/AnimeDetail')
    void import('./pages/Explore')
    void import('./pages/Schedule')
  }, [])

  useEffect(() => {
    if (!isReady) return
    applyTheme()

    // Warm schedule cache after shell is ready (idle-ish: next tick).
    const idle =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback(() => prefetchSchedule(), { timeout: 2500 })
        : null
    const timer =
      idle == null
        ? window.setTimeout(() => prefetchSchedule(), 1200)
        : null
    return () => {
      if (idle != null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idle)
      }
      if (timer != null) window.clearTimeout(timer)
    }
  }, [isReady, applyTheme])

  return (
    <>
      <Layout>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/studios/:slug" element={<StudioDetail />} />
            <Route path="/translators/:slug" element={<TranslatorProfile />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/my-list/lists/:listId" element={<ShioriListDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/social" element={<SocialProfile />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/profile/stats" element={<ProfileFullStats />} />
            <Route path="/profile/followers" element={<ProfileFollowList />} />
            <Route path="/profile/following" element={<ProfileFollowList />} />
            <Route path="/profile/people" element={<ProfilePeopleSearch />} />
            <Route path="/profile/activity" element={<ProfileActivity />} />
            <Route path="/profile/favorites" element={<ProfileFavorites />} />
            <Route path="/profile/watch-archive" element={<ProfileWatchArchive />} />
            <Route path="/profile/playlists" element={<ProfilePlaylists />} />
            <Route path="/profile/blocked" element={<ProfileBlockedUsers />} />
            <Route path="/u/:telegramUserId" element={<PublicUserProfile />} />
            <Route path="/u/:telegramUserId/activity" element={<ProfileActivity />} />
            <Route path="/u/:telegramUserId/lists/:listId" element={<PublicShioriListPage />} />
            <Route path="/u/:telegramUserId/translations" element={<UserTranslationsPage />} />
            <Route path="/u/:telegramUserId/followers" element={<ProfileFollowList />} />
            <Route path="/u/:telegramUserId/following" element={<ProfileFollowList />} />
            {/* Monetization routes kept; UI entry points gated by ENABLE_SUBSCRIPTION_DOWNLOAD_GATE */}
            <Route path="/donate" element={<Navigate to="/subscribe" replace />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support" element={<Support />} />
            <Route path="/support/:ticketId" element={<SupportTicketDetail />} />
          </Routes>
        </Suspense>
      </Layout>
      <AppFeedbackHost />
      <ReleaseNotesDialog enabled={!showBootSplash} />
      {showBootSplash ? (
        <BrandBootScreen exiting={bootExiting} progress={bootLoad.progress} />
      ) : null}
    </>
  )
}

export default App
