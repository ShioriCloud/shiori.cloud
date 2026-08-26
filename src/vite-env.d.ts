/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHIORI_API_URL: string
  readonly VITE_ANIME_IMAGE_COLUMN?: string
  /** Upload bot — file download deep links */
  readonly VITE_TELEGRAM_BOT_USERNAME?: string
  /** Mini App host bot — share / startapp / profile */
  readonly VITE_TELEGRAM_MINI_APP_BOT_USERNAME?: string
  readonly VITE_MINI_APP_BOT_USERNAME?: string
  /** Semver from package.json (injected at build) */
  readonly VITE_APP_VERSION?: string
  /** Short git SHA (injected at build) */
  readonly VITE_APP_BUILD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
