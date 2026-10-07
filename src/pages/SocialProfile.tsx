import { Navigate, useSearchParams } from 'react-router-dom'

/** Legacy route — profile tabs replaced the standalone social page. */
const SocialProfile = () => {
  const [searchParams] = useSearchParams()
  const next = new URLSearchParams(searchParams)
  next.set('tab', 'stats')
  const qs = next.toString()
  return <Navigate to={qs ? `/profile?${qs}` : '/profile?tab=stats'} replace />
}

export default SocialProfile
