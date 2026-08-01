import WebApp from '@twa-dev/sdk'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'error' | 'success' | 'warning'

type HapticApi = {
  impactOccurred?: (style: ImpactStyle) => void
  notificationOccurred?: (type: NotificationType) => void
  selectionChanged?: () => void
}

const getHaptic = (): HapticApi | null => {
  try {
    const haptic = (WebApp as unknown as { HapticFeedback?: HapticApi }).HapticFeedback
    return haptic ?? null
  } catch {
    return null
  }
}

export const hapticImpact = (style: ImpactStyle = 'light'): void => {
  try {
    getHaptic()?.impactOccurred?.(style)
  } catch {
    // ignore unsupported clients
  }
}

export const hapticNotification = (type: NotificationType = 'success'): void => {
  try {
    getHaptic()?.notificationOccurred?.(type)
  } catch {
    // ignore
  }
}

export const hapticSelection = (): void => {
  try {
    getHaptic()?.selectionChanged?.()
  } catch {
    // ignore
  }
}
