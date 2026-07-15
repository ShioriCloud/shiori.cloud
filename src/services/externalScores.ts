export type ExternalScoreIds = {
  anilist_id?: number | null
  mal_id?: number | null
}

export type ExternalScores = {
  /** امتیاز AniList به مقیاس ۰–۱۰۰ (درصد) */
  anilistScore: number | null
  malScore: number | null
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

  if (typeof media.averageScore === 'number' && media.averageScore > 0) {
    return media.averageScore
  }
  if (typeof media.meanScore === 'number' && media.meanScore > 0) {
    return media.meanScore
  }

  return null
}

const fetchMalScore = async (malId: number): Promise<number | null> => {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`)
  if (!res.ok) return null

  const json = (await res.json()) as { data?: { score?: number | null } }
  const score = json.data?.score
  return typeof score === 'number' && Number.isFinite(score) ? score : null
}

/** امتیاز زنده AniList / MAL */
export const fetchExternalScores = async (ids: ExternalScoreIds): Promise<ExternalScores> => {
  const anilistId = typeof ids.anilist_id === 'number' && ids.anilist_id > 0 ? ids.anilist_id : null
  const malId = typeof ids.mal_id === 'number' && ids.mal_id > 0 ? ids.mal_id : null

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

/** تبدیل average_score دیتابیس به درصد AniList (مثلاً 8.4 → 84٪ یا 84 → 84٪) */
export const formatAnilistPercent = (
  score: number,
  toPersianNumber: (n: number | string) => string
): string => {
  const percent = score <= 10 ? score * 10 : score
  return `${toPersianNumber(Math.round(percent))}٪`
}
