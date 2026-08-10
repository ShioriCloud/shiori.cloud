import type { AnimeCard } from '@/types/catalog'

export type HomeCuratedSliderBlock = {
  type: 'curated_slider'
  id: string
  title: string
  items: AnimeCard[]
}

export type HomeCtaBannerBlock = {
  type: 'cta_banner'
  id: string
  title: string | null
  image_url: string
  link_url: string | null
  open_in_new_tab: boolean
}

export type HomeCtaCardBlock = {
  type: 'cta_card'
  id: string
  anime_id: string | null
  slug?: string | null
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  button_label: string | null
  open_in_new_tab: boolean
  hardsub_language?: 'fa' | 'en'
  video_file_type?: 'softsub' | 'hardsub'
  video_resolution?: '480p' | '720p' | '1080p'
  video_encode?: 'x264' | 'x265' | 'x265_10bit' | 'bluray'
}

export type HomeCustomBlock =
  | HomeCuratedSliderBlock
  | HomeCtaBannerBlock
  | HomeCtaCardBlock

export type HomeCustomBlocksResponse = {
  blocks: HomeCustomBlock[]
}
