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
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  useTelegramBackButton()

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
          showFixedHeader && !isTransparentHeaderPage && 'pt-16'
        )}
      >
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="container">
          <div className="flex justify-around py-4">
            <Link
              to="/"
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
              className={`flex flex-col items-center space-y-1 ${
                isActive('/profile') ? 'text-primary-400' : 'text-gray-400'
              }`}
              aria-label="پروفایل"
            >
              <UserIcon className="w-6 h-6" />
              <span className="text-xs">پروفایل</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Layout
