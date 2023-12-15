import Grid  from '@mui/material/Grid'
import Container  from '@mui/material/Container'
import Header  from '@/components/Header/info'
import Footer  from '@/components/Footer/info'



export default function InfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Grid container justifyContent={'space-between'} direction={"column"} sx={{minHeight: "100vh", marginTop: 2}}>
      <Grid item><Header/></Grid>
      <Grid item><Container maxWidth="lg">{children}</Container></Grid>
      <Grid item><Footer/></Grid>
    </Grid>
  )
}
