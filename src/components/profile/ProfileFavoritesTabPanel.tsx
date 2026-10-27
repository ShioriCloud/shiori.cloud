import { Link } from 'react-router-dom'
import { ProfileAnimeLibraryGrid } from '@/components/profile/ProfileAnimeLibraryGrid'
import { ProfileSectionMoreLink } from '@/components/profile/ProfileSectionMoreLink'
import type { SocialProfileMe } from '@/services/socialProfile'

type Item = NonNullable<SocialProfileMe['watched']>['items'][number]

type ProfileFavoritesTabPanelProps = {
  variant: 'own' | 'public'
  items: Item[]
  orderedIds?: Array<string | number>
  profileBase: string
  watchVisible?: boolean
}

export const ProfileFavoritesTabPanel = ({
  variant,
  items,
  orderedIds,
  profileBase,
  watchVisible = true,
}: ProfileFavoritesTabPanelProps) => {
  if (variant === 'public' && !watchVisible) {
    return (
      <ProfileAnimeLibraryGrid
        items={[]}
        mode="favorites"
        emptyTitle="علاقه‌مندی‌ها در دسترس نیست"
        emptySubtitle="این بخش برای این پروفایل عمومی نیست."
      />
    )
  }

  const sortHref =
    variant === 'own' ? '/profile/favorites' : `${profileBase}?tab=favorites`

  return (
    <div className="space-y-3">
      {variant === 'own' && items.length > 0 ? (
        <div className="flex justify-end">
          <ProfileSectionMoreLink to={sortHref} label="مرتب‌سازی" />
        </div>
      ) : null}
      <ProfileAnimeLibraryGrid
        items={items}
        orderedIds={orderedIds}
        mode="favorites"
        emptyTitle={variant === 'public' ? 'علاقه‌مندی ندارد' : 'هنوز علاقه‌مندی نداری'}
        emptySubtitle={
          variant === 'public'
            ? 'انیمه‌های مورد علاقه‌اش اینجا می‌آید.'
            : 'در جزئیات انیمه قلب بزن.'
        }
      />
      {variant === 'own' && items.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="font-medium text-primary-400">
            مرور انیمه‌ها
          </Link>
        </p>
      ) : null}
    </div>
  )
}
