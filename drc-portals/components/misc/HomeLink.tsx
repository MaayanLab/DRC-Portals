'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

export const HomeLink = ({children}: {children: React.ReactNode}) => {
	const pathname = usePathname()
	const home = `/${pathname.split("/")[1]}`
	return (
		<Link href={home} className='flex items-center space-x-3'>
			{children}
		</Link>
	)
}