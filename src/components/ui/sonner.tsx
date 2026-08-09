import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '@/utils/theme'
import { cn } from '@/lib/utils'

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { isDarkMode } = useTheme()

  return (
    <Sonner
      theme={isDarkMode ? 'dark' : 'light'}
      className={cn('toaster group font-sans', className)}
      position="top-center"
      dir="rtl"
      richColors
      closeButton
      offset="calc(var(--app-tg-top-inset) + 0.65rem)"
      mobileOffset="calc(var(--app-tg-top-inset) + 0.65rem)"
      toastOptions={{
        classNames: {
          toast: cn(
            'group toast font-sans',
            'group-[.toaster]:bg-card group-[.toaster]:text-card-foreground',
            'group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            'group-[.toaster]:rounded-2xl'
          ),
          title: 'font-sans text-sm font-medium leading-6',
          description: 'font-sans text-sm text-muted-foreground leading-6',
          actionButton:
            'font-sans group-[.toast]:bg-primary-500 group-[.toast]:text-white group-[.toast]:font-medium',
          cancelButton:
            'font-sans group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: 'group-[.toast]:border-border group-[.toast]:bg-card',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
