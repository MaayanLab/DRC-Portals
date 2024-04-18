'use client'
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Grid, Typography } from "@mui/material";

const menu_selection = {
	info: [
		{title: "Home", href: "/info"},
		{title: "CF Programs", href: "/info/dcc"},
		{title: "Partnerships", href: "/info/partnerships"},
		{title: "Training & Outreach", href: "/info/outreach"},
		{title: "Publications", href: "/info/publications"},
		{title: "Documentation", href: "/info/documentation"},
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


function Navigation () {
	const pathname = usePathname()
	const home = pathname.split("/")[1] 
	return (
		<Grid container alignItems={"center"} spacing={2}>
			{(home === 'info' || home === 'data') && 
				menu_selection[home].map(({title, href})=>(
					<Grid item key={title}>
						{ href.indexOf('http') > -1 ? 
							<Link href={href} target="_blank" rel="noopener noreferrer">
								<Typography variant="nav">{title}</Typography>
							</Link>:
							<Link href={`${href}`}>
								<Typography variant="nav">{title}</Typography>
							</Link>
						}
					</Grid>
				))}
		</Grid>
	)
}

export default Navigation