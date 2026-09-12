import {
  Clock01Icon,
  Video01Icon,
  Building01Icon,
  Calendar01Icon,
  Calendar02Icon,
  LeftToRightListNumberIcon,
} from 'hugeicons-react'
import { exploreAllHref } from '@/lib/exploreParams'
import {
  toJalaliDate,
  toPersianNumber,
  translateFormat,
  translateSeason,
  translateStatus,
} from './animeDetailLabels'
import { InfoRow } from './AnimeDetailChrome'
import type { Anime } from './types'

export const AnimeDetailInfoTab = ({
  anime,
  isDonghua,
  isMovie,
  navigate,
}: {
  anime: Anime
  isDonghua: boolean
  isMovie: boolean
  navigate: (to: string) => void
}) => (
  <div className="surface-skeuo rounded-xl divide-y divide-border overflow-hidden">
    <InfoRow
      icon={<Video01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
      label="نوع"
    >
      {translateFormat(anime.format)}
    </InfoRow>
    <InfoRow
      icon={<LeftToRightListNumberIcon className="w-4 h-4 text-primary-400 shrink-0" />}
      label="تعداد قسمت‌ها"
    >
      {toPersianNumber(anime.episodes_count)} قسمت
    </InfoRow>
    <InfoRow
      icon={<Clock01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
      label="وضعیت"
    >
      {translateStatus(anime.status)}
    </InfoRow>
    <InfoRow
      icon={<Building01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
      label="استودیو"
    >
      {Array.isArray(anime.studio_links) && anime.studio_links.length > 0 ? (
        <div className="flex flex-wrap gap-x-1 justify-end">
          {anime.studio_links.map((s, index) => (
            <span key={s.slug || `${s.name}-${index}`}>
              <button
                type="button"
                className="text-primary-300 font-medium hover:underline"
                onClick={() => {
                  if (!s.slug) return
                  const studioName = s.name || s.slug
                  navigate(
                    `/studios/${encodeURIComponent(String(s.slug))}?name=${encodeURIComponent(studioName)}`
                  )
                }}
              >
                {s.name || s.slug}
              </button>
              {index < anime.studio_links!.length - 1 ? '، ' : ''}
            </span>
          ))}
        </div>
      ) : Array.isArray(anime.studios) && anime.studios.length > 0 ? (
        anime.studios.join('، ')
      ) : (
        'نامشخص'
      )}
    </InfoRow>

    {!isDonghua && (
      <InfoRow
        icon={<Calendar01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
        label="فصل پخش"
      >
        {anime.season && typeof anime.year === 'number' ? (
          <button
            type="button"
            className="text-primary-300 font-medium hover:underline"
            onClick={() => {
              const seasonKey = String(anime.season).toUpperCase()
              navigate(
                exploreAllHref({
                  listYear: anime.year,
                  listSeason: seasonKey as
                    | 'WINTER'
                    | 'SPRING'
                    | 'SUMMER'
                    | 'FALL',
                })
              )
            }}
          >
            {translateSeason(String(anime.season).toUpperCase())}{' '}
            {toPersianNumber(anime.year)}
          </button>
        ) : (
          anime.season || 'نامشخص'
        )}
      </InfoRow>
    )}

    <InfoRow
      icon={<Calendar02Icon className="w-4 h-4 text-primary-400 shrink-0" />}
      label={isMovie ? 'تاریخ اکران' : 'تاریخ شروع'}
    >
      {toJalaliDate(anime.startDate)}
    </InfoRow>

    {!isMovie && (
      <InfoRow
        icon={<Calendar02Icon className="w-4 h-4 text-primary-400 shrink-0" />}
        label="تاریخ پایان"
      >
        {toJalaliDate(anime.endDate)}
      </InfoRow>
    )}
  </div>
)
