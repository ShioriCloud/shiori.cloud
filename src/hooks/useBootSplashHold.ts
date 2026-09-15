import { useEffect, useState } from 'react'
import { BOOT_SPLASH_MIN_MS } from '@/data/bootQuotes'

const BOOT_SPLASH_FADE_MS = 280

type UseBootSplashHoldOptions = {
  minMs?: number
  /** Hard cap so a slow/failed network cannot pin the splash forever. */
  maxMs?: number
  /** Home P0 (or equivalent) settled — success or error. */
  dataReady?: boolean
}

/**
 * Cold-start splash: hold for min read time + auth ready + (dataReady | max),
 * then a short fade-out so the handoff to Layout does not jump.
 */
export function useBootSplashHold(
  isReady: boolean,
  { minMs = BOOT_SPLASH_MIN_MS, maxMs = 7500, dataReady = false }: UseBootSplashHoldOptions = {}
) {
  const [minElapsed, setMinElapsed] = useState(minMs <= 0)
  const [maxElapsed, setMaxElapsed] = useState(false)
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

  useEffect(() => {
    if (maxMs <= 0) {
      setMaxElapsed(true)
      return
    }
    setMaxElapsed(false)
    const timer = window.setTimeout(() => setMaxElapsed(true), maxMs)
    return () => window.clearTimeout(timer)
  }, [maxMs])

  const canRelease = isReady && minElapsed && (dataReady || maxElapsed)

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
