import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Heart, Languages, ListMusic, MessageSquareText } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { ProfileTranslatorPanel } from './ProfileTranslatorPanel'

type RowProps = {
  to: string
  icon: ReactNode
  label: string
  hint: string
}

const PersonalRow = ({ to, icon, label, hint }: RowProps) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-3',
      'transition-colors hover:bg-muted/40 active:bg-muted/55'
    )}
  >
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
        'border-border/50 bg-muted/35 text-muted-foreground'
      )}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1 text-right">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
    </span>
    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
  </Link>
)

type ProfilePersonalPanelProps = {
  translator?: SocialProfileMe['translator']
}

export const ProfilePersonalPanel = ({ translator }: ProfilePersonalPanelProps) => (
  <div className="space-y-6">
    <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
      <PersonalRow
        to="/my-list"
        icon={<Heart className="h-4 w-4" />}
        label="علاقه‌مندی‌ها"
        hint="لیست تماشا و پیشرفت قسمت‌ها"
      />
      <PersonalRow
        to="/my-list?tab=lists"
        icon={<ListMusic className="h-4 w-4" />}
        label="پلی‌لیست‌ها"
        hint="لیست‌های شخصی شیوری"
      />
      {translator ? (
        <PersonalRow
          to={`/translators/${encodeURIComponent(translator.slug)}`}
          icon={<Languages className="h-4 w-4" />}
          label="صفحه مترجم در کاتالوگ"
          hint={translator.name}
        />
      ) : null}
      <div className="flex items-center gap-3 px-3 py-3 opacity-60">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
            'border-border/50 bg-muted/35 text-muted-foreground'
          )}
        >
          <MessageSquareText className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 text-right">
          <span className="block text-sm font-medium text-foreground">نظرات و فعالیت</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">به‌زودی</span>
        </span>
      </div>
    </MyListCompactCard>

    {translator ? <ProfileTranslatorPanel translator={translator} /> : null}
  </div>
)
