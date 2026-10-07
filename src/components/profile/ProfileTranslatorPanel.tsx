import AnimePrefetchLink from '@/components/AnimePrefetchLink'
import { BidiText } from '@/components/BidiText'
import { MyListCompactCard } from '@/components/my-list/MyListUi'
import type { SocialProfileMe } from '@/services/socialProfile'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { toPersianDigits } from '@/lib/persianDigits'

type ProfileTranslatorPanelProps = {
  translator: NonNullable<SocialProfileMe['translator']>
}

export const ProfileTranslatorPanel = ({ translator }: ProfileTranslatorPanelProps) => (
  <div className="space-y-4">
    <div>
      <h3 className="mb-1 text-sm font-semibold text-foreground">فعالیت ترجمه</h3>
      <p className="text-xs leading-6 text-muted-foreground">
        {translator.anime_count > 0
          ? `${toPersianDigits(translator.anime_count)} عنوان در کاتالوگ شیوری`
          : 'هنوز انیمه‌ای به این مترجم وصل نشده'}
        {translator.experience ? ` · ${translator.experience}` : ''}
      </p>
      {translator.bio ? (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {translator.bio}
        </p>
      ) : null}
    </div>

    {translator.anime.length === 0 ? (
      <MyListCompactCard className="p-4 text-center text-sm text-muted-foreground">
        لیست ترجمه‌ها خالی است.
      </MyListCompactCard>
    ) : (
      <div className="grid grid-cols-3 gap-2">
        {translator.anime.map((item) => {
          const routeRef = {
            id: item.anime_id,
            slug: item.slug,
            title: item.title,
          }
          return (
            <AnimePrefetchLink
              key={item.anime_id}
              animeId={animePublicSegment(routeRef)}
              to={animeDetailPath(routeRef)}
              className="group block active:scale-[0.98] transition-transform"
              aria-label={`مشاهده ${item.title}`}
            >
              <div className="media-card-skeuo rounded-xl">
                <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  {item.role ? (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-medium text-white">
                      {item.role}
                    </span>
                  ) : null}
                  <div className="absolute bottom-0 left-0 right-0 p-2 pt-8">
                    <BidiText
                      as="p"
                      className="text-[10px] font-semibold text-white line-clamp-2 text-left"
                    >
                      {item.title}
                    </BidiText>
                  </div>
                </div>
              </div>
            </AnimePrefetchLink>
          )
        })}
      </div>
    )}
  </div>
)
