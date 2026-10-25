/**
 * Re-exports badge WebP assets: sharpened 512 + compact 256 for grid/profile.
 * Run: node scripts/optimize-badge-art.mjs
 */
import { readdir, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BADGE_DIR = path.join(__dirname, '..', 'public', 'badges')

const isMainBadge = (name) =>
  name.endsWith('.webp') && !name.includes('-md.') && name !== 'preview.webp'

async function main() {
  const names = await readdir(BADGE_DIR)
  const files = names.filter(isMainBadge)

  for (const file of files) {
    const inputPath = path.join(BADGE_DIR, file)
    const id = file.replace(/\.webp$/, '')
    const mdPath = path.join(BADGE_DIR, `${id}-md.webp`)

    const buf = await sharp(inputPath).ensureAlpha().toBuffer()

    await sharp(buf)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .sharpen({ sigma: 0.85, m1: 1.1, m2: 0.45 })
      .modulate({ brightness: 1.04, saturation: 1.06 })
      .webp({ quality: 92, effort: 6, alphaQuality: 100 })
      .toFile(path.join(BADGE_DIR, `${id}.__opt.webp`))

    await sharp(buf)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .sharpen({ sigma: 1.15, m1: 1.2, m2: 0.5 })
      .modulate({ brightness: 1.06, saturation: 1.1 })
      .webp({ quality: 90, effort: 6, alphaQuality: 100 })
      .toFile(mdPath)

    const tmpPath = path.join(BADGE_DIR, `${id}.__opt.webp`)
    try {
      await unlink(inputPath)
    } catch {
      /* fresh write */
    }
    await rename(tmpPath, inputPath)

    console.log('ok', file, '→', `${id}-md.webp`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
