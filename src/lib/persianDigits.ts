const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const

export const toPersianDigits = (value: number | string): string =>
  String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]!)
