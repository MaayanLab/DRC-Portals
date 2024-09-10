import React from "react"
import { usePathname as useNextPathname } from "next/navigation"

/**
 * Make pathname work like it does in development even in production
 */
export default function usePathname() {
  const nextPathname = useNextPathname()
  const pathname = React.useMemo(() => {
    if (typeof window !== 'undefined' && window.location.origin.includes('data.cfde.cloud') && !nextPathname.startsWith('/data')) {
      return `/data${nextPathname === '/' ? '' : nextPathname}`
    }
    else if (typeof window !== 'undefined' && window.location.origin.includes('info.cfde.cloud') && !nextPathname.startsWith('/info')) {
      return `/info${nextPathname === '/' ? '' : nextPathname}`
    }
    else
      return nextPathname
  }, [nextPathname])
  return pathname
}
