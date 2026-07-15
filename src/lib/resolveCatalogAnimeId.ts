import {
  animeCardMatchesRouteParam,
  isAnimeUuid,
  normalizeAnimeSlug,
  type AnimeRouteRef,
} from '@/lib/animePaths'
import * as catalog from '@/services/catalogSource'

const findCardByRouteParam = (
  cards: AnimeRouteRef[],
  routeParam: string,
): AnimeRouteRef | undefined => cards.find((card) => animeCardMatchesRouteParam(card, routeParam))

/**
 * Resolve public route param (uuid or slug) to catalog record id.
 * Uses GET /anime-catalog/:slug on the API — not the full /all catalog.
 */
export const resolveCatalogAnimeRecordId = async (
  routeParam: string | number,
  prefetchedCards?: AnimeRouteRef[],
): Promise<string | number> => {
  const raw = String(routeParam ?? '').trim()
  if (!raw) throw new Error('شناسه انیمه نامعتبر است')
  if (isAnimeUuid(raw)) return raw

  const fromPrefetched = prefetchedCards
    ? findCardByRouteParam(prefetchedCards, raw)
    : undefined
  if (fromPrefetched?.id != null) return fromPrefetched.id

  const bySlug = await catalog.getAnimeCardById(raw)
  if (bySlug?.id != null) return bySlug.id

  const normalized = normalizeAnimeSlug(raw)
  if (normalized && normalized !== raw) {
    const byNormalized = await catalog.getAnimeCardById(normalized)
    if (byNormalized?.id != null) return byNormalized.id
  }

  const search = await catalog.searchAnimeCards({ query: raw, limit: 50 })
  const fromSearch = findCardByRouteParam(search.items ?? [], raw)
  if (fromSearch?.id != null) return fromSearch.id

  const searchWords = normalized.replace(/-/g, ' ').trim()
  if (searchWords && searchWords !== raw) {
    const wordSearch = await catalog.searchAnimeCards({ query: searchWords, limit: 50 })
    const fromWords = findCardByRouteParam(wordSearch.items ?? [], raw)
    if (fromWords?.id != null) return fromWords.id
  }

  if (normalized !== raw) {
    const altSearch = await catalog.searchAnimeCards({ query: normalized, limit: 50 })
    const fromAltSearch = findCardByRouteParam(altSearch.items ?? [], raw)
    if (fromAltSearch?.id != null) return fromAltSearch.id
  }

  throw new Error(`انیمه با اسلاگ «${raw}» پیدا نشد`)
}
