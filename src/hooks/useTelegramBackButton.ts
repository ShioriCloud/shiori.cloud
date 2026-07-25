import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isTelegramMiniApp } from '@/lib/platform'
import {
  canUseTelegramBackButton,
  fallbackBackPath,
  getTelegramBackButton,
  historyCanGoBack,
  shouldShowTelegramBackButton,
} from '@/lib/telegramBackButton'

/**
 * Sync Telegram's native header BackButton with the React Router stack.
 * Visible on nested pages; hidden on bottom-nav roots.
 */
export const useTelegramBackButton = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isTelegramMiniApp() || !canUseTelegramBackButton()) return

    const backButton = getTelegramBackButton()
    if (!backButton) return

    const onBack = () => {
      if (historyCanGoBack()) {
        navigate(-1)
        return
      }
      navigate(fallbackBackPath(location.pathname), { replace: true })
    }

    backButton.onClick(onBack)

    if (shouldShowTelegramBackButton(location.pathname)) {
      backButton.show()
    } else {
      backButton.hide()
    }

    return () => {
      backButton.offClick(onBack)
      backButton.hide()
    }
  }, [location.pathname, navigate])
}
