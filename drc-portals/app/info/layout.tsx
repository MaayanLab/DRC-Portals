import Grid  from '@mui/material/Grid'
import Header  from '@/components/Header'
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
    <>
      <Grid item><Header type='info'/></Grid>
      <Grid item className="flex grow">
        <Background>
          <NavBreadcrumbs/>
          {children}
        </Background>
      </Grid>
      <Grid item><Footer/></Grid>
    </>
  )
}
