# اسپلش مینی‌اپ تلگرام (BotFather)

اسپلش **نیتیو** تلگرام (قبل از لود HTML/JS) فقط از BotFather تنظیم می‌شود؛ در ریپو کنترل نمی‌شود.

## بات هدف

Main Mini App بات مینی‌اپ (مثلاً `ShioriMiniBot`).

## مراحل BotFather

1. `@BotFather` → `/mybots` → بات مینی‌اپ
2. **Bot Settings** → **Configure Mini App** → **Enable Mini App** (اگر هنوز فعال نیست)
3. تنظیمات **loading screen**:
   - **Icon (SVG):** فایل [`assets/telegram-loading-icon.svg`](./assets/telegram-loading-icon.svg) را آپلود کن  
     (مارک شیوری؛ فقط `M` / `C` / `Z`؛ path بسته — سازگار با اعتبارسنجی BotFather)
   - **Background / header colors** (نزدیک تم اپ):

| Theme | Background | Header (پیشنهادی) |
|-------|------------|-------------------|
| Dark  | `#E85D4C`  | `#E85D4C`         |
| Light | `#E85D4C`  | `#E85D4C`         |

`#E85D4C` همان پس‌زمینهٔ پنل دیالوگ اسپلش داخل اپ (`BrandBootScreen`) است تا پرش رنگی کمتر حس شود.

## محدودیت‌های SVG

- Path باید با `Z` بسته باشد
- دستورات ممنوع: `a`/`A`, `t`/`T`, `q`/`Q`
- فایل خیلی بزرگ یا پیچیده ممکن است رد شود

## بعد از ست کردن

کلاینت تلگرام اسپلش کاستوم را تا `Telegram.WebApp.ready()` نشان می‌دهد. در اپ، `ready()` زود صدا زده می‌شود و بین hide شدن اسپلش نیتیو و hydrate شدن React، همان پنل دیالوگ در `index.html` دیده می‌شود؛ بعد `BrandBootScreen`.

## مدیریت دیالوگ‌ها (داشبورد)

- داش: **مینی‌اپ → دیالوگ اسپلش** (`/admin/boot-quotes`)
- API ادمین: `/boot-quotes-admin`
- API عمومی مینی‌اپ: `GET /boot-quotes`
- جدول: `boot_quotes` — مایگریشن: `scripts/sql/boot_quotes.sql` (یا catchup کامل)

مینی‌اپ لیست فعال را کش می‌کند؛ اگر API خالی/قطع باشد از fallback داخل `src/data/bootQuotes.ts` استفاده می‌کند.
