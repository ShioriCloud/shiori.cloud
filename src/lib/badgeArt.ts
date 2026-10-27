/** Pick compact art for small UI; full 512 for detail modal. */
export const badgeImageSrc = (
  imageUrl: string | null | undefined,
  size: 'sm' | 'md' | 'lg'
): string | null => {
  const url = imageUrl?.trim()
  if (!url) return null
  if (size === 'lg') return url
  // sm, md, profile, showcase → compact asset
  if (url.endsWith('.webp')) {
    return url.replace(/\.webp$/i, '-md.webp')
  }
  return url
}

export const BADGE_ART_DROP_SHADOW: Record<string, string> = {
  common:
    'drop-shadow-[0_2px_10px_rgba(148,163,184,0.45)] drop-shadow-[0_0_18px_rgba(148,163,184,0.15)]',
  rare:
    'drop-shadow-[0_2px_12px_rgba(56,189,248,0.5)] drop-shadow-[0_0_22px_rgba(56,189,248,0.22)]',
  epic:
    'drop-shadow-[0_2px_14px_rgba(167,139,250,0.55)] drop-shadow-[0_0_26px_rgba(139,92,246,0.28)]',
  legendary:
    'drop-shadow-[0_2px_16px_rgba(251,191,36,0.55)] drop-shadow-[0_0_28px_rgba(245,158,11,0.3)]',
}

/** Stronger halo for profile header strip (cutout only, no frame). */
export const BADGE_PROFILE_HEADER_GLOW: Record<string, string> = {
  common:
    'drop-shadow-[0_0_16px_rgba(148,163,184,0.75)] drop-shadow-[0_0_32px_rgba(148,163,184,0.35)]',
  rare:
    'drop-shadow-[0_0_18px_rgba(56,189,248,0.8)] drop-shadow-[0_0_36px_rgba(56,189,248,0.4)]',
  epic:
    'drop-shadow-[0_0_20px_rgba(167,139,250,0.85)] drop-shadow-[0_0_40px_rgba(139,92,246,0.45)]',
  legendary:
    'drop-shadow-[0_0_22px_rgba(251,191,36,0.9)] drop-shadow-[0_0_44px_rgba(245,158,11,0.5)]',
}
