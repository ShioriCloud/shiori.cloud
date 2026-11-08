/**
 * Inline gate script injected into index.html at build time (see vite.config.ts).
 * Keep logic in sync with webMiniappGate.ts.
 */
export const buildWebMiniappHtmlGateSnippet = (options: {
  allowlistCsv: string
  previewKey: string
}): string => {
  const allowlistJson = JSON.stringify(
    options.allowlistCsv
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Math.trunc(Number(s)))
      .filter((n) => Number.isFinite(n) && n !== 0),
  )
  const previewKeyJson = JSON.stringify(options.previewKey)

  return `
(function () {
  var BYPASS_KEY = 'shiori_web_miniapp_bypass'
  var SESSION_KEY = 'shiori_app_session'
  var PREVIEW_PARAM = 'web_preview'
  var ALLOWLIST = ${allowlistJson}
  var PREVIEW_KEY = ${previewKeyJson}

  function allowlistHas(id) {
    if (!ALLOWLIST.length) return false
    return ALLOWLIST.indexOf(Math.trunc(id)) >= 0
  }

  function readBypass() {
    try { return localStorage.getItem(BYPASS_KEY) === '1' } catch (e) { return false }
  }

  function sessionAllowed() {
    try {
      var raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return false
      var parsed = JSON.parse(raw)
      if (typeof parsed.userId !== 'number') return false
      var exp = Date.parse(String(parsed.expiresAt || ''))
      if (Number.isFinite(exp) && exp <= Date.now()) return false
      return allowlistHas(parsed.userId)
    } catch (e) { return false }
  }

  function applyPreviewUnlock() {
    if (!PREVIEW_KEY) return false
    try {
      var params = new URLSearchParams(String(location.search || ''))
      var key = String(params.get(PREVIEW_PARAM) || '').trim()
      if (!key || key !== PREVIEW_KEY) return false
      localStorage.setItem(BYPASS_KEY, '1')
      params.delete(PREVIEW_PARAM)
      var qs = params.toString()
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + (location.hash || ''))
      return true
    } catch (e) { return false }
  }

  window.__shioriWebMiniappAllowed = function () {
    if (!ALLOWLIST.length && !PREVIEW_KEY) return false
    applyPreviewUnlock()
    if (readBypass()) return true
    if (sessionAllowed()) {
      try { localStorage.setItem(BYPASS_KEY, '1') } catch (e) {}
      return true
    }
    return false
  }
})()
`.trim()
}
