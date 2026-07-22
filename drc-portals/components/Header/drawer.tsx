'use client'
import React, { useState } from "react"
import Link from "@/utils/link";
import { Button, Stack, Divider, Typography, Container, List, ListItemButton, ListItemIcon, ListItemText, Collapse } from "@mui/material"
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Logo } from '../styled/Logo'
import { Session } from "next-auth"
import MenuIcon from '@mui/icons-material/Menu';
import UserComponent from "../misc/LoginComponents/UserComponent";
import { TextNav } from "./client";
import Icon from "@mdi/react";
export const DRCDrawer = ({path, options, session}: {path: "/info"| "/data", options: Array<{title: string, links: Array<{
	title: string,
	href: string,
	description: string,
	icon: string,
}>}>, session: Session | null}) => {
	const [open, setOpen] = useState(false)
	const [openMenu, setOpenMenu] = useState('')
	const theme = useTheme();
  	const matches = useMediaQuery(theme.breakpoints.up('sm'));
	return (
		<>
			<Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
					<Logo title="CFDE Workbench" size={matches ? 'large': 'small'} color="secondary"/>
					<div className="flex">
						<Button color="secondary" onClick={()=>setOpen(!open)}><MenuIcon/></Button>
						{session !== null &&  <UserComponent session={session}/>}
					</div>
			</Stack>
			<Drawer open={open} onClose={()=>setOpen(false)}>
				<Stack spacing={2} sx={{padding: 2}} justifyContent={"flex-start"}>
					<div className="flex flex-col">
						<Link key={'data'} href={"/data"}>
							<Typography variant={"nav_highlighted"}><b>Data</b></Typography>
						</Link>
						<Link key={'cloud'} href={"https://cfdeworkspace.org/"} target="_blank" rel="noopener noreferrer">
							  <Typography variant="nav"><b>Cloud</b></Typography>
						</Link>
						<Link key={'kc'} href={"https://cfdeknowledge.org/r/kc_landing"}>
							  <Typography variant="nav"><b>Knowledge</b></Typography>
						</Link>
						<Link key={'training'} href={"https://orau.org/cfde-trainingcenter/"}>
							  <Typography variant="nav"><b>training</b></Typography>
						</Link>
						<Link key={'coordination'} href={"https://cfdeconnect.org/"}>
							  <Typography variant="nav"><b>coordination</b></Typography>
						</Link>
					</div>
					<Divider/>
					<List
						sx={{maxWidth: 300}}
						component="nav"
					>
						{options.map(option=>(
							<React.Fragment key={option.title}>
							<ListItemButton key={option.title} onClick={()=>openMenu === option.title ? setOpenMenu(''): setOpenMenu(option.title)}>
								
								<ListItemText>
									{option.title}
								</ListItemText>
							</ListItemButton>
							<Collapse in={option.title === openMenu} timeout="auto" unmountOnExit>
								<List component="div" disablePadding>
									{option.links.map(link=>
										<ListItemButton key={link.title} href={link.href} component={Link} sx={{ pl: 4 }}>
											<ListItemIcon>
												<Icon path={link.icon} size={1} />
											</ListItemIcon>
											<ListItemText primary={link.title} secondary={link.description} />
										</ListItemButton>
									)}
								</List>
							</Collapse>
							</React.Fragment>
						))}
					</List>
					<Divider/>
					<Logo title="CFDE Workbench" size={'small'} color="secondary"/>
					{session === null &&  <UserComponent session={session}/>}
				</Stack>
			</Drawer>
		</>
	)
}