/**
 * Release notes shown once per version after upgrade.
 * When bumping package.json `version`, add a matching entry here.
 *
 * Dialog rules:
 * - Keep `items` short and benefit-focused (max ~3), not engineering changelog.
 * - Set `showDialog: true` only for updates worth interrupting the user.
 * - Patch/day-to-day shipping: omit `showDialog` (silent).
 * - Set `VITE_SHOW_RELEASE_NOTES=false` to disable the popup entirely (e.g. heavy beta).
 */

export type ReleaseNote = {
  version: string
  /** Optional short headline */
  title?: string
  /** User-facing bullets (benefit language, not technical detail) */
  items: string[]
  /**
   * When true, eligible for the post-splash dialog.
   * Archive in Profile always lists every entry ≤ current version.
   */
  showDialog?: boolean
}

/**
 * Newest first. Only versions ≤ current package.json version are considered.
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '0.2.17',
    title: 'برنامه پخش',
    items: [
      'برنامه پخش فقط تقویم ترجمهٔ شیوری است',
      'روز خالی یعنی هنوز زمان پخش در کاتالوگ ثبت نشده',
    ],
  },
  {
    version: '0.2.16',
    title: 'برنامه پخش',
    items: ['برنامه پخش فقط عناوین در حال ترجمهٔ شیوری را نشان می‌دهد'],
  },
  {
    version: '0.2.15',
    title: 'برنامه پخش',
    items: ['برنامه پخش هفتگی دوباره انیمه‌های هر روز را نشان می‌دهد'],
  },
  {
    version: '0.2.14',
    title: 'برنامه پخش',
    items: ['قسمت‌های پخش‌شده دیگر به‌اشتباه به‌عنوان قسمت بعدی نشان داده نمی‌شوند'],
  },
  {
    version: '0.2.13',
    title: 'خانه',
    items: ['بج «ترجمه اختصاصی» روی کارت‌های پیشنهاد ویژه'],
  },
  {
    version: '0.2.12',
    title: 'برنامه پخش',
    items: [
      'برای عناوین خارج از ترجمهٔ شیوری فقط اطلاع ساده نشان داده می‌شود',
      'گزینهٔ درخواست ترجمه از تیکت پشتیبانی موقتاً برداشته شد',
    ],
  },
  {
    version: '0.2.11',
    title: 'جزئیات انیمه',
    items: ['عنوان کارت زیرنویس فارسی به «زیرنویس چسبیده فارسی» برگشت'],
  },
  {
    version: '0.2.10',
    title: 'جزئیات انیمه',
    items: ['در کارت مشخصات، فقط سافت‌ساب فارسی نمایش داده می‌شود'],
  },
  {
    version: '0.2.9',
    title: 'دانلود',
    items: ['روی تلگرام دسکتاپ، مینی‌اپ بعد از زدن دانلود دیگر بسته نمی‌شود'],
  },
  {
    version: '0.2.8',
    title: 'آپدیت‌ها',
    items: [
      'خلاصهٔ تغییرات ساده‌تر شد و فقط آپدیت‌های مهم به‌صورت پاپ‌آپ می‌آید',
      'تاریخچهٔ تغییرات را از پروفایل هم می‌توانید ببینید',
    ],
  },
  {
    version: '0.2.7',
    title: 'شروع اپ',
    items: ['صفحهٔ شروع ساده‌تر و تمیزتر شد'],
  },
  {
    version: '0.2.6',
    title: 'شروع اپ',
    items: ['ظاهر صفحهٔ شروع بهتر شد'],
  },
  {
    version: '0.2.5',
    title: 'خانه',
    items: ['همهٔ آیتم‌های ویژه در اسلایدر خانه دیده می‌شوند'],
  },
  {
    version: '0.2.4',
    title: 'دسترسی',
    items: ['راهنمای واضح‌تر برای باز کردن مینی‌اپ از تلگرام'],
  },
  {
    version: '0.2.3',
    title: 'تجربهٔ بهتر',
    items: [
      'برنامهٔ پخش روان‌تر شد',
      'می‌توانید درخواست ترجمه ثبت کنید',
      'جابه‌جایی بین بخش‌ها نرم‌تر شد',
    ],
  },
  {
    version: '0.2.2',
    title: 'اعلان‌ها',
    items: ['پوستر انیمه در کارت اعلان', 'اعداد اعلان‌ها به فارسی'],
  },
  {
    version: '0.2.1',
    title: 'تجربهٔ تازه',
    showDialog: true,
    items: [
      'طراحی بهتر کارت‌های ژانر در گشت‌وگذار',
      'اشتراک‌گذاری و پروفایل راحت‌تر با بات مینی‌اپ',
    ],
  },
  {
    version: '0.2.0',
    title: 'نسخه ۰٫۲',
    showDialog: true,
    items: ['اعلان‌ها و نشان خوانده‌نشده بهتر شد', 'نمایش نسخه در پروفایل'],
  },
]

const STORAGE_KEY = 'shiori_last_seen_app_version'

export const getAppVersion = (): string =>
  String(import.meta.env.VITE_APP_VERSION ?? '0.1.0').trim() || '0.1.0'

/** Master switch for the interruptive dialog (Profile archive stays available). */
export const isReleaseNotesDialogEnabled = (): boolean => {
  const raw = String(import.meta.env.VITE_SHOW_RELEASE_NOTES ?? 'true')
    .trim()
    .toLowerCase()
  return raw !== '0' && raw !== 'false' && raw !== 'off' && raw !== 'no'
}

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

const notesInRange = (
  currentVersion: string,
  lastSeen: string | null
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

/**
 * Releases the user has not acknowledged yet (all entries, for diagnostics).
 * Prefer {@link getDialogReleaseNote} for the popup and {@link getReleaseNotesArchive} for Profile.
 */
export const getUnseenReleaseNotes = (
  currentVersion = getAppVersion(),
  lastSeen = getLastSeenAppVersion()
): ReleaseNote[] => notesInRange(currentVersion, lastSeen)

/**
 * At most one note for the post-splash dialog: newest unseen entry with `showDialog`.
 * Returns null when dialogs are disabled via env, or nothing important is pending.
 */
export const getDialogReleaseNote = (
  currentVersion = getAppVersion(),
  lastSeen = getLastSeenAppVersion()
): ReleaseNote | null => {
  if (!isReleaseNotesDialogEnabled()) return null
  const unseen = notesInRange(currentVersion, lastSeen).filter((note) => note.showDialog)
  return unseen[0] ?? null
}

/** Full changelog for Profile (newest first, up to current app version). */
export const getReleaseNotesArchive = (
  currentVersion = getAppVersion()
): ReleaseNote[] =>
  RELEASE_NOTES.filter((note) => compareSemver(note.version, currentVersion) <= 0).sort(
    (a, b) => compareSemver(b.version, a.version)
  )
