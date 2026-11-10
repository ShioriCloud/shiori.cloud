import { useLayoutEffect, useRef } from 'react'

const STORAGE_PREFIX = 'shiori-scroll:'

const readSaved = (storageKey: string): number | null => {
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${storageKey}`)
  if (raw == null) return null
  const y = Number.parseInt(raw, 10)
  return Number.isFinite(y) ? y : null
}

const writeSaved = (storageKey: string, y: number) => {
  sessionStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, String(Math.max(0, Math.round(y))))
}

const currentScrollY = () =>
  window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0

const maxScrollY = () =>
  Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    document.body.scrollHeight - window.innerHeight,
    0
  )

const applyScrollTop = (y: number) => {
  window.scrollTo({ top: y, behavior: 'auto' })
  document.documentElement.scrollTop = y
  document.body.scrollTop = y
}

const clampScrollY = (y: number) => Math.max(0, Math.min(Math.round(y), Math.round(maxScrollY())))

/**
 * Persist and restore window scroll per logical tab key.
 *
 * Save in useLayoutEffect cleanup (before ScrollToTop runs on the next route).
 * Saving in useEffect cleanup is too late — scroll is already 0 and overwrites
 * a good position.
 */
export const profileScrollKey = (...parts: Array<string | number | null | undefined>) =>
  `profile:${parts.map((part) => String(part ?? '').trim() || '_').join(':')}`

export const useTabScrollRestoration = (storageKey: string) => {
  const prevKeyRef = useRef<string | null>(null)
  const lastYRef = useRef(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useLayoutEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey && prevKey !== storageKey) {
      writeSaved(prevKey, clampScrollY(lastYRef.current))
    }

    const savedRaw = readSaved(storageKey)
    const saved =
      savedRaw != null && savedRaw > 0 ? clampScrollY(savedRaw) : null
    let rafId = 0

    let stopRetry = () => {}
    let userMoved = false

    if (saved != null && saved > 0) {
      lastYRef.current = saved
      applyScrollTop(saved)

      // Lists often grow after the first paint (cached data, images, “load more”).
      const started = performance.now()
      stopRetry = () => {
        userMoved = true
      }
      const retry = () => {
        if (userMoved) return
        const max = maxScrollY()
        if (max + 4 >= saved) {
          applyScrollTop(saved)
          lastYRef.current = saved
          return
        }
        // Slow feeds/images: keep waiting longer before giving up.
        if (performance.now() - started > 4500) {
          const gap = saved - max
          // Only treat as cross-route leak when saved Y is far beyond this page.
          if (max < 80 || gap > Math.max(480, max * 1.25)) {
            applyScrollTop(0)
            lastYRef.current = 0
            writeSaved(storageKey, 0)
            return
          }
          const clamped = clampScrollY(saved)
          applyScrollTop(clamped)
          lastYRef.current = clamped
          return
        }
        applyScrollTop(clampScrollY(saved))
        rafId = requestAnimationFrame(retry)
      }
      rafId = requestAnimationFrame(retry)
      window.addEventListener('pointerdown', stopRetry, { passive: true })
      window.addEventListener('wheel', stopRetry, { passive: true })
      window.addEventListener('keydown', stopRetry)
    } else {
      // Never inherit the previous route's window scroll (e.g. settings → profile).
      applyScrollTop(0)
      lastYRef.current = 0
      writeSaved(storageKey, 0)
    }

    const onScroll = () => {
      const y = currentScrollY()
      if (!userMoved && saved != null && saved > y + 4) {
        if (maxScrollY() + 4 < saved) return
      }
      lastYRef.current = y
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        writeSaved(storageKey, clampScrollY(lastYRef.current))
      }, 100)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    prevKeyRef.current = storageKey

    return () => {
      // Remove listener before sibling ScrollToTop zeroes the window on PUSH,
      // so a scroll event cannot overwrite lastYRef with 0.
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', stopRetry)
      window.removeEventListener('wheel', stopRetry)
      window.removeEventListener('keydown', stopRetry)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      cancelAnimationFrame(rafId)
      writeSaved(storageKey, clampScrollY(lastYRef.current))
    }
  }, [storageKey])
}
