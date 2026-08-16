import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 34, mass: 0.85 }

/** Direction of tab change: +1 = toward next index, -1 = toward previous. */
export function useTabSlideDirection<T extends string>(
  tabs: readonly T[],
  active: T
): number {
  const prevRef = useRef(active)
  const prevIndex = tabs.indexOf(prevRef.current)
  const nextIndex = tabs.indexOf(active)
  const direction =
    prevIndex === -1 || nextIndex === -1 || nextIndex === prevIndex
      ? 0
      : nextIndex > prevIndex
        ? 1
        : -1

  useEffect(() => {
    prevRef.current = active
  }, [active])

  return direction
}

type AnimatedTabContentProps = {
  activeKey: string
  direction: number
  className?: string
  children: ReactNode
}

/**
 * Short horizontal slide + fade between in-page tab panels (Animate UI–style).
 * In RTL, positive direction still maps to physical +x; swipe handlers stay as-is.
 */
export const AnimatedTabContent = ({
  activeKey,
  direction,
  className,
  children,
}: AnimatedTabContentProps) => {
  const reduceMotion = useReducedMotion()
  const offset = direction === 0 ? 0 : direction > 0 ? 18 : -18

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        className={cn('w-full', className)}
        initial={{ opacity: 0, x: offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -offset }}
        transition={SPRING}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export const tabThumbTransition = SPRING
