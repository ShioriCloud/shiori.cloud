import { HomeRailScroller, HomeRailSlide } from '@/components/home/HomeRailScroller'
import { AnimePosterCard } from '@/components/anime/AnimePosterCard'
import type { HomeCuratedSliderBlock } from '@/types/home'
import type { UiAnimeCard } from '@/utils/api'

export const CuratedSliderBlock = ({ block }: { block: HomeCuratedSliderBlock }) => {
  if (!block.items?.length) return null

  return (
    <section className="space-y-3">
      <div className="px-4">
        <h2 className="text-base font-semibold text-foreground text-right">{block.title}</h2>
      </div>
      <HomeRailScroller>
        {block.items.map((anime) => (
          <HomeRailSlide key={anime.id}>
            <AnimePosterCard anime={anime as UiAnimeCard} />
          </HomeRailSlide>
        ))}
      </HomeRailScroller>
    </section>
  )
}
