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
    const user = session.keycloakInfo
    if (!user) return redirect("/auth/signin?callbackUrl=/data/submit/uploaded")
    let userAdmin = false
    if (user.roles.includes('ADMIN')) {
      userAdmin = true;
    }
    let registered = false
    if (user.roles.includes('UPLOADER') || user.roles.includes('DCC_APPROVER') || user.roles.includes('DRC_APPROVER') || user.roles.includes('READONLY') || user.roles.includes('ADMIN')) {
      registered = true;
    }
    return (
      <Container maxWidth="lg">
        <ColorToggleButton userAdmin={userAdmin} loggedIn={true} registered={registered} />
      </Container>
    )
  }
}
