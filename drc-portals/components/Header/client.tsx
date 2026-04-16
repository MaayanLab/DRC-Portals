'use client'
import { Typography } from "@mui/material"
import { usePathname } from "next/navigation"

export  function TextNav({title, paths}: {title: string, paths: string[]}) {
	const pathname = usePathname().replace(/^\/info/, "").replace(/^\/data/, "")
	let variant: 'nav' | 'nav_highlighted' = 'nav'
	for (const p of paths) {
		const path = p.replace(/^\/info/, "").replace(/^\/data/, "")
		console.log(pathname, path)
		if ((pathname.indexOf(path) !== -1 && path !== '') || ((/^\/(search|c2m2|processed|$)/.exec(pathname) !== null) && path === "") || (path === pathname)) {
			variant = 'nav_highlighted'
			break
		}
		// if (pathname.indexOf('training_and_outreach/cfde-webinar-series')>-1 && path==='/training_and_outreach') {
		// 	variant = "nav"
		// }
	}
	return(
		<Typography variant={variant}><b>{title}</b></Typography>
	)
}