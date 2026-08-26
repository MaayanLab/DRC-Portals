import type { Metadata } from 'next'
import ThemeRegistry from './ThemeRegistry'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { AppBar, Container, Grid, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import Background from './background'
import { UMAP } from './umap'
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
              <Grid size={{xs: 12, md: 6}}>
                <Typography variant="body1" sx={{ textAlign: "justify"}}>
                  The Common Fund generates a diverse array of valuable data sets and knowledge resources intended for the research community. However, these resources are dispersed across multiple locations, making it challenging to navigate and utilize them efficiently. To address this, the Common Fund Data Ecosystem (CFDE) was established to facilitate the broad use of Common Fund data to drive discovery. The CFDE is structured around five centers that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease.
                </Typography>
              </Grid>
              <Grid size={{xs: 12, md: 6}}>
                <UMAP/>
                {/* <Image width={450} height={450} alt="cfde-logo" src={'/img/umap-bground.png'} /> */}
              </Grid>
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
