import type { TranslatorItem } from '@/types/catalog'

/**
 * One profile model for all users: when a translator is linked to Telegram,
 * go straight to `/u/:id`. Role badges / translator rails are decided there.
 */
export const translatorProfilePath = (
  translator: Pick<TranslatorItem, 'slug' | 'linked_telegram_user_id' | 'telegram_user_id'>
): string => {
  const linked =
    translator.linked_telegram_user_id?.trim() ||
    translator.telegram_user_id?.trim() ||
    null
  if (linked) {
    return `/u/${encodeURIComponent(linked)}`
  }
  return `/translators/${encodeURIComponent(String(translator.slug))}`
}
