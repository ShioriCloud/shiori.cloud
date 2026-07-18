export type HardsubLanguage = 'fa' | 'en'
export type VideoFileType = 'softsub' | 'hardsub'
export type VideoResolution = '480p' | '720p' | '1080p'
export type VideoEncode = 'x264' | 'x265' | 'x265_10bit' | 'bluray'

type SubtitleSource = {
  subtitle_link?: string | null
}

export function normalizeVideoFileType(value: unknown): VideoFileType {
  return String(value ?? '').trim().toLowerCase() === 'hardsub' ? 'hardsub' : 'softsub'
}

export function normalizeVideoResolution(value: unknown): VideoResolution {
  const v = String(value ?? '').trim().toLowerCase()
  if (v === '480p' || v === '720p' || v === '1080p') return v
  return '1080p'
}

export function normalizeVideoEncode(value: unknown): VideoEncode {
  const v = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
  if (v === 'x264' || v === 'x265' || v === 'bluray') return v
  if (v === 'x265_10bit' || v === 'x26510bit') return 'x265_10bit'
  return 'x265_10bit'
}

export function videoEncodeLabel(encode: VideoEncode): string {
  if (encode === 'x265_10bit') return 'x265 10bit'
  if (encode === 'bluray') return 'Bluray'
  if (encode === 'x264') return 'x264'
  return 'x265'
}

export function videoQualityButtonLabel(
  resolution: VideoResolution,
  encode: VideoEncode
): string {
  return `${resolution} ${videoEncodeLabel(encode)}`
}

/**
 * Prefer the anime-level admin setting. Fall back to soft-sub presence for older rows.
 */
export function resolveHardsubLanguage(input: {
  hardsub_language?: HardsubLanguage | string | null
  episodes?: SubtitleSource[]
  subtitle_packs?: SubtitleSource[]
  subtitles?: SubtitleSource[]
}): HardsubLanguage {
  const configured = String(input.hardsub_language ?? '')
    .trim()
    .toLowerCase()
  if (configured === 'fa' || configured === 'en') return configured

  const hasLink = (rows: SubtitleSource[] | undefined) =>
    (rows ?? []).some((row) => String(row.subtitle_link ?? '').trim())

  return hasLink(input.subtitle_packs) ||
    hasLink(input.episodes) ||
    hasLink(input.subtitles)
    ? 'fa'
    : 'en'
}

export function hardsubLanguageLabel(language: HardsubLanguage): string {
  return language === 'fa' ? 'زیرنویس چسبیده فارسی' : 'زیرنویس چسبیده انگلیسی'
}

export function mediaSpecTagLabel(input: {
  video_file_type?: VideoFileType | string | null
  hardsub_language?: HardsubLanguage | string | null
}): string {
  if (normalizeVideoFileType(input.video_file_type) === 'softsub') {
    return 'سافت‌ساب'
  }
  const language =
    String(input.hardsub_language ?? '').trim().toLowerCase() === 'en' ? 'en' : 'fa'
  return hardsubLanguageLabel(language)
}
