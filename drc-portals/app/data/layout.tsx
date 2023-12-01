import Grid  from '@mui/material/Grid'
import Container  from '@mui/material/Container'
import Header  from '@/components/Header/data'
import Footer  from '@/components/Footer/data'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CFDE Data Portal',
}

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Grid container direction={"column"} justifyContent="space-between" sx={{minHeight: "100vh", marginTop: 2}}>
      <Grid item><Header/></Grid>
      <Grid item className="grow"><Container maxWidth="lg">{children}</Container></Grid>
      <Grid item><Footer/></Grid>
    </Grid>
  )
}
