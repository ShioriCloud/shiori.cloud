import { useEffect, useState } from 'react'
import { BOOT_SPLASH_MIN_MS } from '@/data/bootQuotes'

const BOOT_SPLASH_FADE_MS = 280

/**
 * Cold-start splash only: hold for min read time + auth ready, then a short fade-out
 * so the handoff to Layout does not jump.
 */
export function useBootSplashHold(isReady: boolean, minMs = BOOT_SPLASH_MIN_MS) {
  const [minElapsed, setMinElapsed] = useState(minMs <= 0)
  const [fadeDone, setFadeDone] = useState(false)

  useEffect(() => {
    if (minMs <= 0) {
      setMinElapsed(true)
      return
    }
    setMinElapsed(false)
    const timer = window.setTimeout(() => setMinElapsed(true), minMs)
    return () => window.clearTimeout(timer)
  }, [minMs])

  const canRelease = isReady && minElapsed

  useEffect(() => {
    if (!canRelease) {
      setFadeDone(false)
      return
    }
    const timer = window.setTimeout(() => setFadeDone(true), BOOT_SPLASH_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [canRelease])

  return {
    /** Still covering the viewport (including fade-out). */
    visible: !fadeDone,
    /** Opacity transition in progress before revealing the app. */
    exiting: canRelease && !fadeDone,
  }
}
