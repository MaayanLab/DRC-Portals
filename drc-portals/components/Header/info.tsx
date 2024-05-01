import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Link from 'next/link';
import { 
	Grid,
	Button,
	Toolbar,
	Typography,
	Stack
} from '@mui/material';

import UserComponent from '../misc/LoginComponents/UserComponent'
import { DataComponent } from './DataComponent';
import SearchParamSearchField from '@/app/data/processed/SearchParamSearchField'
import { Logo } from '../styled/Logo'
import { TextNav } from './client';

const nav = [
  {title: "Home", href: "/info"},
  {title: "CF Programs", href: "/info/dcc"},
  {title: "Partnerships", href: "/info/partnerships"},
  {title: "Training & Outreach", href: "/info/outreach"},
  {title: "Publications", href: "/info/publications"},
  {title: "Documentation", href: "/info/documentation"},
  // {title: "About", href: "/info/coming_soon"},
]

export default async function Header() {
  const session = await getServerSession(authOptions) 
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}}>
      <Toolbar>
			  <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
          <Grid item>
            <Logo title="CFDE Workbench" href="/info" size='large' color="secondary"/>
          </Grid>
          <Grid item>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Link href="/info">
                <Typography variant="nav" sx={{textDecoration: "underline", textDecorationThickness: 2}}><b>Information Portal</b></Typography>
              </Link>
              <Link href={"/data"}>
                <Typography variant="nav"><b>Data Portal</b></Typography>
              </Link>
              {/* <Link href={"mailto:help@cfde.cloud"}>
                <Typography variant="nav">Support</Typography>
              </Link> */}
              <UserComponent session={session}/>
            </Stack>
				  </Grid>
          <Grid item xs={12}> 
            <Grid container alignItems={"center"} spacing={2}>
              {nav.map(({title, href})=>(
                <Grid item key={title}>
                  { href.indexOf('http') > -1 ? 
                    <Link href={href} target="_blank" rel="noopener noreferrer">
                      <Typography variant="nav">{title}</Typography>
                    </Link>:
                    <Link href={`${href}`}>
                      <TextNav title={title} path={href.replace('/info', '')}/>
                    </Link>
                  }
                </Grid>
              ))}
            </Grid>
          </Grid>
          <DataComponent>
            <Grid item xs={12} sx={{textAlign: 'right'}}>
              <SearchParamSearchField />
            </Grid>
          </DataComponent>
        </Grid>
      </Toolbar>
      </AppBar>
    </Container>
  )
}
