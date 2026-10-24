import { Link } from 'react-router-dom'
import { Languages, ListMusic, MessageSquareText } from 'lucide-react'
import { ProfileCommentActivityList } from '@/components/profile/ProfileCommentActivityList'
import { SocialSection } from '@/components/profile/social/SocialSection'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { TranslatorBioQuote } from '@/components/profile/TranslatorBioQuote'
import { useUserAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { usePublicCustomListsQuery } from '@/hooks/usePublicCustomLists'
import { toPersianDigits } from '@/lib/persianDigits'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type ProfilePublicStatsExtrasProps = {
  profileUserId: string
  translator?: SocialProfileMe['translator']
  displayName: string
}

export const ProfilePublicStatsExtras = ({
  profileUserId,
  translator,
  displayName,
}: ProfilePublicStatsExtrasProps) => {
  const commentsPath = `/u/${encodeURIComponent(profileUserId)}/activity`
  const translationsPath = translator
    ? `/u/${encodeURIComponent(profileUserId)}/translations`
    : null

  const publicComments = useUserAnimeCommentsQuery(profileUserId, true, 1, 3)
  const publicLists = usePublicCustomListsQuery(profileUserId, true)

  const commentCount = publicComments.data?.total ?? 0
  const commentHint =
    publicComments.isLoading
      ? 'در حال بارگذاری…'
      : commentCount > 0
        ? `${toPersianDigits(commentCount)} نظر`
        : 'هنوز نظری ندارد'

  const rowClass =
    'flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/40 active:bg-muted/55'

  return (
    <div className="mt-6 space-y-6">
      <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS)}>
        <Link to={commentsPath} className={rowClass}>
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
              'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
            )}
          >
            <MessageSquareText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block text-sm font-medium text-foreground">نظرات</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{commentHint}</span>
          </span>
        </Link>
        {translationsPath ? (
          <Link to={translationsPath} className={rowClass}>
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
                'border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300'
              )}
            >
              <Languages className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-sm font-medium text-foreground">آثار ترجمه</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {translator?.name ?? 'مشاهده همه'}
              </span>
            </span>
          </Link>
        ) : null}
        {publicLists.data?.lists.map((list) => (
          <Link
            key={list.id}
            to={`/u/${encodeURIComponent(profileUserId)}/lists/${encodeURIComponent(list.id)}`}
            className={rowClass}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
                'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-300'
              )}
            >
              <ListMusic className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-right">
              <span className="block text-sm font-medium text-foreground">{list.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {toPersianDigits(list.item_count)} انیمه
              </span>
            </span>
          </Link>
        ))}
      </div>

      {publicComments.data?.items.length ? (
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
