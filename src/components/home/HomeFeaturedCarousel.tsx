import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5000
const RESUME_MS = 4000

type HomeFeaturedCarouselProps = {
  children: ReactNode
  className?: string
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

/** Featured carousel — CSS scroll-snap + dots + soft autoplay (no Swiper). */
export const HomeFeaturedCarousel = ({ children, className }: HomeFeaturedCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const resumeTimerRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const activeIndexRef = useRef(0)
  /** Ignore IntersectionObserver while we drive scroll programmatically. */
  const scrollLockRef = useRef(false)
  const unlockTimerRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = Children.toArray(children)
  const count = slides.length

  const setIndex = useCallback((index: number) => {
    activeIndexRef.current = index
    setActiveIndex(index)
  }, [])

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

  // RTL pages may init horizontal scroll at the far edge — always land on slide 0.
  useEffect(() => {
    if (count === 0) return
    scrollToIndex(0, 'auto')
  }, [count, scrollToIndex])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root || count === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollLockRef.current) return

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
        if (pausedRef.current || scrollLockRef.current || motionQuery.matches) return
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
        onPointerDown={pauseAutoplay}
        onPointerUp={scheduleResume}
        onPointerCancel={scheduleResume}
        onTouchStart={pauseAutoplay}
        onTouchEnd={scheduleResume}
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
