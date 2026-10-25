import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Heart, Languages, ListMusic, MessageSquareText } from 'lucide-react'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { SocialSection } from '@/components/profile/social/SocialSection'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { TranslatorBioQuote } from '@/components/profile/TranslatorBioQuote'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useAnimeCommentsAccess, useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { toPersianDigits } from '@/lib/persianDigits'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type RowProps = {
  to: string
  icon: ReactNode
  label: string
  hint: string
  iconClass?: string
}

const PersonalRow = ({ to, icon, label, hint, iconClass }: RowProps) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-3 py-3',
      'transition-colors hover:bg-muted/40 active:bg-muted/55'
    )}
  >
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
        iconClass ??
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

const PersonalLinksCard = ({ children }: { children: ReactNode }) => (
  <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>{children}</div>
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
  const { user, isReady, inTelegram } = useAppAuth()
  const { data: commentsAccess } = useAnimeCommentsAccess(
    isReady && (inTelegram || Boolean(user))
  )
  const commentsEnabled = commentsAccess?.enabled === true

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
    commentsEnabled && variant === 'public' && Boolean(profileUserId),
    1,
    3
  )
  const publicLists = usePublicCustomListsQuery(
    profileUserId,
    variant === 'public' && Boolean(profileUserId)
  )

  if (variant === 'self') {
    return (
      <div className="space-y-6">
        <PersonalLinksCard>
          {translationsPath ? (
            <PersonalRow
              to={translationsPath}
              icon={<Languages className="h-4 w-4" />}
              label="آثار ترجمه"
              hint={translator?.name ?? 'مشاهده همه'}
              iconClass="border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300"
            />
          ) : null}
          <PersonalRow
            to="/profile/favorites"
            icon={<Heart className="h-4 w-4" />}
            label="علاقه‌مندی‌ها"
            hint="انیمه‌هایی که قلب زدی"
            iconClass="border-rose-400/30 bg-rose-400/10 text-rose-600 dark:text-rose-300"
          />
          <PersonalRow
            to="/my-list?tab=lists"
            icon={<ListMusic className="h-4 w-4" />}
            label="پلی‌لیست‌ها"
            hint="لیست‌های شخصی شیوری"
            iconClass="border-violet-400/30 bg-violet-400/10 text-violet-700 dark:text-violet-300"
          />
          {commentsEnabled ? (
            <PersonalRow
              to="/profile/activity"
              icon={<MessageSquareText className="h-4 w-4" />}
              label="نظرات و فعالیت"
              hint="نظرها و پاسخ‌هایی که نوشته‌ای"
              iconClass="border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
            />
          ) : null}
        </PersonalLinksCard>
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
        <div className={cn(SOCIAL_SURFACE_CLASS, 'flex items-center gap-3 px-3 py-3')}>
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
              'border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-200'
            )}
          >
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block text-sm font-medium text-foreground">عضو شیوری</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">از {joined}</span>
          </span>
        </div>
      ) : null}

      <PersonalLinksCard>
        {commentsEnabled ? (
          <PersonalRow
            to={commentsPath}
            icon={<MessageSquareText className="h-4 w-4" />}
            label="نظرات"
            hint={commentHint}
            iconClass="border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
          />
        ) : null}
        {translationsPath ? (
          <PersonalRow
            to={translationsPath}
            icon={<Languages className="h-4 w-4" />}
            label="آثار ترجمه"
            hint={translator?.name ?? 'مشاهده همه'}
            iconClass="border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300"
          />
        ) : null}
        {publicLists.data?.lists.map((list) => (
          <PersonalRow
            key={list.id}
            to={`/u/${encodeURIComponent(profileUserId ?? '')}/lists/${encodeURIComponent(list.id)}`}
            icon={<ListMusic className="h-4 w-4" />}
            label={list.name}
            hint={`${toPersianDigits(list.item_count)} انیمه`}
            iconClass="border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-300"
          />
        ))}
      </PersonalLinksCard>

      {commentsEnabled && publicComments.data?.items.length ? (
        <SocialSection title="آخرین نظرات" description="از میان فعالیت‌های اخیر">
          <ProfileCommentActivityList items={publicComments.data.items} tone="public" />
          {commentCount > publicComments.data.items.length ? (
            <Link
              to={commentsPath}
              className="block text-center text-sm font-medium text-primary-400"
            >
              همه نظرات
            </Link>
          ) : null}
        </SocialSection>
      ) : null}

      {translator?.bio ? (
        <TranslatorBioQuote bio={translator.bio} attribution={displayName} />
      ) : null}
    </div>
  )
}
