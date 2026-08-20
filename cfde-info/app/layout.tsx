import type { Metadata } from 'next'
import ThemeRegistry from './ThemeRegistry'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { AppBar, Container, Grid, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'
import Background from './background'

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
        <ThemeRegistry options={{ key: 'mui' }}>
          <Background background='black'>
          <AppBar position="static" sx={{paddingLeft: 1, pt: 10, pb: 5, background: "transparent"}}>
            <Stack sx={{justifyContent: "center", alignItems: "center"}}>
              {/* <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                <Image style={{filter: "brightness(0) invert()"}} width={200} height={50} alt="cfde-logo" src={'/img/cfde-noglow.png'} />
                <Typography variant='caption' sx={{color: "oklch(85% .16 195)", fontSize: 20}}>NIH Common Fund</Typography>
                <Typography variant="h1" sx={{color: "oklch(85% .16 195)"}}>The Common Fund Data Ecosystem (CFDE)</Typography>
              </Stack> */}
              {/* <Image style={{filter: "brightness(0.1) invert()"}} width={200} height={50} alt="cfde-logo" src={'/img/cfde-noglow.png'} /> */}
              <img src="/img/CFDE-glow.jpg" alt="logo" style={{height: 100, width:180}}/>
              <Typography variant="h1" sx={{textAlign: "center"}}>The Common Fund Data Ecosystem (CFDE)</Typography>
            </Stack>
            </AppBar>
          <Container maxWidth={"lg"} sx={{pb: 5}}>
            <Grid container spacing={2} sx={{alignItems: "flex-start", justifyContent: "center"}}>
              <Grid size={{xs: 12, md: 6}}>
                <Typography variant="body1" sx={{color: "#F9F6EE", textAlign: "justify"}}>
                  The Common Fund generates a diverse array of valuable data sets and knowledge resources intended for the research community. However, these resources are dispersed across multiple locations, making it challenging to navigate and utilize them efficiently. To address this, the Common Fund Data Ecosystem (CFDE) was established to facilitate the broad use of Common Fund data to drive discovery. The CFDE is structured around five centers that work collaboratively to integrate metadata, data, tools, and knowledge from participating Common Fund programs. These collective efforts enable researchers to generate hypotheses, make discoveries, and validate findings, leading to new insights into health and disease.
                </Typography>
              </Grid>
              <Grid size={{xs: 12, md: 6}}>
                <img src="/img/neon-glow.jpg" alt="logo" style={{height: 380, width:450}}/>
                {/* <Image width={450} height={450} alt="cfde-logo" src={'/img/umap-bground.png'} /> */}
              </Grid>
              <Grid size={12}>{children}</Grid>
            </Grid>
            
          </Container>
          </Background>
        </ThemeRegistry>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  )
}
