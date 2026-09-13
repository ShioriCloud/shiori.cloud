import { useEffect, useLayoutEffect, useRef } from 'react'

const STORAGE_PREFIX = 'shiori-scroll:'

/** Persist and restore window scroll per logical tab key within a route. */
export const useTabScrollRestoration = (storageKey: string) => {
  const prevKeyRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    const prevKey = prevKeyRef.current
    if (prevKey && prevKey !== storageKey) {
      sessionStorage.setItem(`${STORAGE_PREFIX}${prevKey}`, String(window.scrollY))
    }

    const restore = () => {
      const saved = sessionStorage.getItem(`${STORAGE_PREFIX}${storageKey}`)
      if (!saved) {
        window.scrollTo({ top: 0, behavior: 'auto' })
        return
      }
      const y = Number.parseInt(saved, 10)
      if (!Number.isFinite(y)) return
      window.scrollTo({ top: y, behavior: 'auto' })
    }

    restore()

    // Rails often paint after first layout — retry while height catches up.
    const rafIds: number[] = []
    rafIds.push(
      requestAnimationFrame(() => {
        restore()
        rafIds.push(requestAnimationFrame(restore))
      })
    )
    const retry = window.setTimeout(restore, 120)

    prevKeyRef.current = storageKey
    return () => {
      for (const id of rafIds) cancelAnimationFrame(id)
      window.clearTimeout(retry)
    }
  }, [storageKey])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const save = () => {
      sessionStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, String(window.scrollY))
    }

    const onScroll = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(save, 120)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (timer) clearTimeout(timer)
      save()
    }
  }, [storageKey])
}
