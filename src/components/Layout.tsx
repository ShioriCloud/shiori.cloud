import { ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import {
  Home01Icon,
  Calendar01Icon,
  UserIcon,
  FavouriteIcon,
  Search01Icon,
} from 'hugeicons-react'
import { AppHeader, APP_HEADER_PAD_CLASS } from '@/components/AppHeader'
import { tabThumbTransition } from '@/components/AnimatedTabContent'
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

type NavItem = {
  to: string
  label: string
  path: string
  Icon: typeof Home01Icon
  ariaLabel?: string
  badge?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const { unreadCount } = useNotifications()
  const reduceMotion = useReducedMotion()
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

  const isActive = (path: string) => {
    const pathname = location.pathname
    if (path === '/explore') {
      return pathname === '/explore' || pathname.startsWith('/explore/')
    }
    if (path === '/my-list') {
      return pathname === '/my-list' || pathname.startsWith('/my-list/')
    }
    if (path === '/profile') {
      return (
        pathname === '/profile' ||
        pathname.startsWith('/notifications') ||
        pathname.startsWith('/support') ||
        pathname.startsWith('/subscribe')
      )
    }
    return pathname === path
  }

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

  const navItems: NavItem[] = [
    { to: '/', path: '/', label: 'خانه', Icon: Home01Icon, ariaLabel: 'خانه' },
    {
      to: '/schedule',
      path: '/schedule',
      label: 'برنامه پخش',
      Icon: Calendar01Icon,
      ariaLabel: 'برنامه پخش',
    },
    {
      to: '/explore',
      path: '/explore',
      label: 'گشت‌و‌گذار',
      Icon: Search01Icon,
      ariaLabel: 'گشت‌و‌گذار',
    },
    {
      to: '/my-list',
      path: '/my-list',
      label: 'لیست من',
      Icon: FavouriteIcon,
      ariaLabel: 'لیست من',
    },
    {
      to: '/profile',
      path: '/profile',
      label: 'پروفایل',
      Icon: UserIcon,
      ariaLabel:
        unreadCount > 0
          ? `پروفایل، ${toPersianNumber(unreadCount)} اعلان خوانده‌نشده`
          : 'پروفایل',
      badge:
        unreadCount > 0 ? (
          <span
            className={cn(
              'absolute -end-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full',
              'bg-primary-400 px-1 text-[9px] font-bold leading-none text-white tabular-nums'
            )}
          >
            {unreadCount > 9 ? '۹+' : toPersianNumber(unreadCount)}
          </span>
        ) : null,
    },
  ]

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

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-[var(--app-tg-bottom-inset)]">
        <div className="container">
          <LayoutGroup id="bottom-nav">
            <div className="flex justify-around py-2">
              {navItems.map((item) => {
                const active = isActive(item.path)
                const Icon = item.Icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => hapticSelection()}
                    className={cn(
                      'relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
                      active ? 'text-primary-400' : 'text-muted-foreground'
                    )}
                    aria-label={item.ariaLabel ?? item.label}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active ? (
                      reduceMotion ? (
                        <span
                          aria-hidden
                          className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary-400"
                        />
                      ) : (
                        <motion.span
                          layoutId="bottom-nav-indicator"
                          aria-hidden
                          className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary-400"
                          transition={tabThumbTransition}
                        />
                      )
                    ) : null}
                    <span className="relative inline-flex">
                      <Icon className="h-6 w-6" />
                      {item.badge}
                    </span>
                    <span className="text-xs">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </LayoutGroup>
        </div>
      </nav>
    </div>
  )
}

export default Layout
