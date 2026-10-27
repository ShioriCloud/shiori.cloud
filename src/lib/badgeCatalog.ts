import type {
  SocialBadgeCatalog,
  SocialBadgeCatalogItem,
  SocialBadgePublicList,
} from '@/services/socialProfile'

export const findBadgeInCatalog = (
  catalog: SocialBadgeCatalog | undefined,
  badgeId: string
): SocialBadgeCatalogItem | null => {
  if (!catalog) return null
  for (const category of catalog.categories) {
    const hit = category.badges.find((b) => b.id === badgeId)
    if (hit) return hit
  }
  return null
}

export const findPublicBadgeForDetail = (
  list: SocialBadgePublicList | undefined,
  badgeId: string
): SocialBadgeCatalogItem | null => {
  const b = list?.badges.find((x) => x.id === badgeId)
  if (!b) return null
  return {
    id: b.id,
    title: b.title,
    display_title: b.title,
    description: b.description,
    category_id: '',
    category_label: '',
    rarity: b.rarity ?? 'common',
    hidden: false,
    hint: null,
    unlock_hint: null,
    earned: true,
    earned_at: b.earned_at,
    is_new: b.is_new === true,
    progress: { current: 0, target: 0 },
    progress_parts: [],
    image_url: b.image_url,
  }
}
