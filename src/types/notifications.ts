export type UserNotificationRow = {
  id: string
  kind: string
  title: string
  message: string
  href: string | null
  anime_id: string | null
  anime_cover_image?: string | null
  episode_number: number | null
  is_read: boolean
  created_at: string
  actor_telegram_user_id?: string | null
  actor_photo_url?: string | null
  actor_display_name?: string | null
  content_body?: string | null
  activity_key?: string | null
  liked_by_me?: boolean
  like_count?: number
}

export type NotificationPreferences = {
  notify_new_episode: boolean
  notify_telegram_dm: boolean
  notify_social_follow: boolean
  notify_comment_reply: boolean
  notify_comment_like: boolean
  notify_following_comment: boolean
  notify_feed_activity_like: boolean
  notify_feed_activity_note: boolean
  hide_telegram_username: boolean
  hide_watch_activity: boolean
}
