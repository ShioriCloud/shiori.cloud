import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5000
const RESUME_MS = 4000
const STORAGE_PREFIX = 'shiori-featured-slide:'
/** Ignore tiny finger jitter; treat as tap / stay on current slide. */
const SWIPE_DEADZONE_PX = 12

type HomeFeaturedCarouselProps = {
  children: ReactNode
  className?: string
  /** Persist active slide across navigations (e.g. home featured per content tab). */
  restoreKey?: string
}

const readSavedIndex = (key: string): number | null => {
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`)
  if (raw == null) return null
  const index = Number.parseInt(raw, 10)
  return Number.isFinite(index) ? index : null
}

const writeSavedIndex = (key: string, index: number) => {
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, String(index))
}

/** Center a slide in the scroller — works with direction:ltr track in RTL pages. */
const centerSlide = (
  root: HTMLElement,
  slide: HTMLElement,
  behavior: ScrollBehavior = 'auto'
) => {
  const rootRect = root.getBoundingClientRect()
  const slideRect = slide.getBoundingClientRect()
  const delta =
    slideRect.left + slideRect.width / 2 - (rootRect.left + rootRect.width / 2)
  if (Math.abs(delta) <= 0.5) return
  root.scrollBy({ left: delta, behavior })
}

/** Closest among current ± 1 so a fast flick never skips slides. */
const pickAdjacentIndex = (
  root: HTMLElement,
  slides: Array<HTMLElement | null>,
  startIndex: number,
  count: number
): number => {
  const candidates = [startIndex]
  if (startIndex > 0) candidates.push(startIndex - 1)
  if (startIndex < count - 1) candidates.push(startIndex + 1)

  const rootCenter = root.getBoundingClientRect().left + root.clientWidth / 2
  let best = startIndex
  let bestDist = Number.POSITIVE_INFINITY

  for (const index of candidates) {
    const slide = slides[index]
    if (!slide) continue
    const rect = slide.getBoundingClientRect()
    const dist = Math.abs(rect.left + rect.width / 2 - rootCenter)
    if (dist < bestDist) {
      bestDist = dist
      best = index
    }
  }

  return best
}

/** Featured carousel — CSS scroll-snap + dots + soft autoplay (no Swiper). */
export const HomeFeaturedCarousel = ({
  children,
  className,
  restoreKey,
}: HomeFeaturedCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const resumeTimerRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const activeIndexRef = useRef(0)
  /** Ignore IntersectionObserver while we drive scroll programmatically. */
  const scrollLockRef = useRef(false)
  const unlockTimerRef = useRef<number | null>(null)
  const gestureRef = useRef<{
    pointerId: number | null
    startX: number
    startIndex: number
    dragged: boolean
  }>({ pointerId: null, startX: 0, startIndex: 0, dragged: false })
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = Children.toArray(children)
  const count = slides.length

  const setIndex = useCallback(
    (index: number) => {
      activeIndexRef.current = index
      setActiveIndex(index)
      if (restoreKey) writeSavedIndex(restoreKey, index)
    },
    [restoreKey]
  )

  const releaseScrollLock = useCallback(() => {
    const root = scrollerRef.current
    if (root) root.style.scrollSnapType = ''
    scrollLockRef.current = false
    if (unlockTimerRef.current != null) {
      window.clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = null
    }
  }, [])

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const root = scrollerRef.current
      if (!root || count === 0) return

      const clamped = ((index % count) + count) % count
      const target = slideRefs.current[clamped]
      if (!target) return

      const current = activeIndexRef.current
      const wrapping =
        (current === count - 1 && clamped === 0) ||
        (current === 0 && clamped === count - 1) ||
        Math.abs(clamped - current) > 1

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const instant = reduceMotion || wrapping || behavior === 'auto'

      if (unlockTimerRef.current != null) {
        window.clearTimeout(unlockTimerRef.current)
        unlockTimerRef.current = null
      }

      scrollLockRef.current = true

      if (instant) {
        root.style.scrollSnapType = 'none'
      }

      const finish = () => {
        centerSlide(root, target, 'auto')
        setIndex(clamped)
        releaseScrollLock()
      }

      if (instant) {
        centerSlide(root, target, 'auto')
        requestAnimationFrame(() => requestAnimationFrame(finish))
        return
      }

      centerSlide(root, target, 'smooth')

      if ('onscrollend' in root) {
        const onEnd = () => {
          root.removeEventListener('scrollend', onEnd)
          finish()
        }
        root.addEventListener('scrollend', onEnd)
        unlockTimerRef.current = window.setTimeout(() => {
          root.removeEventListener('scrollend', onEnd)
          finish()
        }, 700)
      } else {
        unlockTimerRef.current = window.setTimeout(finish, 500)
      }
    },
    [count, releaseScrollLock, setIndex]
  )

  // RTL pages may init at the far edge — land on restored slide (or 0).
  useEffect(() => {
    if (count === 0) return
    const saved = restoreKey ? readSavedIndex(restoreKey) : null
    const initial = saved != null && saved >= 0 && saved < count ? saved : 0
    activeIndexRef.current = initial
    setActiveIndex(initial)
    scrollToIndex(initial, 'auto')
  }, [count, restoreKey, scrollToIndex])

  useEffect(() => {
    if (!restoreKey) return
    return () => {
      writeSavedIndex(restoreKey, activeIndexRef.current)
    }
  }, [restoreKey])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root || count === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return
        // While the user is dragging, index is settled on pointer up (±1 only).
        if (gestureRef.current.pointerId != null) return

        let best: { index: number; ratio: number } | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (!Number.isFinite(index)) continue
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio }
          }
        }
        if (best) setIndex(best.index)
      },
      { root, threshold: [0.45, 0.6, 0.75] }
    )

    const nodes = root.querySelectorAll<HTMLElement>('[data-index]')
    nodes.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [count, setIndex])

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true
    if (resumeTimerRef.current != null) {
      window.clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
  }, [])

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current != null) window.clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false
      resumeTimerRef.current = null
    }, RESUME_MS)
  }, [])

  const settleGestureToAdjacent = useCallback(() => {
    const root = scrollerRef.current
    const gesture = gestureRef.current
    if (!root || gesture.pointerId == null) return

    const startIndex = gesture.startIndex
    gesture.pointerId = null

    if (!gesture.dragged || count <= 1) {
      scrollToIndex(startIndex, 'smooth')
      scheduleResume()
      return
    }

    const next = pickAdjacentIndex(root, slideRefs.current, startIndex, count)
    scrollToIndex(next, 'smooth')
    scheduleResume()
  }, [count, scheduleResume, scrollToIndex])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      pauseAutoplay()
      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startIndex: activeIndexRef.current,
        dragged: false,
      }
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Some WebViews reject capture mid-gesture — settle still runs on up.
      }
    },
    [pauseAutoplay]
  )

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (gesture.pointerId !== event.pointerId) return
    if (Math.abs(event.clientX - gesture.startX) >= SWIPE_DEADZONE_PX) {
      gesture.dragged = true
    }
  }, [])

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (gestureRef.current.pointerId !== event.pointerId) return
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // ignore
      }
      settleGestureToAdjacent()
    },
    [settleGestureToAdjacent]
  )

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (gestureRef.current.pointerId !== event.pointerId) return
      settleGestureToAdjacent()
    },
    [settleGestureToAdjacent]
  )

  useEffect(() => {
    if (count <= 1) return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let id: number | null = null

    const stop = () => {
      if (id == null) return
      window.clearInterval(id)
      id = null
    }

    const start = () => {
      if (id != null || motionQuery.matches) return
      id = window.setInterval(() => {
        if (
          pausedRef.current ||
          scrollLockRef.current ||
          gestureRef.current.pointerId != null ||
          motionQuery.matches
        ) {
          return
        }
        const next = (activeIndexRef.current + 1) % count
        scrollToIndex(next)
      }, AUTOPLAY_MS)
    }

    const sync = () => {
      if (motionQuery.matches) stop()
      else start()
    }

    sync()
    motionQuery.addEventListener('change', sync)
    return () => {
      stop()
      motionQuery.removeEventListener('change', sync)
    }
  }, [count, scrollToIndex])

  useEffect(
    () => () => {
      if (resumeTimerRef.current != null) window.clearTimeout(resumeTimerRef.current)
      if (unlockTimerRef.current != null) window.clearTimeout(unlockTimerRef.current)
      releaseScrollLock()
    },
    [releaseScrollLock]
  )

  if (count === 0) return null

  return (
    <div className={cn('home-featured-wrap', className)}>
      <div
        ref={scrollerRef}
        className="home-featured-scroller scrollbar-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {slides.map((slide, index) => (
          <div
            key={isValidElement(slide) && slide.key != null ? String(slide.key) : index}
            ref={(el) => {
              slideRefs.current[index] = el
            }}
            data-index={index}
            className="home-featured-slide"
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="home-featured-pagination" role="tablist" aria-label="اسلایدهای ویژه">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`اسلاید ${index + 1}`}
              className={cn(
                'home-featured-bullet',
                index === activeIndex && 'home-featured-bullet-active'
              )}
              onClick={() => {
                pauseAutoplay()
                scrollToIndex(index)
                scheduleResume()
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
