import { Navigate, useSearchParams } from 'react-router-dom'

/** Legacy route — profile tabs replaced the standalone social page. */
const SocialProfile = () => {
  const [searchParams] = useSearchParams()
  const qs = searchParams.toString()
  return <Navigate to={qs ? `/profile?${qs}` : '/profile'} replace />
}

export default SocialProfile
