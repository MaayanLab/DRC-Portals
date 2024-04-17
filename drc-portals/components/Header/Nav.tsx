'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { 
	Grid,
	Button,
	Toolbar,
	Typography,
	Stack
} from '@mui/material';

import UserComponent from '../misc/LoginComponents/UserComponent'
import SearchParamSearchField from '@/app/data/processed/SearchParamSearchField'
import { Logo } from '../styled/Logo'

const menu_selection = {
	info: [
		{title: "Home", href: "/info"},
		{title: "Programs", href: "/info/dcc"},
		{title: "Documentation", href: "/info/documentation"},
		{title: "Partnerships", href: "/info/partnerships"},
		{title: "Training & Outreach", href: "/info/outreach"},
		{title: "Publications", href: "/info/publications"},
		// {title: "About", href: "/info/coming_soon"},
	],
	data: [
		{title: "Search", href: "/data"},
		{title: "Chatbot", href: "/data/chat"},
		{title: "Data Matrix", href: "/data/matrix"},
		{title: "Use Cases", href: "https://playbook-workflow-builder.cloud/playbooks", new_tab: true},
		{title: "Tools & Workflows", href: "/data/tools_and_workflows", new_tab: true},
		{title: "Submit", href: "/data/contribute"},
		{title: "Documentation", href: "/info/documentation"},
		
	]
} 


function useOutsideAlerter(ref:React.RefObject<any>, handleClose:Function) {
	useEffect(() => {
	  /**
	   * Alert if clicked on outside of element
	   */
	  function handleClickOutside(event:MouseEvent) {
		if (ref.current && !ref.current.contains(event.target)) {
			handleClose()
		}
	  }
	  // Bind the event listener
	  document.addEventListener("mousedown", handleClickOutside);
	  return () => {
		// Unbind the event listener on clean up
		document.removeEventListener("mousedown", handleClickOutside);
	  };
	}, [ref]);
  }

export default function Nav({home, session}: {
	home: string,
	session: Session | null,
}) {
	const [menu, setMenu] = useState<'data'|'info'|null>(null)
	const handleClose = () => setMenu(null)
	const wrapperRef = useRef(null);
  	useOutsideAlerter(wrapperRef, handleClose);
	return (
		<Toolbar ref={wrapperRef}>
			<Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
				<Grid item>
					<Logo href={home} title="CFDE Workbench" size='large' color="secondary"/>
				</Grid>
				<Grid item>
					<Stack direction={"row"} alignItems={"center"} spacing={2}>
						<Button
							id="basic-button"
							aria-controls={'info-menu'}
							aria-haspopup="true"
							aria-expanded={menu === 'info' ? 'true' : undefined}
							onClick={()=>menu === 'info' ? setMenu(null): setMenu('info')}
						>
							<Typography variant="nav"><b>Information Portal</b></Typography>
						</Button>
						<Button
							id="basic-button"
							aria-controls={'data-menu'}
							aria-haspopup="true"
							aria-expanded={menu === 'data' ? 'true' : undefined}
							onClick={()=>menu === 'data' ? setMenu(null): setMenu('data')}
						>
							<Typography variant="nav"><b>Data Portal</b></Typography>
						</Button>
						{/* <Link href={"mailto:help@cfde.cloud"}>
							<Typography variant="nav">Support</Typography>
						</Link> */}
						<UserComponent session={session}/>
					</Stack>
				</Grid>
				{ menu !== null && 
					<Grid item xs={12}>
						<Grid container alignItems={"center"} spacing={2}>
						{menu_selection[menu].map(({title, href})=>(
							<Grid item key={title}>
								{ href.indexOf('http') > -1 ? <Link href={href} target="_blank" rel="noopener noreferrer">
											<Typography variant="nav">{title}</Typography>
										</Link>:
									<Link href={href}>
										<Typography variant="nav">{title}</Typography>
									</Link>
								}
							</Grid>
						))}
						</Grid>
					</Grid>
				}
				{ home === '/data' && <Grid item xs={12} sx={{textAlign: 'right'}}>
					<SearchParamSearchField />
				</Grid>}
			</Grid>
		</Toolbar>
	)
}
