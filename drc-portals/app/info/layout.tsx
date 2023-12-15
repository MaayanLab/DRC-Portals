import Grid  from '@mui/material/Grid'
import Container  from '@mui/material/Container'
import Header  from '@/components/Header/info'
import Footer  from '@/components/Footer/info'
import { Metadata } from 'next'

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
      <Grid item className="grow"><Container maxWidth="lg">{children}</Container></Grid>
      <Grid item><Footer/></Grid>
    </Grid>
  )
}
