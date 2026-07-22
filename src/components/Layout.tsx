import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home01Icon,
  Calendar01Icon,
  Search01Icon,
  UserIcon,
  FavouriteIcon,
  ArrowRight01Icon,
  Compass01Icon,
} from 'hugeicons-react'
import logo from '../assets/images/shiori-logo.svg'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)

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

  const isAnimeDetailPage = location.pathname.startsWith('/anime/')
  const isProfileHeroPage =
    location.pathname === '/profile' || location.pathname.startsWith('/translators/')
  const isTransparentHeaderPage = isAnimeDetailPage || isProfileHeroPage
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          isScrolled
            ? 'bg-background'
            : isTransparentHeaderPage
              ? 'bg-transparent'
              : 'bg-gradient-to-b from-background/90 via-background/60 to-transparent'
        }`}
      >
        <div className="container py-4">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors duration-200"
                aria-label="جستجو"
              >
                <Search01Icon className="w-6 h-6" />
              </button>
            </div>
            <Link
              to="/"
              className="justify-self-center flex items-center justify-center gap-1 text-foreground"
            >
              <img src={logo} alt="logo" className="w-6 h-6" />
              <span className="text-foreground text-xl font-bold">شیوری</span>
            </Link>
            <div className="justify-self-end">
              {isHome ? (
                <div aria-hidden className="w-10 h-10" />
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors duration-200"
                  aria-label="بازگشت"
                >
                  <ArrowRight01Icon className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${!isTransparentHeaderPage ? 'pt-16' : ''} pb-20`}>{children}</main>

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
