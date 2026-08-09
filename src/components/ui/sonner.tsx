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
      richColors={false}
      closeButton={false}
      visibleToasts={3}
      offset="calc(var(--app-tg-top-inset) + 0.65rem)"
      mobileOffset={{
        top: 'calc(var(--app-tg-top-inset) + 0.65rem)',
        right: '0.75rem',
        left: '0.75rem',
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: cn(
            'group toast font-sans',
            'group-[.toaster]:bg-card group-[.toaster]:text-card-foreground',
            'group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            'group-[.toaster]:rounded-2xl'
          ),
          title: 'font-sans text-sm font-medium leading-6',
          description: 'font-sans mt-1 text-xs leading-5 text-muted-foreground',
          actionButton: cn(
            'font-sans !h-8 !min-h-0 !rounded-lg !px-2.5 !text-[11px] !font-semibold',
            'group-[.toast]:bg-muted group-[.toast]:text-foreground'
          ),
          cancelButton:
            'font-sans group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          icon: 'mt-0.5',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
