import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  hasUsableHref,
  isExternalHref,
  normalizeHomeBlockHref,
} from '@/lib/homeBlockLinks'
import type { HomeCustomBlock } from '@/types/home'
import { CuratedSliderBlock } from './CuratedSliderBlock'
import { CtaBannerBlock } from './CtaBannerBlock'
import { CtaCardBlock } from './CtaCardBlock'

const renderBlock = (block: HomeCustomBlock) => {
  if (block.type === 'curated_slider') {
    return <CuratedSliderBlock key={block.id} block={block} />
  }
  if (block.type === 'cta_banner') {
    return <CtaBannerBlock key={block.id} block={block} />
  }
  if (block.type === 'cta_card') {
    return <CtaCardBlock key={block.id} block={block} />
  }
  return null
}

export const HomeCustomBlocks = memo(({ blocks }: { blocks: HomeCustomBlock[] }) => {
  if (blocks.length === 0) return null

  const blocksKey = blocks
    .map((block) => {
      if (block.type === 'curated_slider') {
        return `${block.id}:${block.items.map((item) => item.id).join(',')}`
      }
      return block.id
    })
    .join('|')

  return (
    <div key={blocksKey} className="space-y-8">
      {blocks.map(renderBlock)}
    </div>
  )
})

HomeCustomBlocks.displayName = 'HomeCustomBlocks'

export const HomeCustomBlockLink = ({
  href,
  openInNewTab,
  children,
  className,
}: {
  href: string | null | undefined
  openInNewTab?: boolean
  children: ReactNode
  className?: string
}) => {
  if (!hasUsableHref(href)) {
    return <div className={className}>{children}</div>
  }

  const url = normalizeHomeBlockHref(href)
  const external = isExternalHref(url)

  if (external) {
    return (
      <a
        href={url}
        className={className}
        target={openInNewTab ? '_blank' : undefined}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  if (openInNewTab) {
    return (
      <Link to={url} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    )
  }

  return (
    <Link to={url} className={className}>
      {children}
    </Link>
  )
}
