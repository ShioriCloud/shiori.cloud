/** تبدیل average_score دیتابیس به درصد AniList (مثلاً 8.4 → 84٪ یا 84 → 84٪) */
export const formatAnilistPercent = (
  score: number,
  toPersianNumber: (n: number | string) => string
): string => {
  const percent = score <= 10 ? score * 10 : score
  return `${toPersianNumber(Math.round(percent))}٪`
}
