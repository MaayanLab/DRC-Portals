import Container from '@mui/material/Container'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
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
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })
    let userAdmin = false
    if (user?.role === 'ADMIN') {
      userAdmin = true;
    }
    let registered = false
    if (user?.role !== 'USER') {
      registered = true;
    }
    return (
      <Container maxWidth="lg">
        <ColorToggleButton userAdmin={userAdmin} loggedIn={true} registered={registered} />
      </Container>
    )
  }
}
