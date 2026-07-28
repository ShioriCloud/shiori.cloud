import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  hardsubLanguageLabel,
  mediaSpecTagLabel,
  normalizeVideoFileType,
  type HardsubLanguage,
  type VideoFileType,
} from '@/utils/animeMediaTags'

type MediaSpecTagsProps = {
  hardsubLanguage: HardsubLanguage
  videoFileType?: VideoFileType | string | null
  className?: string
}

export function MediaSpecTags({
  hardsubLanguage,
  videoFileType,
  className,
}: MediaSpecTagsProps) {
  const fileType = normalizeVideoFileType(videoFileType)
  const isEnglishHardsub = hardsubLanguage === 'en'

  // Softsub + Persian: no chip. English hardsub language always gets a notice.
  // Persian hardsub keeps the existing hardsub chip.
  if (!isEnglishHardsub && fileType !== 'hardsub') return null

  const label = isEnglishHardsub
    ? hardsubLanguageLabel('en')
    : mediaSpecTagLabel({
        video_file_type: fileType,
        hardsub_language: hardsubLanguage,
      })

  return (
    <Badge
      variant={isEnglishHardsub ? 'premium' : 'secondary'}
      className={cn(
        'shrink-0 rounded-full px-2 py-0 text-[10px] font-medium leading-5',
        isEnglishHardsub && 'font-semibold',
        !isEnglishHardsub &&
          'border-cyan-500/35 bg-cyan-500/15 text-cyan-200',
        className
      )}
    >
      {label}
    </Badge>
  )
}
