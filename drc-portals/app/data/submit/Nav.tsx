import Container from '@mui/material/Container'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ColorToggleButton from './NavToggle'

export default async function Nav() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return (
      <Container maxWidth="lg">
        <ColorToggleButton userAdmin={false} loggedIn={false} registered={false} />
      </Container>
    )
  } else {
    let userAdmin = false
    if (session.user.role === 'ADMIN') {
      userAdmin = true;
    }
    let registered = false
    if (session.user.role !== 'USER') {
      registered = true;
    }
    return (
      <Container maxWidth="lg">
        <ColorToggleButton userAdmin={userAdmin} loggedIn={true} registered={registered} />
      </Container>
    )
  }
}
