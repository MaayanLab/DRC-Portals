import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import NextAuthProvider from '@/lib/auth/client'
import ThemeRegistry from './ThemeRegistry'
import './globals.css'
import { Typography } from '@mui/material'
import { mdiGithub, mdiBugOutline} from '@mdi/js';

const Icon = dynamic(()=>import('@mdi/react'))
const Grid = dynamic(()=>import('@mui/material/Grid'))
const Paper = dynamic(()=>import('@mui/material/Paper'))
const Container = dynamic(()=>import('@mui/material/Container'))
const Stack = dynamic(()=>import('@mui/material/Stack'))
const Header = dynamic(()=>import('../components/Header/info'))
const Footer = dynamic(()=>import('../components/Footer/info'))

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NIH-CFDE DRC Portal',
  description: '',
  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://s3.amazonaws.com/maayan-kg/cfde-kg/assets/favicon.png"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;600;400" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600" rel="stylesheet"/>
      </head>
      <body className={inter.className}>
        <ThemeRegistry options={{ key: 'mui' }}>
          <NextAuthProvider>
            
              <Grid container justifyContent={'space-between'} direction={"column"} spacing={2}>
                <Grid item><Header/></Grid>
                <Grid item><Container maxWidth="lg">{children}</Container></Grid>
                <Grid item><Footer/></Grid>
              </Grid>
          </NextAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
