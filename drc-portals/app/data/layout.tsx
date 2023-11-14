import Grid  from '@mui/material/Grid'
import Container  from '@mui/material/Container'
import Header  from '@/components/Header/data'
import Footer  from '@/components/Footer/data'



export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Grid container direction={"column"} spacing={2} justifyContent="space-between" sx={{minHeight: "100vh"}}>
      <Grid item><Header/></Grid>
      <Grid item className="grow"><Container maxWidth="lg">{children}</Container></Grid>
      <Grid item><Footer/></Grid>
    </Grid>
  )
}
