import type { Metadata } from 'next'
import NextAuthProvider from '@/lib/auth/client'
import TrpcProvider from '@/lib/trpc/provider'
import ThemeRegistry from './ThemeRegistry'
import './globals.css'



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
        <ThemeRegistry options={{ key: 'mui' }}>
          <NextAuthProvider>
            <TrpcProvider>
              {children}
            </TrpcProvider>
          </NextAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
