export const formatUserListSaveError = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error)

  if (msg.includes('invalid_session')) {
    return 'نشست شما منقضی شده — مینی‌اپ را ببندید و دوباره باز کنید.'
  }

  if (msg.includes('auth_date_expired')) {
    return 'نشست Telegram منقضی شده — مینی‌اپ را ببندید و دوباره باز کنید.'
  }

  if (msg.includes('hash_mismatch')) {
    return 'خطا در تأیید Telegram — توکن بات API باید همان باتی باشد که مینی‌اپ به آن وصل است (BotFather → Mini Apps).'
  }

  if (msg.includes('invalid telegram init data')) {
    return msg.includes('(')
      ? msg
      : 'خطا در تأیید Telegram — توکن Vault باید همان bot مینی‌اپ باشد (BotFather → Mini Apps).'
  }

  if (msg.includes('API 401') || msg.includes('authentication required')) {
    if (msg.includes('Telegram initData یافت نشد')) return msg
    if (msg.includes('وارد حساب')) return msg
    return 'احراز هویت ناموفق — اگر از Telegram استفاده می‌کنید مینی‌اپ را ببندید و دوباره باز کنید؛ در وب باید وارد حساب شوید.'
  }

  if (msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'دسترسی رد شد — معمولاً یعنی initData تأیید نشده. مینی‌اپ را از Telegram ببندید و دوباره باز کنید.'
  }

  if (msg.includes('Telegram initData یافت نشد')) {
    return msg
  }

  if (msg.includes('وارد حساب کاربری')) {
    return msg
  }

  return msg.length > 200 ? `${msg.slice(0, 200)}…` : msg
}
