'use client'
import { Typography } from "@mui/material"
import { usePathname } from "next/navigation"

export  function TextNav({title, paths, clicked}: {title: string, paths: string[], clicked?: boolean}) {
	const pathname = usePathname()
	let variant: 'nav' | 'nav_highlighted' = 'nav'
	for (const path of paths) {
		// const path = p.replace(/^\/info/, "").replace(/^\/data/, "")
		if ((pathname.indexOf(path) !== -1 && path !== '/' && path !== '/data' && path !== '/info') || ((/^\/data\/(search|c2m2|processed|$)/.exec(pathname) !== null) && path === "/data") || (path === pathname)) {		
			variant = 'nav_highlighted'
			break
		}
		// if (pathname.indexOf('training_and_outreach/cfde-webinar-series')>-1 && path==='/training_and_outreach') {
		// 	variant = "nav"
		// }
	}
	return(
		<Typography variant={clicked ? 'nav_clicked': variant}><b>{title}</b></Typography>
	)
}