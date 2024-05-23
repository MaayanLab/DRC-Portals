'use client'
import { useState } from "react"
import Link from "next/link";
import { Button, Stack, Divider, Typography } from "@mui/material"
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Logo } from '../styled/Logo'
import { Session } from "next-auth"
import MenuIcon from '@mui/icons-material/Menu';
import UserComponent from "../misc/LoginComponents/UserComponent";
import { TextNav } from "./client";
export const DRCDrawer = ({path, nav, session}: {path: "/info"| "/data", nav: Array<{href: string, title: string}>, session: Session | null}) => {
	const [open, setOpen] = useState(false)
	const theme = useTheme();
  	const matches = useMediaQuery(theme.breakpoints.up('sm'));
	console.log(open, "open")
	return (
		<>
			<Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
				<Logo title="CFDE Workbench" href={path} size={matches ? 'large': 'small'} color="secondary"/>
				<div className="flex">
					<Button color="secondary" onClick={()=>setOpen(!open)}><MenuIcon/></Button>
					{session !== null &&  <UserComponent session={session}/>}
				</div>
			</Stack>
			<Drawer open={open} onClose={()=>setOpen(false)}>
				<Stack spacing={2} sx={{padding: 2}} justifyContent={"flex-start"}>
					<div className="flex flex-col">
						<Link href="/info"  onClick={()=>setOpen(false)}>
							<Typography variant="nav" sx={path === "/info"  ? {textDecoration: "underline", textDecorationThickness: 2}: {}}><b>Information Portal</b></Typography>
						</Link>
						<Link href={"/data"}  onClick={()=>setOpen(false)}>
							<Typography variant="nav"  sx={path === "/data"  ? {textDecoration: "underline", textDecorationThickness: 2}: {}}><b>Data Portal</b></Typography>
						</Link>
					</div>
					<Divider/>
					<div className="flex flex-col">
					{
						nav.map(({title, href})=>(
							<Link href={`${href}`} key={title} onClick={()=>setOpen(false)}>
								<TextNav title={title} path={href.replace(path, '')}/>
							</Link>
						))
					}
					</div>
					<Divider/>
					<Logo title="CFDE Workbench" href={path} size={'small'} color="secondary"/>
					{session === null &&  <UserComponent session={session}/>}
				</Stack>
			</Drawer>
		</>
	)
}