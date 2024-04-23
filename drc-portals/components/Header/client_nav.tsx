'use client'
import { Grid, Typography } from "@mui/material"
import Link from "next/link"
const nav_opt = {
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
	  {title: "Tools & Workflows", href: "/data/tools_and_workflows"},
	  {title: "Submit", href: "/data/submit"},
	  {title: "Documentation", href: "/info/documentation"},
	  
	]
  }

  
export const ClientNav = ({type}: {type: 'info'| 'data'}) => {
	const nav = nav_opt[type]
	return (
		<Grid container alignItems={"center"} spacing={2}>
			{nav.map(({title, href})=>(
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