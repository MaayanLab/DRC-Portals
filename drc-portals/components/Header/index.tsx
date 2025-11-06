

import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'

import { 
	Grid,
	Toolbar,
	Stack,
	Typography,
	Box
} from '@mui/material';

import SearchParamSearchField from '@/app/data/processed/SearchParamSearchField'
import { Logo } from '../styled/Logo'
import { DRCDrawer } from './drawer';

import Link from "@/utils/link"
import UserComponent from "../misc/LoginComponents/UserComponent"
import { authOptions } from '@/lib/auth'
import { TextNav } from "./client"
import { Session, getServerSession } from "next-auth"
import NavBreadcrumbs from './breadcrumbs';
export const TopNav = async ({path, session}: {path: "/info"| "/data", session: Session | null}) => {
	return (
	<>
	  <Link href="/info">
		<Typography variant="nav" sx={path === "/info"  ? {textDecoration: "underline", textDecorationThickness: 2}: {}}><b>Information Portal</b></Typography>
	  </Link>
	  <Link href={"/data"}>
		<Typography variant="nav"  sx={path === "/data"  ? {textDecoration: "underline", textDecorationThickness: 2}: {}}><b>Data Portal</b></Typography>
	  </Link>
	  <Link href={"/info/centers/KC"}>
		<Typography variant="nav"><b>Knowledge Portal</b></Typography>
	  </Link>
	  <UserComponent session={session}/>
	</>
  )}
  
  export const BottomNav = ({nav, path}: {path: '/info'|'/data', nav: Array<{href: string, title: string}>}) => {
	return nav.map(({title, href})=>(
	  <Grid item key={title}>
		{ href.indexOf('http') > -1 ? 
		  <Link href={href} target="_blank" rel="noopener noreferrer">
			<Typography variant="nav">{title}</Typography>
		  </Link>:
		  <Link href={`${href}`}>
			<TextNav title={title} path={href.replace(path, '')}/>
		  </Link>
		}
	  </Grid>
	))
  }
  
const info_nav = [
  {title: "Home", href: "/info"},
  {title: "CF Programs", href: "/info/dcc"},
  {title: "CFDE Centers", href: "/info/centers"},
  {title: "Partnerships", href: "/info/partnerships"},
  {title: "Training & Outreach", href: "/info/training_and_outreach"},
  {title: "Publications", href: "/info/publications"},
  {title: "Webinars", href: "/info/training_and_outreach/cfde-webinar-series"},
//   {title: "What's New?", href: "/info/news"},
  {title: "About", href: "/info/about"},
]

const data_nav = [
	{title: "Search", href: "/data"},
	{title: "Enrichment", href: "/data/enrichment"},
	{title: "Cross", href: "/data/cross"},
	{title: "Assistant", href: "/data/chat"},
	{title: "Data Matrix", href: "/data/matrix"},
	{title: "Use Cases", href: "/data/usecases"},
	{title: "Tools & Workflows", href: "/data/tools_and_workflows"},
	{title: "Submit", href: "/data/submit"},
	{title: "Documentation", href: "/info/documentation"},
	
  ]

export default async function Header({path}: {path: "/info" | "/data"}) {
	const nav = path === "/info" ? info_nav: data_nav
	const session = await getServerSession(authOptions)
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000", display: {xs: "none", sm: "none", md: "block"}}}>
      <Toolbar>
			  <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
				<Grid item>
					<Logo title="CFDE Workbench" href={path} size='large' color="secondary"/>
				</Grid>
				<Grid item>
					<Stack direction={"row"} alignItems={"center"} spacing={2}>
					<TopNav path={path} session={session}/>
					</Stack>
				</Grid>
				<Grid item xs={12}> 
					<Grid container alignItems={"center"} spacing={2}>
						<BottomNav nav={nav} path={path}/>
					</Grid>
				</Grid>
          
				<Grid item xs={12} className='flex items-center'>
					<div className='flex flex-grow'><NavBreadcrumbs/></div>{path === "/data" && <SearchParamSearchField />}
				</Grid>
        </Grid>
      </Toolbar>
      </AppBar>
	  <Box sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
		<Stack spacing={1}>
			<DRCDrawer path={path} nav={nav} session={session}/>
			{(path === "/data") && <SearchParamSearchField />}
		</Stack>
	  </Box>
    </Container>
  )
}
