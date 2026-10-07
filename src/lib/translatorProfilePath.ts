import type { TranslatorItem } from '@/types/catalog'

/** Prefer social profile when rollout is on and the translator is linked to Telegram. */
export const translatorProfilePath = (
  translator: Pick<TranslatorItem, 'slug' | 'linked_telegram_user_id'>,
  socialProfileEnabled: boolean
): string => {
  const linked = translator.linked_telegram_user_id?.trim()
  if (socialProfileEnabled && linked) {
    return `/u/${encodeURIComponent(linked)}`
  }
  return `/translators/${encodeURIComponent(String(translator.slug))}`
}
