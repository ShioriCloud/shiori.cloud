/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHIORI_API_URL: string
  readonly VITE_ANIME_IMAGE_COLUMN?: string
  readonly VITE_TELEGRAM_BOT_USERNAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
