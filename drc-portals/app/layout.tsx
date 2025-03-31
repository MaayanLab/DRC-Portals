import type { Metadata } from 'next'
import NextAuthProvider from '@/lib/auth/client'
import ThemeRegistry from './ThemeRegistry'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Grid } from '@mui/material'
import AppProgressProvider from '@/utils/progressbar'
import AdministrationDirectives from '@/components/misc/AdministrationDirectives'

export const metadata: Metadata = {
  title: 'CFDE Data Portal',
  description: '',
  icons: {
    icon: '/img/favicon.png', // /public path
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProgressProvider>
          <ThemeRegistry options={{ key: 'mui' }}>
            <NextAuthProvider>
              <Grid container justifyContent={'space-between'} direction={"column"} sx={{minHeight: "100vh", marginTop: 2}}>
                {/* <Grid item><Header/></Grid> */}
                {children}
              </Grid>
              <AdministrationDirectives />
            </NextAuthProvider>
          </ThemeRegistry>
        </AppProgressProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  )
}
