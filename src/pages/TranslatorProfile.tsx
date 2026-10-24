import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ProfilePageSkeleton } from '@/components/profile/ProfilePageSkeleton'
import { useTranslatorResolveQuery } from '@/hooks/queries/useAnimeQueries'
import UnlinkedTranslatorProfile from './UnlinkedTranslatorProfile'

/**
 * Legacy `/translators/:slug` URLs: resolve linked user without rendering a separate layout.
 */
const TranslatorProfile = () => {
  const { slug } = useParams<{ slug: string }>()
  const safeSlug = useMemo(() => String(slug || '').trim(), [slug])
  const { data, isLoading, isError } = useTranslatorResolveQuery(safeSlug || undefined)

  if (!safeSlug) {
    return (
      <div className="px-4 py-16 text-center text-muted-foreground pb-24">
        مترجم یافت نشد.
      </div>
    )
  }

  if (isLoading) {
    return <ProfilePageSkeleton />
  }

  if (!isError && data?.linked_telegram_user_id) {
    return (
      <Navigate
        to={`/u/${encodeURIComponent(data.linked_telegram_user_id)}`}
        replace
      />
    )
  }

  return <UnlinkedTranslatorProfile slug={safeSlug} />
}

export default TranslatorProfile
