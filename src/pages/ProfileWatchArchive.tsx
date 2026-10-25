import { RouteFallback } from '@/components/RouteFallback'
import { PersonalWatchArchive } from '@/components/profile/personal/PersonalWatchArchive'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { useAppAuth } from '@/hooks/useAppAuth'

const ProfileWatchArchive = () => {
  const { isReady } = useAppAuth()
  if (!isReady) return <RouteFallback />

  return (
    <ProfilePersonalSubpageLayout
      title="آرشیو تماشای من"
      description="انیمه‌ها بر اساس وضعیت ثبت‌شده در پیشرفت تماشا"
    >
      <PersonalWatchArchive embedded />
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfileWatchArchive
