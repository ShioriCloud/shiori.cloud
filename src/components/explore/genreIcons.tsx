import type { ComponentType } from 'react'
import {
  AdventureIcon,
  BookOpen01Icon,
  Car01Icon,
  Compass01Icon,
  FavouriteIcon,
  FireIcon,
  GameController01Icon,
  HappyIcon,
  InLoveIcon,
  MagicWand01Icon,
  MaskIcon,
  MusicNote01Icon,
  School01Icon,
  SkullIcon,
  StarIcon,
  Sword01Icon,
  TagsIcon,
} from 'hugeicons-react'

type IconComp = ComponentType<{ className?: string }>

const GENRE_ICON_MAP: Record<string, IconComp> = {
  action: Sword01Icon,
  adventure: AdventureIcon,
  comedy: HappyIcon,
  drama: MaskIcon,
  fantasy: MagicWand01Icon,
  horror: SkullIcon,
  mystery: SkullIcon,
  romance: InLoveIcon,
  'sci-fi': StarIcon,
  scifi: StarIcon,
  'science-fiction': StarIcon,
  sports: GameController01Icon,
  sport: GameController01Icon,
  supernatural: FireIcon,
  thriller: SkullIcon,
  music: MusicNote01Icon,
  school: School01Icon,
  mecha: Car01Icon,
  slice_of_life: BookOpen01Icon,
  'slice-of-life': BookOpen01Icon,
  psychological: MaskIcon,
  ecchi: FavouriteIcon,
  hentai: FavouriteIcon,
  historical: Compass01Icon,
}

export const genreIconForSlug = (slug: string): IconComp => {
  const key = String(slug ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
  return GENRE_ICON_MAP[key] ?? TagsIcon
}
