import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '@/utils/theme'

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDarkMode } = useTheme()

  return (
    <Sonner
      theme={isDarkMode ? 'dark' : 'light'}
      className="toaster group"
      position="top-center"
      dir="rtl"
      richColors
      closeButton
      offset="calc(var(--app-tg-top-inset) + 0.65rem)"
      mobileOffset="calc(var(--app-tg-top-inset) + 0.65rem)"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary-500 group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      style={
        {
          '--normal-bg': 'oklch(var(--card))',
          '--normal-text': 'oklch(var(--card-foreground))',
          '--normal-border': 'oklch(var(--border))',
          '--success-bg': 'oklch(0.22 0.04 155)',
          '--success-text': 'oklch(0.93 0.04 155)',
          '--success-border': 'oklch(0.55 0.14 155 / 0.45)',
          '--error-bg': 'oklch(0.24 0.06 25)',
          '--error-text': 'oklch(0.93 0.04 25)',
          '--error-border': 'oklch(0.58 0.18 25 / 0.5)',
          '--warning-bg': 'oklch(0.22 0.04 85)',
          '--warning-text': 'oklch(0.93 0.05 85)',
          '--warning-border': 'oklch(0.7 0.14 75 / 0.5)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
