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
  keywords: [ // TODO: some of these keywords probably should just come in at a lower level for more specific pages
    'big data',
    'bioinformatics',
    'bone',
    'c2m2',
    'cancer',
    'cell line',
    'cfde',
    'common fund data ecosystem',
    'common fund',
    'data ecosystem',
    'data portal',
    'data',
    'dataset',
    'diabetes',
    'disease',
    'drug discovery',
    'drug',
    'enrichment analysis',
    'gene set library',
    'gene set',
    'gene',
    'genomics',
    'glycan',
    'heart',
    'kidney',
    'knowledge',
    'liver',
    'machine learning',
    'metabolomics',
    'motifs',
    'neurons',
    'nih common fund',
    'peturbation',
    'pharmacology',
    'phenotype',
    'protein',
    'proteomics',
    'RNA-seq',
    'RNAseq',
    'scRNA-seq',
    'single cell',
    'skin',
    'standard',
    'systems biology',
    'target discovery',
    'target',
    'therapeutics',
    'tissue',
    'transcriptomics',
    'variants',
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
