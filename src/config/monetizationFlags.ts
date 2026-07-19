/**
 * Launch / monetization feature flags (mini-app).
 *
 * For initial launch we keep the pre-subscription / pre-token download UX.
 * Set these to `true` later to re-enable the gated funnel without restoring from git.
 *
 * Related API masking lives in anime-catalog.service.ts (same flag name commented there).
 */
export const ENABLE_SUBSCRIPTION_DOWNLOAD_GATE = false

/** Free-tab wallet, token claim, mock free episodes, subscribe CTAs from token card */
export const ENABLE_FREE_TOKEN_WALLET_UI = false

/**
 * When false (launch): download sub-tabs are «قسمت‌ها» + «زیرنویس».
 * When true: show softsub / hardsub / free kind tabs again.
 */
export const SHOW_HARD_AND_FREE_DOWNLOAD_TABS = false
