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
import { ClientNav } from './client_nav';


export default async function Header({type}: {type: 'info' | 'data'}) {
  const session = await getServerSession(authOptions) 
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}}>
      <Toolbar>
			  <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
          <Grid item>
            <Logo title="CFDE Workbench" size='large' color="secondary"/>
          </Grid>
          <Grid item>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <Link href="/info">
                <Typography variant="nav"><b>Information Portal</b></Typography>
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
              <ClientNav type={type}/>
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
