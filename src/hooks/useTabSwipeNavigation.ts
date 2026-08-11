import { useCallback, useRef, type TouchEventHandler } from 'react'
import { hapticSelection } from '@/lib/telegramHaptics'

const SWIPE_MIN_DISTANCE_PX = 56
const SWIPE_MAX_VERTICAL_DRIFT_RATIO = 0.65

type TouchPoint = {
  x: number
  y: number
}

type Options<T extends string> = {
  tabs: readonly T[]
  active: T
  onChange: (tab: T) => void
  enabled?: boolean
}

const isHorizontalScrollContainer = (el: Element | null): boolean => {
  let node = el

  while (node instanceof Element) {
    if (node.hasAttribute('data-tab-swipe-ignore')) return true

    const style = window.getComputedStyle(node)
    const overflowX = style.overflowX
    if (
      (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') &&
      node.scrollWidth > node.clientWidth + 2
    ) {
      return true
    }

    node = node.parentElement
  }

  return false
}

/** Swipe horizontally on tab content to move to the previous/next tab. */
export const useTabSwipeNavigation = <T extends string>({
  tabs,
  active,
  onChange,
  enabled = true,
}: Options<T>) => {
  const startRef = useRef<TouchPoint | null>(null)
  const startTargetRef = useRef<EventTarget | null>(null)

  const reset = useCallback(() => {
    startRef.current = null
    startTargetRef.current = null
  }, [])

  const onTouchStart: TouchEventHandler = useCallback(
    (event) => {
      if (!enabled || event.touches.length !== 1) return

      const touch = event.touches[0]
      startRef.current = { x: touch.clientX, y: touch.clientY }
      startTargetRef.current = event.target
    },
    [enabled]
  )

  const onTouchEnd: TouchEventHandler = useCallback(
    (event) => {
      if (!enabled) {
        reset()
        return
      }

      const start = startRef.current
      if (!start || event.changedTouches.length !== 1) {
        reset()
        return
      }

      if (startTargetRef.current instanceof Element && isHorizontalScrollContainer(startTargetRef.current)) {
        reset()
        return
      }

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y

      reset()

      if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE_PX) return
      if (Math.abs(deltaY) > Math.abs(deltaX) * SWIPE_MAX_VERTICAL_DRIFT_RATIO) return

      const currentIndex = tabs.indexOf(active)
      if (currentIndex === -1) return

      if (deltaX < 0 && currentIndex < tabs.length - 1) {
        hapticSelection()
        onChange(tabs[currentIndex + 1])
        return
      }

      if (deltaX > 0 && currentIndex > 0) {
        hapticSelection()
        onChange(tabs[currentIndex - 1])
      }
    },
    [active, enabled, onChange, reset, tabs]
  )

  return {
    onTouchStart,
    onTouchEnd,
    onTouchCancel: reset,
  }
}
