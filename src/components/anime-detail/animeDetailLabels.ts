import type { GenreItem } from '../../types/catalog'

export const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

/** برچسب فصل از پنل ادمین (label_fa) — با اعداد فارسی */
export const formatSeriesMemberLabel = (member: {
  sort_order: number
  label_fa: string | null
}) => {
  const fromAdmin = String(member.label_fa ?? '').trim()
  if (fromAdmin) return toPersianNumber(fromAdmin)
  return `فصل ${toPersianNumber(member.sort_order)}`
}

export const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    RELEASING: 'در حال پخش',
    FINISHED: 'پایان یافته',
    NOT_YET_RELEASED: 'منتشر نشده',
    CANCELLED: 'لغو شده',
    HIATUS: 'متوقف شده',
  }
  return statusMap[status] || status
}

export const translateSeason = (season: string) => {
  const seasonMap: Record<string, string> = {
    WINTER: 'زمستان',
    SPRING: 'بهار',
    SUMMER: 'تابستان',
    FALL: 'پاییز',
  }
  return seasonMap[String(season || '').toUpperCase()] || season
}

export const translateFormat = (format?: string) => {
  const key = String(format ?? '')
    .trim()
    .toUpperCase()
  const map: Record<string, string> = {
    TV: 'سریالی',
    MOVIE: 'سینمایی',
    SPECIAL: 'قسمت ویژه',
    ONA: 'ONA',
    'ONA (CHINESE)': 'دونگهوا',
  }
  return map[key] || (format ?? '—')
}

export const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

export const toJalaliDate = (value?: string) => {
  if (!value) return 'نامشخص'

  const raw = String(value).trim()
  const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (!match) return toPersianNumber(raw)

  const gy = Number(match[1])
  const gm = Number(match[2])
  const gd = Number(match[3])
  if (!Number.isFinite(gy) || !Number.isFinite(gm) || !Number.isFinite(gd))
    return toPersianNumber(raw)

  if (gy < 1700) {
    const pad2 = (n: number) => String(n).padStart(2, '0')
    return toPersianNumber(`${gy}/${pad2(gm)}/${pad2(gd)}`)
  }

  const g2j = (y: number, m: number, d: number) => {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    let jy = y <= 1600 ? 0 : 979
    y -= y <= 1600 ? 621 : 1600
    const gy2 = m > 2 ? y + 1 : y
    let days =
      365 * y +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      d +
      g_d_m[m - 1]
    jy += 33 * Math.floor(days / 12053)
    days %= 12053
    jy += 4 * Math.floor(days / 1461)
    days %= 1461
    if (days > 365) {
      jy += Math.floor((days - 1) / 365)
      days = (days - 1) % 365
    }
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
    return { jy, jm, jd }
  }

  const { jy, jm, jd } = g2j(gy, gm, gd)
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return toPersianNumber(`${jy}/${pad2(jm)}/${pad2(jd)}`)
}
