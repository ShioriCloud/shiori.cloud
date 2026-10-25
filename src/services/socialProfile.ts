import { shioriFetch } from '../lib/shioriApi'

export type SocialProfileMe = {
  enabled: boolean
  mode: 'off' | 'allowlist' | 'on'
  is_self?: boolean
  telegram_user_id?: string
  profile?: {
    display_name: string
    username: string | null
    photo_url: string | null
    member_since: string
    followers_count: number
    following_count: number
    role_badges?: Array<{ id: string; title: string }>
  }
  summary?: {
    anime_count: number
    episodes_watched: number
    ratings_count: number
    average_rating: number | null
    active_days: number
    estimated_watch_hours: number
    estimated_watch_label: string
  }
  top_genres?: Array<{ slug: string; label: string; percent: number }>
  by_format?: Array<{ format: string; count: number; episodes_watched: number }>
  badges?: Array<{ id: string; title: string; is_new?: boolean }>
  badges_summary?: { earned_count: number; total_count: number }
  watched?: {
    items: Array<{
      anime_id: string
      slug: string | null
      title: string
      image: string
      episodes_watched: number
      episodes_total: number | null
      user_rating: number | null
      is_favorite?: boolean
      updated_at: string
    }>
    total: number
    page: number
    limit: number
  }
  translator?: {
    id: string
    slug: string
    name: string
    bio: string | null
    experience: string | null
    is_active: boolean
    anime_count: number
    anime: Array<{
      anime_id: string
      slug: string | null
      title: string
      image: string
      role: string | null
    }>
  } | null
  relationship?: {
    is_following: boolean
    follows_you?: boolean
    is_muted?: boolean
    blocked_by_you?: boolean
  }
  privacy?: {
    watch_activity_hidden: boolean
  }
}

export type SocialProfileUserListItem = {
  telegram_user_id: string
  display_name: string
  username: string | null
  photo_url: string | null
  role_badges?: Array<{ id: string; title: string }>
}

export type SocialProfileUserList = {
  enabled: boolean
  mode: 'off' | 'allowlist' | 'on'
  items: SocialProfileUserListItem[]
  total: number
  page: number
  limit: number
}

export type SocialProfileFollowSuggestionItem = SocialProfileUserListItem & {
  mutual_connections: number
}

export type SocialProfileFollowSuggestions = {
  enabled: boolean
  mode: 'off' | 'allowlist' | 'on'
  items: SocialProfileFollowSuggestionItem[]
}

export type SocialProfileFeedItem =
  | {
      type: 'watch_progress' | 'rating' | 'list_add'
      actor: SocialProfileUserListItem
      anime_id: string
      slug: string | null
      title: string
      image: string
      episodes_watched: number
      episodes_total: number | null
      user_rating?: number | null
      updated_at: string
    }
  | {
      type: 'anime_comment'
      actor: SocialProfileUserListItem
      comment_id: string
      comment_preview: string
      anime_id: string
      slug: string | null
      title: string
      image: string
      updated_at: string
    }
  | {
      type: 'public_list_add'
      actor: SocialProfileUserListItem
      list_id: string
      list_name: string
      anime_id: string
      slug: string | null
      title: string
      image: string
      updated_at: string
    }
  | {
      type: 'user_follow'
      actor: SocialProfileUserListItem
      target: SocialProfileUserListItem
      updated_at: string
    }

export type SocialProfileFeed = {
  enabled: boolean
  mode: 'off' | 'allowlist' | 'on'
  items: SocialProfileFeedItem[]
  total: number
  page: number
  limit: number
}

export type SocialBadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type SocialBadgeCatalogItem = {
  id: string
  title: string
  display_title: string
  description: string
  category_id: string
  category_label: string
  rarity: SocialBadgeRarity
  hidden: boolean
  hint: string | null
  earned: boolean
  earned_at: string | null
  is_new: boolean
  progress: { current: number; target: number }
  progress_parts: Array<{
    label: string
    current: number
    target: number
    complete: boolean
  }>
  image_url: string | null
}

export type SocialBadgeCatalog = {
  enabled: boolean
  earned_count: number
  total_count: number
  showcase: string[]
  categories: Array<{
    id: string
    label: string
    badges: SocialBadgeCatalogItem[]
  }>
}

export type SocialBadgePublicList = {
  enabled: boolean
  earned_count: number
  total_count: number
  display_name: string
  showcase: string[]
  badges: Array<{
    id: string
    title: string
    description: string
    earned_at: string
    is_new?: boolean
    rarity?: SocialBadgeRarity
    image_url: string | null
  }>
}

export const fetchSocialBadgeCatalogMe = async (): Promise<SocialBadgeCatalog> =>
  shioriFetch<SocialBadgeCatalog>('/user-social-profile/me/badges')

export const updateSocialBadgeShowcase = async (badgeIds: string[]) =>
  shioriFetch<{ showcase: string[] }>('/user-social-profile/me/badges/showcase', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badge_ids: badgeIds }),
  })

export const fetchSocialBadgeCatalogUser = async (
  telegramUserId: string
): Promise<SocialBadgePublicList> =>
  shioriFetch<SocialBadgePublicList>(
    `/user-social-profile/users/${encodeURIComponent(telegramUserId)}/badges`
  )

export const fetchSocialProfileMe = async (page = 1, limit = 60): Promise<SocialProfileMe> =>
  shioriFetch<SocialProfileMe>(
    `/user-social-profile/me?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  )

export const updateSocialDisplayName = async (displayName: string) =>
  shioriFetch<{ ok: boolean; display_name: string }>('/user-social-profile/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName }),
  })

export const fetchSocialProfileUser = async (
  telegramUserId: string,
  page = 1,
  limit = 60
): Promise<SocialProfileMe> =>
  shioriFetch<SocialProfileMe>(
    `/user-social-profile/users/${encodeURIComponent(telegramUserId)}?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  )

export const followSocialUser = async (targetTelegramUserId: string) =>
  shioriFetch<{ ok: boolean; is_following: boolean }>(
    `/user-social-profile/follow/${encodeURIComponent(targetTelegramUserId)}`,
    { method: 'POST' }
  )

export const unfollowSocialUser = async (targetTelegramUserId: string) =>
  shioriFetch<{ ok: boolean; is_following: boolean }>(
    `/user-social-profile/follow/${encodeURIComponent(targetTelegramUserId)}`,
    { method: 'DELETE' }
  )

export const fetchSocialFollowers = async (
  telegramUserId: string,
  page = 1,
  limit = 30
): Promise<SocialProfileUserList> =>
  shioriFetch<SocialProfileUserList>(
    `/user-social-profile/users/${encodeURIComponent(telegramUserId)}/followers?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  )

export const fetchSocialFollowing = async (
  telegramUserId: string,
  page = 1,
  limit = 30
): Promise<SocialProfileUserList> =>
  shioriFetch<SocialProfileUserList>(
    `/user-social-profile/users/${encodeURIComponent(telegramUserId)}/following?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  )

export const fetchSocialFeed = async (page = 1, limit = 30): Promise<SocialProfileFeed> =>
  shioriFetch<SocialProfileFeed>(
    `/user-social-profile/feed?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  )

export const fetchSocialFollowSuggestions = async (limit = 8): Promise<SocialProfileFollowSuggestions> =>
  shioriFetch<SocialProfileFollowSuggestions>(
    `/user-social-profile/suggestions?limit=${encodeURIComponent(String(limit))}`
  )

export const searchSocialUsers = async (
  query: string,
  limit = 20
): Promise<SocialProfileUserList> =>
  shioriFetch<SocialProfileUserList>(
    `/user-social-profile/search?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(String(limit))}`
  )

export const fetchBlockedSocialUsers = async () =>
  shioriFetch<{ enabled: boolean; items: SocialProfileUserListItem[] }>(
    '/user-social-profile/blocks'
  )

export const blockSocialUser = async (targetTelegramUserId: string) =>
  shioriFetch<{ ok: boolean; is_blocked: boolean }>(
    `/user-social-profile/block/${encodeURIComponent(targetTelegramUserId)}`,
    { method: 'POST' }
  )

export const unblockSocialUser = async (targetTelegramUserId: string) =>
  shioriFetch<{ ok: boolean; is_blocked: boolean }>(
    `/user-social-profile/block/${encodeURIComponent(targetTelegramUserId)}`,
    { method: 'DELETE' }
  )

export const muteSocialUser = async (targetTelegramUserId: string) =>
  shioriFetch<{ ok: boolean; is_muted: boolean }>(
    `/user-social-profile/mute/${encodeURIComponent(targetTelegramUserId)}`,
    { method: 'POST' }
  )

export const unmuteSocialUser = async (targetTelegramUserId: string) =>
  shioriFetch<{ ok: boolean; is_muted: boolean }>(
    `/user-social-profile/mute/${encodeURIComponent(targetTelegramUserId)}`,
    { method: 'DELETE' }
  )
