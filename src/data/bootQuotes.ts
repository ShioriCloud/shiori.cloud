/** Anime / manga lines shown on the branded boot splash (IGN-style quote panel). */
export type BootQuote = {
  text: string
  /** Character or source, shown after an em dash */
  attribution: string
}

/** Built-in fallback when API/cache has no active quotes. */
export const BOOT_QUOTES: readonly BootQuote[] = [
  {
    text: 'من نمی‌تونم شنا کنم، ولی شنا می‌کنم!',
    attribution: 'سورو · وان پیس',
  },
  {
    text: 'وقتی تسلیم شی، همون‌جاست که داستان تموم می‌شه.',
    attribution: 'ناروتو اوزوماکی · ناروتو',
  },
  {
    text: 'قدرتِ واقعی یعنی محافظت از چیزی که برات مهمه.',
    attribution: 'هیشوکا · هانتر × هانتر',
  },
  {
    text: 'دنیای بیرون ممکنه بی‌رحم باشه، ولی تو تنها نیستی.',
    attribution: 'ادوارد الریک · فول‌متال آلکیمیست',
  },
  {
    text: 'اسمت رو می‌نویسم… و تموم.',
    attribution: 'لایت یاگامی · دث‌نوت',
  },
  {
    text: 'ترسیدن اشکالی نداره؛ جا زدن اشکال داره.',
    attribution: 'ارن یگر · اتک آن تایتان',
  },
  {
    text: 'من هنوز زنده‌ام، پس هنوز شانس دارم.',
    attribution: 'گوتس · برزرک',
  },
  {
    text: 'عشق یعنی وقتی برای یکی دیگه، خودت رو فراموش می‌کنی.',
    attribution: 'ویولت · ویولت اورگاردن',
  },
  {
    text: 'هیچ‌کس قهرمان به دنیا نمیاد؛ قهرمان ساخته می‌شه.',
    attribution: 'آل‌مایت · مای هیرو آکادمیا',
  },
  {
    text: 'حتی اگه دنیا تموم بشه، من دست از تلاش برنمی‌دارم.',
    attribution: 'گکو مورا · وان پانچ من',
  },
  {
    text: 'تو همون کسی هستی که تصمیم می‌گیری چی باشی.',
    attribution: 'لوفی · وان پیس',
  },
  {
    text: 'اشک‌ها نشونه‌ی ضعفن نیستن؛ نشونه‌ی اینن که هنوز قلب داری.',
    attribution: 'هیناتا · ناروتو',
  },
  {
    text: 'منتظر معجزه نباش؛ خودت معجزه شو.',
    attribution: 'کی‌یومارو · بلیچ',
  },
  {
    text: 'گاهی سخت‌ترین مبارزه‌ها، با خودته.',
    attribution: 'تانجیرو · شیطان‌کش',
  },
  {
    text: 'اگر جلو نری، همون‌جایی که هستی می‌مونی.',
    attribution: 'آسونا · سورد آرت آنلاین',
  },
  {
    text: 'دنیا جای بی‌رحمیه، ولی هنوز زیبایی توش هست.',
    attribution: 'ماکیما · چینسامن',
  },
  {
    text: 'من نمی‌خوام قوی‌ترین باشم؛ می‌خوام کسی باشم که بتونه نجات بده.',
    attribution: 'ایزکو میدورییا · مای هیرو آکادمیا',
  },
  {
    text: 'هر پایان، یه شروع جدیده.',
    attribution: 'سنکوکو · وان پیس',
  },
  {
    text: 'باشه که مسیر تاریک باشه؛ من چراغ خودمم.',
    attribution: 'یوجی ایتادوری · جوجوتسو کایسن',
  },
  {
    text: 'آرزو داشتن کافی نیست؛ باید براش بجنگی.',
    attribution: 'گون فریکس · هانتر × هانتر',
  },
  {
    text: 'من از مرگ نمی‌ترسم؛ از یه زندگی بی‌معنی می‌ترسم.',
    attribution: 'لایت یاگامی · دث‌نوت',
  },
  {
    text: 'گاهی سکوت، بلندترین فریاده.',
    attribution: 'لوی · اتک آن تایتان',
  },
  {
    text: 'اگر بتونی بخندی، هنوز نشکستی.',
    attribution: 'سایتاما · وان پانچ من',
  },
  {
    text: 'دوست یعنی کسی که تو تاریکی هم پیدات می‌کنه.',
    attribution: 'ساکورا · ناروتو',
  },
]

/** Solid splash field — IGN-like quote panel (not the app chrome theme). */
export const BOOT_SPLASH_BG = '#E85D4C'

const CACHE_KEY = 'shiori_boot_quotes_v1'

export function readCachedBootQuotes(): BootQuote[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const text = String((row as BootQuote).text ?? '').trim()
        const attribution = String((row as BootQuote).attribution ?? '').trim()
        if (!text || !attribution) return null
        return { text, attribution }
      })
      .filter((row): row is BootQuote => Boolean(row))
  } catch {
    return []
  }
}

export function writeCachedBootQuotes(quotes: BootQuote[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(quotes))
  } catch {
    // quota / private mode
  }
}

export function pickRandomBootQuote(
  pool: readonly BootQuote[] = BOOT_QUOTES,
  random = Math.random
): BootQuote {
  const list = pool.length > 0 ? pool : BOOT_QUOTES
  const i = Math.floor(random() * list.length) % list.length
  return list[i]!
}
