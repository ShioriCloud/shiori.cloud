import type { ReactNode } from 'react'
import { useAppAuth } from '../hooks/useAppAuth'
import { BrandBootScreen } from './BrandBootScreen'

type RequireAppAuthProps = {
  children: ReactNode
}

/** Blocks personal features until Telegram user context is ready. */
export const RequireAppAuth = ({ children }: RequireAppAuthProps) => {
  const { isReady, isAuthenticated, inTelegram } = useAppAuth()

  if (!isReady) {
    return <BrandBootScreen compact />
  }

  if (inTelegram && isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="pb-24 px-6 pt-28 text-center">
      <h1 className="text-lg font-bold text-foreground">فقط از داخل Telegram</h1>
      <p className="text-sm text-muted-foreground mt-2 leading-6 max-w-sm mx-auto">
        این بخش فقط در مینی‌اپ تلگرام در دسترس است.
      </p>
    </div>
  )
}
