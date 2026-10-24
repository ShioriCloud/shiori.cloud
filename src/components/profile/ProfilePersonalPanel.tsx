import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Heart, Languages, ListMusic, MessageSquareText } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
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
  variant?: 'self' | 'public'
  /** Target user for translations deep link (avoids /translators slug hop). */
  profileUserId?: string
}

export const ProfilePersonalPanel = ({
  translator,
  variant = 'self',
  profileUserId,
}: ProfilePersonalPanelProps) => {
  const translationsPath =
    profileUserId && translator
      ? `/u/${encodeURIComponent(profileUserId)}/translations`
      : translator
        ? `/translators/${encodeURIComponent(translator.slug)}`
        : null

  return (
  <div className="space-y-6">
    {variant === 'self' ? (
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
        {translationsPath ? (
          <PersonalRow
            to={translationsPath}
            icon={<Languages className="h-4 w-4" />}
            label="آثار ترجمه"
            hint={translator?.name ?? 'مشاهده همه'}
          />
        ) : null}
        <PersonalRow
          to="/profile/activity"
          icon={<MessageSquareText className="h-4 w-4" />}
          label="نظرات و فعالیت"
          hint="نظرها و پاسخ‌هایی که نوشته‌ای"
        />
      </MyListCompactCard>
    ) : (
      <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
        {translator ? (
          <>
            {translationsPath ? (
              <PersonalRow
                to={translationsPath}
                icon={<Languages className="h-4 w-4" />}
                label="آثار ترجمه"
                hint={translator.name}
              />
            ) : null}
            {translator.bio ? (
              <div className="px-3 py-3 text-right">
                <p className="text-xs font-medium text-muted-foreground">درباره مترجم</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {translator.bio}
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            بخش شخصی فقط برای خود کاربر است.
          </div>
        )}
      </MyListCompactCard>
    )}
  </div>
  )
}
