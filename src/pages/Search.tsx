import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { buildExploreParamsFromSearchUrl } from '@/lib/exploreParams'

/** Legacy `/search` URLs redirect into Explore «همه انیمه‌ها». */
const Search = () => {
  const location = useLocation()
  const to = useMemo(() => {
    const params = buildExploreParamsFromSearchUrl(new URLSearchParams(location.search))
    return `/explore?${params.toString()}`
  }, [location.search])

  return <Navigate to={to} replace />
}

export default Search
