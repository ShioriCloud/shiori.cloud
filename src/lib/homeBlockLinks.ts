/** Normalize admin-entered internal paths for React Router. */
export const normalizeHomeBlockHref = (href: string): string => {
  const trimmed = href.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w+]+:/.test(trimmed)) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

export const isExternalHref = (href: string): boolean =>
  /^https?:\/\//i.test(href) || /^[\w+]+:/.test(href)

export const hasUsableHref = (href: string | null | undefined): href is string =>
  Boolean(href?.trim())
