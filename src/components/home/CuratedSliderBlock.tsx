import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { AnimePosterCard } from '@/components/anime/AnimePosterCard'
import type { HomeCuratedSliderBlock } from '@/types/home'
import type { UiAnimeCard } from '@/utils/api'

export const CuratedSliderBlock = ({ block }: { block: HomeCuratedSliderBlock }) => {
  if (!block.items?.length) return null

  const swiperKey = `${block.id}-${block.items.map((item) => item.id).join(',')}`

  return (
    <section className="space-y-3">
      <div className="px-4">
        <h2 className="text-base font-semibold text-foreground text-right">{block.title}</h2>
      </div>
      <Swiper
        key={swiperKey}
        modules={[FreeMode]}
        spaceBetween={10}
        slidesPerView="auto"
        freeMode
        observer
        observeParents
        watchOverflow
        className="home-section-swiper !px-4"
      >
        {block.items.map((anime) => (
          <SwiperSlide key={anime.id} className="home-section-slide">
            <AnimePosterCard anime={anime as UiAnimeCard} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
