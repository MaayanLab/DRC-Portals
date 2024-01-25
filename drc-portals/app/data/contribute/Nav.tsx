import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ColorToggleButton from './NavToggle'

export default async function Nav() {
  const session = await getServerSession(authOptions)
  if (!session) return redirect("/auth/signin?callbackUrl=/data/contribute/form")
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  let userAdmin = false
  if (user?.role === 'ADMIN')
  {
    userAdmin = true;
  }


  return (
    <Container maxWidth="lg">
      <ColorToggleButton userAdmin={userAdmin}/>
    </Container>
  )
}
