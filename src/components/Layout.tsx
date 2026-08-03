import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home01Icon,
  Calendar01Icon,
  UserIcon,
  FavouriteIcon,
  Compass01Icon,
} from 'hugeicons-react'
import { AppHeader, APP_HEADER_PAD_CLASS } from '@/components/AppHeader'
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '@/hooks/useTelegramSafeArea'
import { useNotifications } from '@/hooks/useNotifications'
import { useAiringReminders } from '@/hooks/useAiringReminders'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

const toPersianNumber = (num: number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const { unreadCount } = useNotifications()
  useAiringReminders()

  useTelegramBackButton()
  useTelegramSafeArea()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsScrolled(false)
  }, [location.pathname])

  const isActive = (path: string) =>
    path === '/explore'
      ? location.pathname === '/explore' || location.pathname.startsWith('/explore/')
      : location.pathname === path

  const isHomePage = location.pathname === '/'
  const isExplorePage =
    location.pathname === '/explore' || location.pathname.startsWith('/explore/')
  /** Home/Explore render AppHeader in-page (below Telegram fullscreen chrome). */
  const usesInPageHeader = isHomePage || isExplorePage
  const isAnimeDetailPage = location.pathname.startsWith('/anime/')
  const isProfileHeroPage =
    location.pathname === '/profile' || location.pathname.startsWith('/translators/')
  const isTransparentHeaderPage = isAnimeDetailPage || isProfileHeroPage
  const showFixedHeader = !usesInPageHeader

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showFixedHeader && (
        <header
          className={cn(
            'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
            isScrolled
              ? 'bg-background'
              : isTransparentHeaderPage
                ? 'bg-transparent'
                : 'bg-gradient-to-b from-background/90 via-background/60 to-transparent'
          )}
        >
          <div className={cn('container', APP_HEADER_PAD_CLASS)}>
            <AppHeader bare />
          </div>
        </header>
      )}

      <main
        className={cn(
          'flex-1 pb-20',
          showFixedHeader && !isTransparentHeaderPage && 'pt-[var(--app-header-offset)]'
        )}
      >
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-[var(--app-tg-bottom-inset)]">
        <div className="container">
          <div className="flex justify-around py-4">
            <Link
              to="/"
              onClick={() => hapticSelection()}
              className={`flex flex-col items-center space-y-1 ${
                isActive('/') ? 'text-primary-400' : 'text-gray-400'
              }`}
              aria-label="خانه"
            >
              <Home01Icon className="w-6 h-6" />
              <span className="text-xs">خانه</span>
            </Link>
            <Link
              to="/schedule"
              onClick={() => hapticSelection()}
              className={`flex flex-col items-center space-y-1 ${
                isActive('/schedule') ? 'text-primary-400' : 'text-gray-400'
              }`}
              aria-label="برنامه پخش"
            >
              <Calendar01Icon className="w-6 h-6" />
              <span className="text-xs">برنامه پخش</span>
            </Link>
            <Link
              to="/explore"
              onClick={() => hapticSelection()}
              className={`flex flex-col items-center space-y-1 ${
                isActive('/explore') ? 'text-primary-400' : 'text-gray-400'
              }`}
              aria-label="گشت‌و‌گذار"
            >
              <Compass01Icon className="w-6 h-6" />
              <span className="text-xs">گشت‌و‌گذار</span>
            </Link>
            <Link
              to="/my-list"
              onClick={() => hapticSelection()}
              className={`flex flex-col items-center space-y-1 ${
                isActive('/my-list') ? 'text-primary-400' : 'text-gray-400'
              }`}
              aria-label="لیست من"
            >
              <FavouriteIcon className="w-6 h-6" />
              <span className="text-xs">لیست من</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => hapticSelection()}
              className={`relative flex flex-col items-center space-y-1 ${
                isActive('/profile') ? 'text-primary-400' : 'text-gray-400'
              }`}
              aria-label={
                unreadCount > 0
                  ? `پروفایل، ${toPersianNumber(unreadCount)} اعلان خوانده‌نشده`
                  : 'پروفایل'
              }
            >
              <span className="relative inline-flex">
                <UserIcon className="w-6 h-6" />
                {unreadCount > 0 ? (
                  <span
                    className={cn(
                      'absolute -end-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full',
                      'bg-primary-400 px-1 text-[9px] font-bold leading-none text-primary-foreground tabular-nums'
                    )}
                  >
                    {unreadCount > 9 ? '۹+' : toPersianNumber(unreadCount)}
                  </span>
                ) : null}
              </span>
              <span className="text-xs">پروفایل</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Layout
