import { RouteFallback } from '@/components/RouteFallback'
import { PersonalPlaylistsBlock } from '@/components/profile/personal/PersonalPlaylistsBlock'
import { ProfilePersonalSubpageLayout } from '@/components/profile/ProfilePersonalSubpageLayout'
import { useAppAuth } from '@/hooks/useAppAuth'

const ProfilePlaylists = () => {
  const { isReady } = useAppAuth()
  if (!isReady) return <RouteFallback />

  return (
    <ProfilePersonalSubpageLayout
      title="پلی‌لیست‌ها"
      description="لیست‌های شخصی — با سوئیچ عمومی در تب پلی‌لیست‌های پروفایل دیده می‌شوند"
    >
      <PersonalPlaylistsBlock embedded />
    </ProfilePersonalSubpageLayout>
  )
}

export default ProfilePlaylists
