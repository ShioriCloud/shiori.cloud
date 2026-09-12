import { toPersianNumber } from './animeDetailLabels'
import { EmptyBlock, SimilarPosterCard } from './AnimeDetailChrome'

export const AnimeDetailSimilarTab = ({
  similarAnime,
  similarLoading,
  hasGenres,
}: {
  similarAnime: Array<{ id: number | string; slug?: string | null; title: string; image: string }>
  similarLoading: boolean
  hasGenres: boolean
}) => (
  <div className="space-y-3 pb-2">
    <div className="flex items-baseline justify-between">
      <h2 className="text-base font-semibold text-foreground">آثار مشابه</h2>
      <span className="text-xs text-muted-foreground">
        {similarLoading
          ? '…'
          : similarAnime.length > 0
            ? `${toPersianNumber(similarAnime.length)} عنوان`
            : 'خالی'}
      </span>
    </div>

    {similarLoading ? (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    ) : similarAnime.length > 0 ? (
      <div className="grid grid-cols-3 gap-3">
        {similarAnime.map((item) => (
          <SimilarPosterCard key={item.id} anime={item} />
        ))}
      </div>
    ) : (
      <EmptyBlock
        message={
          hasGenres
            ? 'انیمه مشابهی در کاتالوگ شیوری پیدا نشد.'
            : 'ژانری برای پیشنهاد آثار مشابه ثبت نشده.'
        }
      />
    )}
  </div>
)
