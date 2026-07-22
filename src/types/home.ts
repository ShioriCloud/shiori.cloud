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
  title: string
  subtitle: string | null
  description: string | null
  image_url: string
  link_url: string | null
  button_label: string | null
  open_in_new_tab: boolean
}

export type HomeCustomBlock =
  | HomeCuratedSliderBlock
  | HomeCtaBannerBlock
  | HomeCtaCardBlock

export type HomeCustomBlocksResponse = {
  blocks: HomeCustomBlock[]
}
