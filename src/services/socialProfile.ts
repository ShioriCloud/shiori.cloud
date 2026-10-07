import { shioriFetch } from '../lib/shioriApi'

export type SocialProfileMe = {
  enabled: boolean
  mode: 'off' | 'allowlist' | 'on'
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
  watched?: {
    items: Array<{
      anime_id: string
      slug: string | null
      title: string
      image: string
      episodes_watched: number
      episodes_total: number | null
      user_rating: number | null
      updated_at: string
    }>
    total: number
    page: number
    limit: number
  }
}

export const fetchSocialProfileMe = async (page = 1, limit = 60): Promise<SocialProfileMe> =>
  shioriFetch<SocialProfileMe>(
    `/user-social-profile/me?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  )
