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

/** Featured carousel — CSS scroll-snap + dots + soft autoplay (no Swiper). */
export const HomeFeaturedCarousel = ({ children, className }: HomeFeaturedCarouselProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const resumeTimerRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = Children.toArray(children)
  const count = slides.length

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const slide = slideRefs.current[index]
    if (!slide) return
    slide.scrollIntoView({ behavior, inline: 'center', block: 'nearest' })
  }, [])

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root || count === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { index: number; ratio: number } | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (!Number.isFinite(index)) continue
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio }
          }
        }
        if (best) setActiveIndex(best.index)
      },
      { root, threshold: [0.45, 0.6, 0.75] }
    )

    const nodes = root.querySelectorAll<HTMLElement>('[data-index]')
    nodes.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [count])

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
    const id = window.setInterval(() => {
      if (pausedRef.current) return
      const next = (activeIndexRef.current + 1) % count
      scrollToIndex(next)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [count, scrollToIndex])

  useEffect(
    () => () => {
      if (resumeTimerRef.current != null) window.clearTimeout(resumeTimerRef.current)
    },
    []
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
