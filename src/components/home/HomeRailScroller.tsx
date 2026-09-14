import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type HomeRailScrollerProps = {
  children: ReactNode
  className?: string
  /** When set, horizontal scroll is saved/restored across navigations. */
  restoreKey?: string
}

const STORAGE_PREFIX = 'shiori-rail-scroll:'

const readSavedX = (key: string): number | null => {
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
  if (raw == null) return null
  const x = Number.parseFloat(raw)
  return Number.isFinite(x) ? x : null
}

const writeSavedX = (key: string, x: number) => {
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, String(x))
}

/** Native horizontal poster rail — momentum scroll, no snap. */
export const HomeRailScroller = ({
  children,
  className,
  restoreKey,
}: HomeRailScrollerProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lastXRef = useRef(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useLayoutEffect(() => {
    if (!restoreKey) return
    const el = scrollerRef.current
    if (!el) return

    const saved = readSavedX(restoreKey)
    let userMoved = false
    let lastWidth = el.scrollWidth

    const applySaved = () => {
      if (saved == null || userMoved) return
      el.scrollLeft = saved
      lastXRef.current = saved
    }

    if (saved != null) {
      lastXRef.current = saved
      applySaved()
    } else {
      lastXRef.current = el.scrollLeft
    }

    const onScroll = () => {
      lastXRef.current = el.scrollLeft
      if (
        saved != null &&
        !userMoved &&
        Math.abs(el.scrollLeft - saved) > 12
      ) {
        // User dragged away from the restored position.
        userMoved = true
      }
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        writeSavedX(restoreKey, lastXRef.current)
      }, 100)
    }

    const onResize = () => {
      if (el.scrollWidth > lastWidth) {
        applySaved()
      }
      lastWidth = el.scrollWidth
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(onResize)
    ro.observe(el)
    const track = el.firstElementChild
    if (track) ro.observe(track)

    let attempts = 0
    let rafId = 0
    const retry = () => {
      applySaved()
      attempts += 1
      if (!userMoved && attempts < 24) {
        rafId = requestAnimationFrame(retry)
      }
    }
    if (saved != null) rafId = requestAnimationFrame(retry)

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      cancelAnimationFrame(rafId)
      writeSavedX(restoreKey, lastXRef.current)
    }
  }, [restoreKey])

  return (
    <div
      ref={scrollerRef}
      className={cn('home-rail-scroller scrollbar-none', className)}
    >
      <div className="home-rail-track">{children}</div>
    </div>
  )
}

export const HomeRailSlide = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => <div className={cn('home-rail-slide', className)}>{children}</div>
