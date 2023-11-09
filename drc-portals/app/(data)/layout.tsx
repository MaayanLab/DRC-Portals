import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIH-CFDE DRC Data Resource Portal',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
