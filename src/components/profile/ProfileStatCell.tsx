import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export const ProfileStatCell = ({
  value,
  label,
  to,
}: {
  value: string
  label: string
  to?: string
}) => {
  const className = cn(
    'surface-skeuo rounded-lg px-2 py-3 text-center',
    to && 'active:scale-[0.98] transition-transform'
  )
  const body = (
    <>
      <p className="text-base font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{label}</p>
    </>
  )
  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
