import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProfileSectionMoreLinkProps = {
  to: string
  label?: string
  className?: string
}

/** Text link + chevron for profile section headers (ترجمه‌ها، علاقه‌مندی‌ها، …). */
export const ProfileSectionMoreLink = ({
  to,
  label = 'همه',
  className,
}: ProfileSectionMoreLinkProps) => (
  <Link
    to={to}
    className={cn(
      'inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary-400',
      'active:opacity-75',
      className
    )}
  >
    {label}
    <ChevronLeft className="h-3.5 w-3.5 opacity-80" aria-hidden />
  </Link>
)
