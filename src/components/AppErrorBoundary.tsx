import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import logo from '@/assets/images/shiori-logo.svg'

type Props = { children: ReactNode }
type State = { hasError: boolean }

/** Catches render crashes so the Telegram mini-app does not white-screen. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack)
  }

  private retry = () => {
    this.setState({ hasError: false })
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 pb-[max(2rem,var(--app-tg-bottom-inset))] pt-[max(2rem,var(--app-tg-top-inset))] text-center"
        role="alert"
      >
        <img src={logo} alt="" className="mb-6 h-8 w-auto opacity-90" />
        <h1 className="text-lg font-semibold text-foreground">یه مشکلی پیش اومد</h1>
        <p className="mt-2 max-w-xs text-sm leading-7 text-muted-foreground">
          صفحه درست بارگذاری نشد. می‌توانید دوباره تلاش کنید یا برنامه را از نو بارگذاری کنید.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            className={cn(
              'h-11 w-full font-semibold ui-elevated-primary bg-primary-500 text-white hover:bg-primary-500/90'
            )}
            onClick={this.retry}
          >
            تلاش مجدد
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-11 w-full font-semibold ui-elevated border-black/[0.08] bg-white text-foreground hover:bg-muted/50 dark:border-border dark:bg-card'
            )}
            onClick={this.reload}
          >
            بارگذاری دوباره
          </Button>
        </div>
      </div>
    )
  }
}
