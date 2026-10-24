import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Heart, Languages, ListMusic, MessageSquareText } from 'lucide-react'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { TranslatorBioQuote } from '@/components/profile/TranslatorBioQuote'
import { useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { toPersianDigits } from '@/lib/persianDigits'
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

const formatMemberSince = (iso?: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })
}

type ProfilePersonalPanelProps = {
  translator?: SocialProfileMe['translator']
  variant?: 'self' | 'public'
  /** Target user for translations deep link (avoids /translators slug hop). */
  profileUserId?: string
  memberSince?: string | null
  displayName?: string
}

export const ProfilePersonalPanel = ({
  translator,
  variant = 'self',
  profileUserId,
  memberSince,
  displayName,
}: ProfilePersonalPanelProps) => {
  const translationsPath =
    profileUserId && translator
      ? `/u/${encodeURIComponent(profileUserId)}/translations`
      : translator
        ? `/translators/${encodeURIComponent(translator.slug)}`
        : null
  const commentsPath = profileUserId
    ? `/u/${encodeURIComponent(profileUserId)}/activity`
    : '/profile/activity'
  const joined = formatMemberSince(memberSince)
  const publicComments = useUserAnimeCommentsQuery(
    profileUserId,
    variant === 'public' && Boolean(profileUserId),
    1,
    3
  )

  if (variant === 'self') {
    return (
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
      </div>
    )
  }

  const commentCount = publicComments.data?.total ?? 0
  const commentHint =
    publicComments.isLoading
      ? 'در حال بارگذاری…'
      : commentCount > 0
        ? `${toPersianDigits(commentCount)} نظر`
        : 'هنوز نظری ندارد'

  return (
    <div className="space-y-6">
      {joined ? (
        <MyListCompactCard className="flex items-center gap-3 px-3 py-3">
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
              'border-border/50 bg-muted/35 text-muted-foreground'
            )}
          >
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block text-sm font-medium text-foreground">عضو شیوری</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">از {joined}</span>
          </span>
        </MyListCompactCard>
      ) : null}

      <MyListCompactCard className="overflow-hidden divide-y divide-border/40">
        <PersonalRow
          to={commentsPath}
          icon={<MessageSquareText className="h-4 w-4" />}
          label="نظرات"
          hint={commentHint}
        />
        {translationsPath ? (
          <PersonalRow
            to={translationsPath}
            icon={<Languages className="h-4 w-4" />}
            label="آثار ترجمه"
            hint={translator?.name ?? 'مشاهده همه'}
          />
        ) : null}
      </MyListCompactCard>

      {publicComments.data?.items.length ? (
        <div className="space-y-3">
          <ProfileCommentActivityList items={publicComments.data.items} tone="public" />
          {commentCount > publicComments.data.items.length ? (
            <Link
              to={commentsPath}
              className="block text-center text-sm font-medium text-primary-400"
            >
              همه نظرات
            </Link>
          ) : null}
        </div>
      ) : null}

      {translator?.bio ? (
        <TranslatorBioQuote bio={translator.bio} attribution={displayName} />
      ) : null}
    </div>
  )
}
