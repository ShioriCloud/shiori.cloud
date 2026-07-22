import type { ComponentType } from 'react'
import {
  Bookmark01Icon,
  FavouriteIcon,
  SparklesIcon,
  StarIcon,
} from 'hugeicons-react'
import { Flame } from 'lucide-react'
import type { ShioriListIcon } from '@/store/myListStore'

export const SHIORI_LIST_ICONS: {
  id: ShioriListIcon
  label: string
  Icon: ComponentType<{ className?: string }>
}[] = [
  { id: 'heart', label: 'علاقه', Icon: FavouriteIcon },
  { id: 'star', label: 'ستاره', Icon: StarIcon },
  { id: 'fire', label: 'آتش', Icon: ({ className }) => <Flame className={className} /> },
  { id: 'bookmark', label: 'نشان', Icon: Bookmark01Icon },
  { id: 'sparkle', label: 'درخشش', Icon: SparklesIcon },
]

export const getListIcon = (icon: ShioriListIcon) =>
  SHIORI_LIST_ICONS.find((item) => item.id === icon) ?? SHIORI_LIST_ICONS[0]
