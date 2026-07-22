import { Link } from 'react-router-dom'
import { Delete02Icon, Download01Icon } from 'hugeicons-react'
import { useMyListStore, type DownloadRecord } from '@/store/myListStore'
import { animeDetailPath } from '@/lib/animePaths'
import { formatDateTimeFa, toPersianNumber } from '@/lib/myListUtils'
import { BidiText } from '@/components/BidiText'
import { cn } from '@/lib/utils'
import { MyListEmptyState, MyListTabHeader } from './MyListUi'

const DownloadCard = ({
  record,
  onRemove,
  onMarkRemoved,
}: {
  record: DownloadRecord
  onRemove: () => void
  onMarkRemoved: () => void
}) => {
  const isRemoved = record.status === 'removed'

  const metaParts: string[] = []
  if (record.quality) metaParts.push(record.quality)
  if (record.fileSize) metaParts.push(record.fileSize)

  return (
    <article
      className={cn(
        'flex gap-3 rounded-xl border bg-card/50 p-3',
        'transition-all duration-150 active:scale-[0.995]',
        isRemoved ? 'border-border/30 opacity-70' : 'border-border/50'
      )}
    >
      <Link
        to={animeDetailPath({ id: record.animeId })}
        className="shrink-0 active:scale-[0.97] transition-transform"
        aria-label={`مشاهده ${record.animeTitle}`}
      >
        <div className="relative w-16 aspect-[2/3] overflow-hidden rounded-lg border border-border/80 bg-muted">
          <img
            src={record.animeImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          {isRemoved ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Download01Icon className="h-4 w-4 text-white/80" />
            </div>
          ) : null}
        </div>
      </Link>

      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
        <div>
          <Link
            to={animeDetailPath({ id: record.animeId })}
            className="block active:scale-[0.99] transition-transform"
          >
            <BidiText
              as="h3"
              className="text-[13px] font-semibold text-foreground line-clamp-1 text-right leading-5"
            >
              {record.animeTitle}
            </BidiText>
          </Link>

          <p className="text-xs text-muted-foreground mt-1 text-right tabular-nums">
            قسمت {toPersianNumber(record.episodeNumber)}
            {metaParts.length > 0 ? (
              <span className="text-primary-400 font-medium">
                {' · '}
                {metaParts.join(' · ')}
              </span>
            ) : null}
          </p>

          <p className="text-[11px] text-muted-foreground/70 mt-1 text-right tabular-nums">
            {formatDateTimeFa(record.downloadedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 justify-end">
          {isRemoved ? (
            <Link
              to={`${animeDetailPath({ id: record.animeId })}?tab=episodes`}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-1.5',
                'text-xs font-medium',
                'border border-primary-400/30 bg-primary-400/10 text-primary-400',
                'transition-colors hover:bg-primary-400/20 active:scale-[0.98]'
              )}
            >
              <Download01Icon className="h-3.5 w-3.5" />
              دانلود مجدد
            </Link>
          ) : (
            <button
              type="button"
              onClick={onMarkRemoved}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-3 py-1.5',
                'text-xs font-medium',
                'border border-border/60 bg-muted/30 text-muted-foreground',
                'transition-colors hover:bg-muted/50 active:scale-[0.98]'
              )}
            >
              <Download01Icon className="h-3.5 w-3.5" />
              حذف فایل
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            aria-label="حذف از لیست"
            className={cn(
              'inline-flex items-center justify-center rounded-lg p-1.5',
              'text-muted-foreground/60 transition-colors',
              'hover:text-red-400 hover:bg-red-400/10 active:scale-95'
            )}
          >
            <Delete02Icon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

export const DownloadsTab = () => {
  const downloads = useMyListStore((s) => s.downloads)
  const removeDownload = useMyListStore((s) => s.removeDownload)
  const clearDownloads = useMyListStore((s) => s.clearDownloads)
  const markDownloadRemoved = useMyListStore((s) => s.markDownloadRemoved)

  if (downloads.length === 0) {
    return (
      <MyListEmptyState
        title="دانلودی ثبت نشده"
        description="وقتی از صفحهٔ جزئیات انیمه قسمت دانلود کنی، این‌جا با جزئیات کیفیت و تاریخ نمایش داده می‌شه."
        actionLabel="مرور انیمه‌ها"
      />
    )
  }

  return (
    <div>
      <MyListTabHeader
        title="دانلودها"
        meta={`${toPersianNumber(downloads.length)} قسمت`}
        action={
          <button
            type="button"
            onClick={clearDownloads}
            className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            پاک کردن
          </button>
        }
      />

      <div className="space-y-2">
        {downloads.map((record) => (
          <DownloadCard
            key={record.id}
            record={record}
            onRemove={() => removeDownload(record.id)}
            onMarkRemoved={() => markDownloadRemoved(record.id)}
          />
        ))}
      </div>
    </div>
  )
}
