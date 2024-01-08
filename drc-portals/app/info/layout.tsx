import Grid  from '@mui/material/Grid'
import Container  from '@mui/material/Container'
import Header  from '@/components/Header/info'
import Footer  from '@/components/Footer/info'
import { Metadata } from 'next'
import Background from '@/components/styled/background'
import NavBreadcrumbs from '@/components/Header/breadcrumbs'
export const metadata: Metadata = {
  title: 'CFDE Information Portal',
}

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Grid container justifyContent={'space-between'} direction={"column"} sx={{minHeight: "100vh", marginTop: 2}}>
      <Grid item><Header/></Grid>
      <Grid item className="flex grow">
        <Background>
          <NavBreadcrumbs/>
          {children}
        </Background>
      </Grid>
      <Grid item><Footer/></Grid>
    </Grid>
  )
}
