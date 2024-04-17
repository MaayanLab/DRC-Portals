import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Nav from './Nav'

export default async function Header({home}: {home: string}) {
  const session = await getServerSession(authOptions) 
  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{color: "#000"}}>
        <Nav home={home} session={session}/>
      </AppBar>
    </Container>
  )
}
