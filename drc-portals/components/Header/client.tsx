'use client'
import { Typography } from "@mui/material"
import { usePathname } from "next/navigation"

export  function TextNav({title, path}: {title: string, path: string}) {
	const pathname = usePathname().replace("/info", "/").replace("/data", "/")
	let sx
	if ((pathname.indexOf(path) !== -1 && path !== '') || ((pathname.indexOf('/processed') > -1 || pathname === "/") && path === "")) {
		sx = {textDecoration: "underline", textDecorationThickness: 2}
	}
	return(
		<Typography variant="nav" sx={sx}><b>{title}</b></Typography>
	)
}