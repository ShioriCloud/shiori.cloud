import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  Award,
  Ban,
  ChevronLeft,
  History,
  ListVideo,
  Settings,
  UserRound,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { cn } from '@/lib/utils'

type ProfileAccountSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  displayName: string
  roleLabel?: string | null
}

const Row = ({
  to,
  icon,
  label,
  onNavigate,
}: {
  to: string
  icon: ReactNode
  label: string
  onNavigate: () => void
}) => (
  <Link
    to={to}
    onClick={onNavigate}
    className={cn(
      'flex items-center gap-3 px-3 py-3',
      'transition-colors active:bg-muted/50'
    )}
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/35 text-muted-foreground">
      {icon}
    </span>
    <span className="min-w-0 flex-1 text-right text-sm font-medium text-foreground">{label}</span>
    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
  </Link>
)

export const ProfileAccountSheet = ({
  open,
  onOpenChange,
  displayName,
  roleLabel,
}: ProfileAccountSheetProps) => {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-border/60 px-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="space-y-1 border-b border-border/50 px-4 py-3 text-right">
          <SheetTitle className="text-base">حساب من</SheetTitle>
          <SheetDescription className="text-xs">
            {displayName}
            {roleLabel ? ` · ${roleLabel}` : ''}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 py-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">فعالیت من</p>
            <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
              <Row
                to="/profile/watch-archive"
                icon={<Archive className="h-4 w-4" />}
                label="آرشیو تماشای من"
                onNavigate={close}
              />
              <Row
                to="/profile/playlists"
                icon={<ListVideo className="h-4 w-4" />}
                label="پلی‌لیست‌های من"
                onNavigate={close}
              />
              <Row
                to="/profile/badges"
                icon={<Award className="h-4 w-4" />}
                label="نشان‌ها"
                onNavigate={close}
              />
              <Row
                to="/my-list"
                icon={<History className="h-4 w-4" />}
                label="تاریخچه و دانلودها"
                onNavigate={close}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">حساب</p>
            <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
              <Row
                to="/profile/settings#display-name"
                icon={<UserRound className="h-4 w-4" />}
                label="ویرایش پروفایل"
                onNavigate={close}
              />
              <Row
                to="/profile/blocked"
                icon={<Ban className="h-4 w-4" />}
                label="کاربران مسدود"
                onNavigate={close}
              />
              <Row
                to="/profile/settings"
                icon={<Settings className="h-4 w-4" />}
                label="تنظیمات"
                onNavigate={close}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
