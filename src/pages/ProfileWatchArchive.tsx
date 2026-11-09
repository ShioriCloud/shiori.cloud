import { RouteFallback } from '@/components/RouteFallback'
import { PersonalWatchArchive } from '@/components/profile/personal/PersonalWatchArchive'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { useAppAuth } from '@/hooks/useAppAuth'
import { profileScrollKey, useTabScrollRestoration } from '@/hooks/useTabScrollRestoration'

const ProfileWatchArchive = () => {
  useTabScrollRestoration(profileScrollKey('watch-archive'))
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
