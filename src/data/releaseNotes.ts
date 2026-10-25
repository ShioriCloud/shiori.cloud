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
   */
  showDialog?: boolean
}

/**
 * Newest first. Only versions ≤ current package.json version are considered.
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '0.2.100',
    items: [
      'باتم‌شیت نشان‌ها دیگر اسکلتون پروفایل نشان نمی‌دهد',
      'زیرنویس ترجمه‌ها مستقیم زیر عنوان قرار گرفت',
    ],
  },
  {
    version: '0.2.99',
    items: [
      'پروفایل مترجم: حذف کارت‌های تکراری پایین صفحه',
      'ترجمه‌ها و علاقه‌مندی‌ها: لینک «همه» یکدست در عنوان سکشن',
      'بارگذاری: اسکلتون پروفایل فقط روی صفحه اصلی پروفایل',
    ],
  },
  {
    version: '0.2.98',
    items: [
      'فید و پروفایل: ورود وب، پیام‌های خالی واضح‌تر، تب پروفایل روی زیرصفحه‌ها فعال می‌ماند',
      'پروفایل دیگران: متن‌ها و برگشت از فعالیت/لیست‌ها درست‌تر شد',
    ],
  },
  {
    version: '0.2.97',
    items: ['پروفایل: نشان‌ها بالای تب‌ها؛ آمار تماشا داخل تب آمار'],
  },
  {
    version: '0.2.96',
    items: ['ثبت پیشرفت تماشا کمی جمع‌وجورتر شد'],
  },
  {
    version: '0.2.95',
    items: [
      'ثبت پیشرفت تماشا: ظاهر جدید، وضعیت‌های واضح‌تر و امتیاز با نیم‌پله',
    ],
  },
  {
    version: '0.2.94',
    items: ['قلب علاقه‌مندی و لیست پروفایل سریع‌تر با هم هماهنگ می‌شوند'],
  },
  {
    version: '0.2.93',
    items: ['حذف پیشرفت تماشا از صفحه انیمه دوباره درست کار می‌کند'],
  },
  {
    version: '0.2.92',
    items: [
      'ثبت پیشرفت و امتیاز دیگر انیمه را خودکار به علاقه‌مندی‌ها اضافه نمی‌کند',
      'قلب فقط برای لیست علاقه‌مندی‌هاست',
    ],
  },
  {
    version: '0.2.91',
    items: ['پروفایل دیگران: کارت‌های آخرین قسمت مربعی و جزئیات دنبال‌کردن خواناتر'],
  },
  {
    version: '0.2.90',
    items: [
      'پروفایل اجتماعی: علاقه‌مندی‌ها و آخرین قسمت‌های دیده‌شده روی صفحه پروفایل',
      'دنبال متقابل با متن واضح‌تر؛ تب شخصی فقط برای خودت',
    ],
  },
  {
    version: '0.2.89',
    items: [
      'می‌توانی اعلان «نظر دنبال‌شده» را خاموش کنی',
      'در پاسخ‌ها می‌توانی مستقیم به یک نفر اشاره کنی',
    ],
  },
  {
    version: '0.2.88',
    items: [
      'زیر پاسخ‌های نظر، نام و خلاصهٔ نظر اصلی دیده می‌شود',
      'صفحهٔ اعلان‌ها با ظاهر یکدست‌تر',
    ],
  },
  {
    version: '0.2.87',
    items: ['چیدمان نظرات انیمه برای فارسی درست شد و پاسخ‌ها راحت‌تر دیده می‌شوند'],
  },
  {
    version: '0.2.86',
    items: [
      'اعلان اولین پسند روی نظر با سوئیچ جدا در تنظیمات',
      'پاسخ نظر و دنبال‌کننده می‌توانند در تلگرام هم بیایند (اگر پیام Telegram روشن باشد)',
    ],
  },
  {
    version: '0.2.85',
    items: ['می‌توانی اعلان «پاسخ به نظر» را از تنظیمات خاموش کنی'],
  },
  {
    version: '0.2.84',
    items: [
      'تب شخصی و نظرات انیمه ظاهر یکدست‌تری با فید پروفایل دارند',
      'لیست فعالیت نظرات خواناتر و شبیه کارت‌های سوشال شد',
    ],
  },
  {
    version: '0.2.83',
    items: [
      'فید پروفایل شلوغ‌تر شد: نظر، لیست عمومی و دنبال‌کردن دوستان',
      'لیست دنبال‌شده‌ها و فید ظاهر یکدست‌تری دارند',
    ],
  },
  {
    version: '0.2.82',
    items: ['می‌توانی اعلان «دنبال‌کننده جدید» را از تنظیمات خاموش کنی'],
  },
  {
    version: '0.2.81',
    items: ['آمار پروفایل دوباره با لیست تماشای تو هماهنگ می‌ماند'],
  },
  {
    version: '0.2.80',
    items: ['پیشنهاد کاربران برای دنبال کردن در تب فید پروفایل'],
  },
  {
    version: '0.2.79',
    items: ['مسدود و بی‌صدا کردن کاربران از پروفایل و تنظیمات'],
  },
  {
    version: '0.2.78',
    items: ['نشان‌های پروفایل بر اساس تماشا، نظر و شبکه اجتماعی باز می‌شوند'],
  },
  {
    version: '0.2.77',
    items: ['پلی‌لیست‌های عمومی روی پروفایل و از ویرایش لیست فعال می‌شوند'],
  },
  {
    version: '0.2.76',
    items: [
      'فید و لیست دنبال‌شده‌ها با «نمایش بیشتر» ادامه پیدا می‌کنند',
      'از لیست دنبال‌شده‌ها می‌توانی دنبال کردن را لغو کنی',
    ],
  },
  {
    version: '0.2.75',
    items: ['در پروفایل دیگران نظرات و تاریخ عضویت دیده می‌شود'],
  },
  {
    version: '0.2.74',
    items: ['نام نمایشی پروفایل را خودت انتخاب کن'],
  },
  {
    version: '0.2.73',
    items: ['نظر انیمه، پسند و صفحهٔ فعالیت نظرات'],
  },
  {
    version: '0.2.72',
    items: ['آیدی تلگرام دیگر روی پروفایل دیده نمی‌شود'],
  },
  {
    version: '0.2.71',
    items: ['بیوی مترجم مثل دیالوگ انیمه خوانده می‌شود'],
  },
  {
    version: '0.2.70',
    items: [
      'اعلان دنبال‌کننده جدید و جست‌وجوی کاربران',
      'فید غنی‌تر و حریم خصوصی فعالیت تماشا',
    ],
    showDialog: true,
  },
  {
    version: '0.2.69',
    items: ['باکس ترجمه‌ها جذاب‌تر شد؛ نقش شیوری و مشاهدهٔ همه واضح‌تر'],
  },
  {
    version: '0.2.68',
    items: [
      'جای دکمهٔ تنظیمات مثل جزئیات انیمه کنار آواتار',
      'باکس ترجمه‌ها با نقش‌ها، تعداد اثر و مشاهدهٔ همه',
    ],
  },
  {
    version: '0.2.67',
    items: [
      'پروفایل مترجم بدون صفحهٔ خالی وسط راه باز می‌شود',
      'دکمهٔ تنظیمات هم‌سبک با جزئیات انیمه',
    ],
  },
  {
    version: '0.2.66',
    items: [
      'دنبال کردن واقعی کاربران و لیست دنبال‌کننده‌ها',
      'فید تماشای افرادی که دنبال می‌کنی',
      'از صفحه انیمه مستقیم به پروفایل مترجم',
    ],
  },
  {
    version: '0.2.65',
    items: [
      'صفحه مترجم به پروفایل اجتماعی وصل می‌شود',
      'نشان‌های تماشا روی پروفایل و لینک اشتراک user_…',
    ],
  },
  {
    version: '0.2.64',
    items: [
      'پروفایل عمومی کاربران با آمار و دنبال‌کردن',
      'ریل ترجمه‌ها برای مترجم‌ها و صفحهٔ «مشاهده همه»',
    ],
  },
  {
    version: '0.2.63',
    items: ['بج و فعالیت ترجمه روی پروفایل برای مترجم‌های متصل'],
  },
  {
    version: '0.2.62',
    items: ['دنبال کردن در پروفایل، تب‌های یکدست، و مخفی‌کردن آیدی تلگرام'],
  },
  {
    version: '0.2.61',
    items: ['نمودار ساعت تماشا به‌صورت پیشرفت تک‌رنگ و کارت‌های واضح‌تر'],
  },
  {
    version: '0.2.60',
    items: ['خلاصه آمار تماشا با ظاهر تازه و محاسبه دقیق‌تر زمان'],
  },
  {
    version: '0.2.59',
    items: ['خلاصه آمار با نمودار ساعت تماشا و صفحه آمار کامل'],
  },
  {
    version: '0.2.58',
    items: ['پروفایل با آمار خلاصه، در حال تماشا و تب‌های آمار و شخصی'],
  },
  {
    version: '0.2.57',
    items: ['پروفایل تماشا با آمار و لیست دیده‌شده‌ها (آزمایشی)'],
  },
  {
    version: '0.2.56',
    items: ['فصل جاری از ابتدای مهر به‌عنوان پاییز شناخته می‌شود'],
  },
  {
    version: '0.2.55',
    items: ['لینک مستقیم به برنامه پخش و اشتراک از پست‌های کانال'],
  },
  {
    version: '0.2.54',
    items: ['باز شدن مینی‌اپ از مرورگر سریع‌تر به پیام تلگرام می‌رسد'],
  },
  {
    version: '0.2.53',
    items: [
      'کلیک روی بنرهای صفحه اصلی روان‌تر شد',
      'دسترسی مینی‌اپ فقط از تلگرام',
    ],
  },
  {
    version: '0.2.52',
    items: ['فصل جاری بر اساس محبوبیت مرتب می‌شود'],
  },
  {
    version: '0.2.51',
    items: ['نسبت بنرهای صفحه اصلی با طراحی جدید هماهنگ شد'],
  },
  {
    version: '0.2.50',
    items: ['اندازه نشان قسمت روی کارت‌ها تنظیم شد'],
  },
  {
    version: '0.2.49',
    items: ['خوانایی نشان قسمت روی کارت‌ها بهتر شد'],
  },
  {
    version: '0.2.48',
    items: ['نشان قسمت‌های تازه جمع‌وجورتر شد'],
  },
  {
    version: '0.2.47',
    items: ['نشان شماره قسمت در «قسمت‌های تازه» واضح‌تر شد'],
  },
  {
    version: '0.2.46',
    items: ['بخش «قسمت‌های تازه» در خانه اضافه شد'],
  },
  {
    version: '0.2.45',
    items: [
      'موجودی توکن در پروفایل',
      'شارژ توکن با انتخاب بسته و راهنمای پرداخت',
    ],
  },
  {
    version: '0.2.44',
    items: ['دانلود با توکن و امکان شارژ از دارمت اضافه شد'],
  },
  {
    version: '0.2.43',
    items: ['باز شدن مینی‌اپ روی آیفون و با پروکسی پایدارتر شد'],
  },
  {
    version: '0.2.42',
    items: ['باز شدن مینی‌اپ با پروکسی داخلی تلگرام پایدارتر شد'],
  },
  {
    version: '0.2.41',
    items: [
      'از «مشاهده همه» فصل جاری دیگر انیمه تکراری دیده نمی‌شود',
      'باز شدن مینی‌اپ با پروکسی داخلی تلگرام پایدارتر شد',
    ],
  },
  {
    version: '0.2.40',
    items: ['پوستر کارت‌های صفحهٔ اصلی با عنوان انیمه هم‌خوان می‌ماند'],
  },
  {
    version: '0.2.39',
    items: ['لیست «مشاهده همه» فصل جاری دیگر انیمه تکراری نشان نمی‌دهد'],
  },
  {
    version: '0.2.38',
    items: ['دیالوگ صفحهٔ شروع بدون افتادن یک کلمهٔ تکی پایین شد'],
  },
  {
    version: '0.2.37',
    items: ['دیالوگ صفحهٔ شروع خواناتر شد'],
  },
  {
    version: '0.2.36',
    items: ['پس‌زمینهٔ صفحهٔ شروع دوباره روشن و سینمایی شد'],
  },
  {
    version: '0.2.35',
    items: ['صفحهٔ شروع خلوت‌تر و خواناتر شد'],
  },
  {
    version: '0.2.34',
    items: ['صفحهٔ شروع با لود واقعی کتابخانه هماهنگ شد'],
  },
  {
    version: '0.2.33',
    items: ['صفحهٔ شروع سینمایی‌تر شد'],
  },
  {
    version: '0.2.32',
    items: ['صفحهٔ شروع با کادر دیالوگ انیمه‌ای تازه شد'],
  },
  {
    version: '0.2.31',
    items: ['اسکرول پیشنهاد ویژه روان‌تر شد'],
  },
  {
    version: '0.2.30',
    items: ['کشیدن سریع پیشنهاد ویژه دیگر چند اسلاید یک‌جا رد نمی‌کند'],
  },
  {
    version: '0.2.29',
    items: ['اسلاید پیشنهاد ویژه هم بعد از برگشت همان‌جا می‌ماند'],
  },
  {
    version: '0.2.28',
    items: ['جای اسکرول افقی اسلایدرهای صفحه اصلی هم حفظ می‌شود'],
  },
  {
    version: '0.2.27',
    items: ['جای اسکرول صفحه اصلی بعد از برگشت درست حفظ می‌شود'],
  },
  {
    version: '0.2.26',
    items: ['با برگشت به صفحه اصلی، جای اسکرولت حفظ می‌شود'],
  },
  {
    version: '0.2.25',
    items: ['ترتیب لیست‌های صفحه اصلی از پنل قابل تنظیم شد'],
  },
  {
    version: '0.2.24',
    items: ['انیمه‌های فصل جاری با قسمت تازه، اول لیست می‌آیند'],
  },
  {
    version: '0.2.23',
    items: ['لوگوی تکراری از کارت‌های برنامه پخش برداشته شد'],
  },
  {
    version: '0.2.22',
    title: 'لیست‌های شخصی',
    showDialog: true,
    items: [
      'لیست‌های شخصی با حساب تلگرام همگام می‌شوند',
      'لیست‌هایی که روی این دستگاه ساختی به حسابت منتقل می‌شوند',
    ],
  },
  {
    version: '0.2.21',
    title: 'زمان پخش',
    items: ['شمارش معکوس قسمت بعد فقط از تقویم شیوری می‌آید'],
  },
  {
    version: '0.2.20',
    title: 'اعلان‌ها',
    items: ['اگر اعلان‌ها بارگذاری نشد، می‌توانید دوباره تلاش کنید'],
  },
  {
    version: '0.2.19',
    title: 'پایداری',
    items: [
      'اگر برنامه گیر کرد، می‌توانید دوباره تلاش کنید',
      'پیام خطاها کوتاه و قابل‌فهم شد',
    ],
  },
  {
    version: '0.2.18',
    title: 'لیست‌های من',
    items: [
      'لیست‌های شخصی فقط روی همین دستگاه می‌مانند',
      'لیست تماشا مثل قبل بین دستگاه‌ها همگام است',
    ],
  },
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
 * Prefer {@link getDialogReleaseNote} for the popup.
 * Profile archive UI is temporarily removed pending a redesign.
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
