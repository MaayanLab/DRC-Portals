import Grid  from '@mui/material/Grid'
import Container  from '@mui/material/Container'
import Header  from '@/components/Header/data'
import Footer  from '@/components/Footer/data'
import { Metadata } from 'next'
import Background from '@/components/styled/background'
import NavBreadcrumbs from '@/components/Header/breadcrumbs'

export const metadata: Metadata = {
  title: 'CFDE Data Portal',
  description: 'Search Common Fund program metadata and processed datasets',
  keywords: [
    'bioinformatics',
    'c2m2',
    'cell line',
    'cfde',
    'common fund data ecosystem',
    'common fund',
    'data ecosystem',
    'data',
    'disease',
    'drug',
    'gene set',
    'gene',
    'glycan',
    'knowledge',
    'nih common fund',
    'peturbation',
    'phenotype',
    'protein',
    'standard',
    'target',
    'tissue',
    'workbench',
  ].join(', ')
}

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Grid container direction={"column"} justifyContent="space-between" sx={{minHeight: "100vh", marginTop: 2}}>
      <Grid item><Header/></Grid>
      <Grid item className="flex grow">
        <Background background="#E7F3F5">
          <NavBreadcrumbs/>
          {children}
        </Background>
      </Grid>
      <Grid item><Footer/></Grid>
    </Grid>
  )
}
