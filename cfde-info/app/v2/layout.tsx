import type { Metadata } from 'next'
import ThemeRegistry from '../v1/ThemeRegistry'
import { GoogleAnalytics } from '@next/third-parties/google'
import '../v1/globals.css'
import { AppBar, Container, Grid, Stack, Typography } from '@mui/material'
// import Link from 'next/link'
// import Image from 'next/image'
// import Background from './background'
// import { UMAP } from './umap'
import { Suspense } from 'react'
export const metadata: Metadata = {
  title: 'CFDE Information Portal',
  description: 'Information Portal for Common Fund Data Ecosystem',
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


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense>
        <ThemeRegistry options={{ key: 'mui' }}>
          <Container maxWidth={"lg"} sx={{pb: 2}}>
            <Grid container spacing={2} sx={{alignItems: "flex-start", justifyContent: "center"}}>
              
              <Grid size={12}>{children}</Grid>
            </Grid>
            
          </Container>
        </ThemeRegistry>
        </Suspense>      
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  )
}
