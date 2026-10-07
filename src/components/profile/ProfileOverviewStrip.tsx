import { toPersianDigits } from '@/lib/persianDigits'
import { ProfileStatCell } from './ProfileStatCell'

type OverviewModel = {
  episodesWatched: number
  averageRating: number | null
  activeDays: number | null
  watchHours: number | null
  watchHoursHint?: string | null
}

export const ProfileOverviewStrip = ({ data }: { data: OverviewModel }) => {
  const avg =
    data.averageRating != null
      ? toPersianDigits(data.averageRating.toFixed(1))
      : '—'
  const activeDays =
    data.activeDays != null ? toPersianDigits(data.activeDays) : '—'
  const hours =
    data.watchHours != null ? toPersianDigits(data.watchHours) : '—'

  return (
    <div className="mx-4 mt-5">
      <div className="grid grid-cols-4 gap-1.5">
        <ProfileStatCell
          value={toPersianDigits(data.episodesWatched)}
          label="قسمت دیده"
        />
        <ProfileStatCell value={avg} label="میانگین امتیاز" />
        <ProfileStatCell value={activeDays} label="روز فعال" />
        <ProfileStatCell value={hours} label="ساعت تماشا" />
      </div>
      {data.watchHoursHint ? (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          {data.watchHoursHint}
        </p>
      ) : null}
    </div>
  )
}
