import { Link } from 'react-router-dom'
import { Download01Icon } from 'hugeicons-react'
import { BidiText } from '@/components/BidiText'
import { useMyListStore, type DownloadRecord } from '@/store/myListStore'
import { animeDetailPath } from '@/lib/animePaths'
import { formatDateTimeFa, toPersianNumber } from '@/lib/myListUtils'
import { MyListAnimeRow, MyListBadge } from '@/components/my-list/MyListAnimeRow'
import {
  MyListClearChip,
  MyListDeleteChip,
  MyListEmptyState,
  MyListPoster,
  MyListTabHeader,
} from './MyListUi'
import { cn } from '@/lib/utils'

const DownloadCard = ({ record, onRemove }: { record: DownloadRecord; onRemove: () => void }) => {
  const isRemoved = record.status === 'removed'

  return (
    <div className={cn(isRemoved && 'opacity-70')}>
      <MyListAnimeRow
        image={record.animeImage}
        link={
          <Link
            to={animeDetailPath({ id: record.animeId })}
            className="relative shrink-0 active:scale-[0.97] transition-transform"
            aria-label={`مشاهده ${record.animeTitle}`}
          >
            <MyListPoster src={record.animeImage} />
            {isRemoved ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                <Download01Icon className="h-4 w-4 text-white/80" />
              </div>
            ) : null}
          </Link>
        }
        title={
          <Link
            to={animeDetailPath({ id: record.animeId })}
            className="block active:scale-[0.99] transition-transform"
          >
            <BidiText
              as="h3"
              className="text-sm font-semibold text-foreground text-end leading-snug line-clamp-2 break-words"
            >
              {record.animeTitle}
            </BidiText>
          </Link>
        }
        badges={
          <>
            <MyListBadge tone="default">قسمت {toPersianNumber(record.episodeNumber)}</MyListBadge>
            {record.quality ? <MyListBadge tone="primary">{record.quality}</MyListBadge> : null}
            {record.fileSize ? <MyListBadge tone="muted">{record.fileSize}</MyListBadge> : null}
            <MyListBadge tone="time">{formatDateTimeFa(record.downloadedAt)}</MyListBadge>
            {isRemoved ? <MyListBadge tone="warning">فایل حذف شد</MyListBadge> : null}
          </>
        }
        trailing={
          <MyListDeleteChip aria-label="حذف از دانلودها" onClick={onRemove} />
        }
      />
    </div>
  )
}

export const DownloadsTab = () => {
  const downloads = useMyListStore((s) => s.downloads)
  const removeDownload = useMyListStore((s) => s.removeDownload)
  const clearDownloads = useMyListStore((s) => s.clearDownloads)

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
        action={<MyListClearChip onClick={clearDownloads} />}
      />

      <div className="space-y-2">
        {downloads.map((record) => (
          <DownloadCard
            key={record.id}
            record={record}
            onRemove={() => removeDownload(record.id)}
          />
        ))}
      </div>
    </div>
  )
}
