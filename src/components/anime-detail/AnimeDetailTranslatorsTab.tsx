import { Link } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { ExternalLink } from 'lucide-react'
import type { TranslatorAnimeLink } from '../../types/catalog'
import { TranslatorsTabSkeleton } from './AnimeDetailSkeletons'
import { EmptyBlock } from './AnimeDetailChrome'

export const AnimeDetailTranslatorsTab = ({
  links,
  pending,
}: {
  links: TranslatorAnimeLink[]
  pending: boolean
}) =>
  pending ? (
    <TranslatorsTabSkeleton />
  ) : links.length === 0 ? (
    <EmptyBlock message="مترجمی ثبت نشده" />
  ) : (
    <div className="space-y-2">
      {links.map((l) => (
        <Link
          key={String(l.id)}
          to={`/translators/${encodeURIComponent(String(l.translator.slug))}`}
          className="surface-skeuo flex items-center justify-between gap-3 rounded-xl p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted border border-black/[0.08] shrink-0 dark:border-border">
              {l.translator.avatar_url ? (
                <img
                  src={String(l.translator.avatar_url)}
                  alt={l.translator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-1">
                {l.translator.name}
              </p>
              {l.role ? (
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {l.role}
                </p>
              ) : null}
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  )
