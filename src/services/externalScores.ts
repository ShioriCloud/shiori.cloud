export type ExternalScoreIds = {
  anilist_id?: number | null
  mal_id?: number | null
}

export type ExternalScores = {
  /** امتیاز AniList به مقیاس ۰–۱۰۰ (درصد) */
  anilistScore: number | null
  malScore: number | null
}

const normalizeExternalId = (value: unknown): number | null => {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.floor(n)
}

const parseExternalScore = (value: unknown): number | null => {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isFinite(n) && n > 0 ? n : null
}

const fetchAnilistScorePercent = async (anilistId: number): Promise<number | null> => {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            meanScore
            averageScore
          }
        }
      `,
      variables: { id: anilistId },
    }),
  })

  if (!res.ok) return null

  const json = (await res.json()) as {
    data?: { Media?: { meanScore?: number | null; averageScore?: number | null } }
  }

  const media = json.data?.Media
  if (!media) return null

  return parseExternalScore(media.averageScore) ?? parseExternalScore(media.meanScore)
}

const fetchMalScore = async (malId: number): Promise<number | null> => {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null

  const json = (await res.json()) as { data?: { score?: unknown } }
  return parseExternalScore(json.data?.score)
}

/** امتیاز زنده AniList / MAL */
export const fetchExternalScores = async (ids: ExternalScoreIds): Promise<ExternalScores> => {
  const anilistId = normalizeExternalId(ids.anilist_id)
  const malId = normalizeExternalId(ids.mal_id)

  const [anilistResult, malResult] = await Promise.allSettled([
    anilistId ? fetchAnilistScorePercent(anilistId) : Promise.resolve(null),
    malId ? fetchMalScore(malId) : Promise.resolve(null),
  ])

  const unwrap = (r: PromiseSettledResult<number | null>): number | null =>
    r.status === 'fulfilled' ? r.value : null

  return {
    anilistScore: unwrap(anilistResult),
    malScore: unwrap(malResult),
  }
}

export type AnilistNextAiring = {
  episode: number
  airing_at: number
}

/**
 * Client-side AniList next episode (when API cannot reach graphql.anilist.co).
 * Returns null if finished / no schedule / network error.
 */
export const fetchAnilistNextAiring = async (
  anilistId: number
): Promise<AnilistNextAiring | null> => {
  const id = normalizeExternalId(anilistId)
  if (!id) return null

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              nextAiringEpisode { airingAt episode }
            }
          }
        `,
        variables: { id },
      }),
      signal: controller.signal,
    })

    if (!res.ok) return null

    const json = (await res.json()) as {
      errors?: Array<{ message?: string }>
      data?: {
        Media?: {
          nextAiringEpisode?: { airingAt?: number; episode?: number } | null
        } | null
      }
    }
    if (json?.errors?.length) return null

    const ep = json?.data?.Media?.nextAiringEpisode
    if (!ep) return null

    const airingAt = Number(ep.airingAt)
    const episode = Number(ep.episode)
    if (!Number.isFinite(airingAt) || airingAt <= 0) return null
    if (!Number.isFinite(episode)) return null

    return { episode, airing_at: airingAt }
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}

/** تبدیل average_score دیتابیس به درصد AniList (مثلاً 8.4 → 84٪ یا 84 → 84٪) */
export const formatAnilistPercent = (
  score: number,
  toPersianNumber: (n: number | string) => string
): string => {
  const percent = score <= 10 ? score * 10 : score
  return `${toPersianNumber(Math.round(percent))}٪`
}
