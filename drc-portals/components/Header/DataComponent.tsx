'use client'
import { usePathname } from "next/navigation"

export const DataComponent = ({children}: {children: React.ReactNode}) => {
	const pathname = usePathname()
	if (pathname.indexOf('/data') > -1) return <>{children}</>
	else return null
}