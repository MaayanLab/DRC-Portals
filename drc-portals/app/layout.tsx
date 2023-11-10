import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NextAuthProvider from '@/lib/auth/client'
import ThemeRegistry from './ThemeRegistry'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NIH-CFDE DRC Portal',
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;600;400" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600" rel="stylesheet"/>
      </head>
      <body className={inter.className}>
        <ThemeRegistry options={{ key: 'mui' }}>
          <NextAuthProvider>
            
              {children}
          </NextAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
