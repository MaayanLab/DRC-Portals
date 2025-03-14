import Grid  from '@mui/material/Grid'
import Header  from '@/components/Header'
import Footer  from '@/components/Footer/info'
import {Fab} from '@mui/material'
import { Metadata } from 'next'
import Background from '@/components/styled/background'
import InteractiveNav from '@/components/InteractiveNav'
// import NavBreadcrumbs from '@/components/Header/breadcrumbs'
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
      <Grid item><Header path="/info"/></Grid>
      <Grid item className="flex grow">
        <Background background='#EDF0F8'>
          {/* <NavBreadcrumbs/> */}
          {children}
        </Background>
      </Grid>
      <Grid item>
          <InteractiveNav fab={true}/>
      </Grid>
      <Grid item><Footer/></Grid>
    </>
  )
}
