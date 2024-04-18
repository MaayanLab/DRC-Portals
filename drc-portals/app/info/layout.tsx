import Grid  from '@mui/material/Grid'
import Header  from '@/components/Header'
import Footer  from '@/components/Footer/info'
import { Metadata } from 'next'
import Background from '@/components/styled/background'
import NavBreadcrumbs from '@/components/Header/breadcrumbs'
export const metadata: Metadata = {
  title: 'CFDE Information Portal',
}

const nav = [
	{title: "Home", href: "/info"},
	{title: "CF Programs", href: "/info/dcc"},
	{title: "Partnerships", href: "/info/partnerships"},
	{title: "Training & Outreach", href: "/info/outreach"},
	{title: "Publications", href: "/info/publications"},
	{title: "Documentation", href: "/info/documentation"},
	// {title: "About", href: "/info/coming_soon"},
]
export default function InfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Grid item><Header type='info' nav={nav}/></Grid>
      <Grid item className="flex grow">
        <Background>
          <NavBreadcrumbs/>
          {children}
        </Background>
      </Grid>
      <Grid item><Footer/></Grid>
    </>
  )
}
