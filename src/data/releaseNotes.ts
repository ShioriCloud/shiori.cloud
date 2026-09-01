/**
 * Release notes shown once per version after upgrade.
 * When bumping package.json `version`, add a matching entry here.
 */

export type ReleaseNote = {
  version: string
  /** Optional short headline under “چی جدید شده؟” */
  title?: string
  items: string[]
}

/**
 * Newest first. Only versions ≤ current package.json version are considered.
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '0.2.7',
    title: 'اسپلش',
    items: [
      'بازگشت اسپلش به گرادیان بنفش شیوری بدون تصویر پس‌زمینه',
      'دیالوگ دوباره وسط صفحه نمایش داده می‌شود',
    ],
  },
  {
    version: '0.2.6',
    title: 'اسپلش',
    items: [
      'رفع لود نشدن بعضی پس‌زمینه‌های دیالوگ',
      'روشن‌تر شدن تصویر و جابه‌جایی دیالوگ به بالای صفحه',
    ],
  },
  {
    version: '0.2.5',
    title: 'صفحه اصلی',
    items: ['نمایش همهٔ آیتم‌های ویژه در اسلایدر بالای خانه'],
  },
  {
    version: '0.2.4',
    title: 'پیام دسترسی',
    items: ['راهنمای واضح‌تر برای باز کردن مینی‌اپ از تلگرام رسمی'],
  },
  {
    version: '0.2.3',
    title: 'بهبود تجربه',
    items: [
      'رفع فلیکر پوسترها در برنامه پخش هنگام جابه‌جایی روزها',
      'دسته‌بندی «درخواست ترجمه» در تیکت پشتیبانی',
      'انیمیشن نرم‌تر بین تب‌ها (در مرورگرهای پشتیبانی‌کننده)',
    ],
  },
  {
    version: '0.2.2',
    title: 'اعلان‌ها',
    items: [
      'نمایش پوستر انیمه در کارت اعلان',
      'اعداد اعلان‌ها به فارسی',
    ],
  },
  {
    version: '0.2.1',
    title: 'آپدیت مینی‌شیوری',
    items: [
      'دیالوگ تغییرات نسخه بعد از آپدیت',
      'طراحی جدید کارت‌های ژانر در گشت‌وگذار',
      'لینک اشتراک‌گذاری و پروفایل با بات مینی‌اپ',
    ],
  },
  {
    version: '0.2.0',
    title: 'نسخه ۰٫۲',
    items: [
      'نمایش نسخه و شناسهٔ بیلد در پروفایل',
      'بهبود اعلان‌ها و badge خوانده‌نشده',
    ],
  },
]

const STORAGE_KEY = 'shiori_last_seen_app_version'

export const getAppVersion = (): string =>
  String(import.meta.env.VITE_APP_VERSION ?? '0.1.0').trim() || '0.1.0'

export const getLastSeenAppVersion = (): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)?.trim()
    return raw || null
  } catch {
    return null
  }
}

export const setLastSeenAppVersion = (version: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, version)
  } catch {
    /* ignore quota / private mode */
  }
}

/** Compare semver-ish strings (a.b.c). Returns negative if a < b. */
export const compareSemver = (a: string, b: string): number => {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

/**
 * Releases the user has not acknowledged yet.
 * - No lastSeen yet: show only the current version entry (first open of this feature / fresh install).
 * - After upgrade: show every entry between lastSeen and current (newest first).
 */
export const getUnseenReleaseNotes = (
  currentVersion = getAppVersion(),
  lastSeen = getLastSeenAppVersion()
): ReleaseNote[] => {
  if (!lastSeen) {
    const current = RELEASE_NOTES.find((note) => note.version === currentVersion)
    return current ? [current] : []
  }
  if (compareSemver(lastSeen, currentVersion) >= 0) return []

  return RELEASE_NOTES.filter(
    (note) =>
      compareSemver(note.version, lastSeen) > 0 &&
      compareSemver(note.version, currentVersion) <= 0
  ).sort((a, b) => compareSemver(b.version, a.version))
}
