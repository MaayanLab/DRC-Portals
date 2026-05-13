import type { Metadata } from 'next'
import NextAuthProvider from '@/lib/auth/client'
import ThemeRegistry from './ThemeRegistry'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Fab, Grid, Tooltip } from '@mui/material'
import AppProgressProvider from '@/utils/progressbar'
import AdministrationDirectives from '@/components/misc/AdministrationDirectives'
import TrpcProvider from '@/lib/trpc/provider'
import Header from '@/components/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NavBreadcrumbs from '@/components/Header/breadcrumbs'
import CFDEWheel from 'cfde-wheel'
import Icon from '@mdi/react'
import { mdiRobot } from '@mdi/js'
import Footer  from '@/components/Footer/info'
import Background from '@/components/styled/background'

export const metadata: Metadata = {
  title: 'CFDE Data Portal',
  description: '',
  icons: {
    icon: '/img/favicon.png', // /public path
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body>
        <AppProgressProvider>
        <ThemeRegistry options={{ key: 'mui' }}>
        <NextAuthProvider>
        <TrpcProvider>
          <Header session={session}/>
          <Grid container justifyContent={'space-between'} direction={"column"} sx={{ minWidth: '400px', maxWidth: '100vw', minHeight: "100vh", overflow: 'hidden' }}>
            {/* <Grid item sx={{paddingTop: 2, background: "#fff"}}></Grid> */}
            <>
                  {/* <Grid item><Header path={"/data"}/></Grid> */}
                  
                  <Grid item container className="grow overflow-hidden">
                    <Background background="#E7F3F5">
                      <NavBreadcrumbs/>
                      {children}
                    </Background>
                  </Grid>
                  <Grid item><Footer/></Grid>
                </>
            <Tooltip title="Open CFDE Workbench Chatbot">
              <Fab href='/data/chat' sx={{
                position: 'fixed',
                bottom: 130,
                right: 50,
                height: 70,
                width: 70,
                backgroundColor: '#FFF',
                padding: 0
              }}><Icon path={mdiRobot} size={2} /></Fab>
            </Tooltip>
            <Tooltip title="Open CFDE Wheel">
              <Fab href='/data/chat' sx={{
                position: 'fixed',
                bottom: 50,
                right: 50,
                height: 70,
                width: 70,
                padding: 0
              }}>
              <CFDEWheel/>
              </Fab>
            </Tooltip>
          </Grid>
        </TrpcProvider>
        <AdministrationDirectives style={{ minWidth: '400px', maxWidth: '100vw' }} />
        </NextAuthProvider>
        </ThemeRegistry>
        </AppProgressProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  )
}
