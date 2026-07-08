import type { Metadata } from 'next'
import NextAuthProvider from '@/lib/auth/client'
import ThemeRegistry from './ThemeRegistry'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Grid } from '@mui/material'
import AppProgressProvider from '@/utils/progressbar'
import AdministrationDirectives from '@/components/misc/AdministrationDirectives'
import TrpcProvider from '@/lib/trpc/provider'
import Header from '@/components/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NavBreadcrumbs from '@/components/Header/breadcrumbs'
import Footer  from '@/components/Footer/info'
import Background from '@/components/styled/background'
import { WithContext, WebSite } from 'schema-dts'
import Head from 'next/head'
import SearchParamSearchField from './data/processed/SearchParamSearchField'

import SpeedDialButton from './speed_dial'
export const metadata: Metadata = {
  title: 'CFDE Workbench',
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

const jsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": 'https://cfde.cloud/data',
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": 'https://cfde.cloud/data/processed/search/{query}',
      "query": "required"
    }
  ]
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body>
        <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      
        <AppProgressProvider>
        <ThemeRegistry options={{ key: 'mui' }}>
        <NextAuthProvider>
        <TrpcProvider>
          <Header session={session}/>
          <Grid container justifyContent={'space-between'} direction={"column"} sx={{ minWidth: '400px', maxWidth: '100vw', minHeight: "100vh", overflow: 'hidden' }}>
            {/* <Grid item sx={{paddingTop: 2, background: "#fff"}}></Grid> */}
            <>
                  {/* <Grid item><Header path={"/data"}/></Grid> */}
                  
                  <Grid item container className="grow overflow-hidden">
                    <Background background="#E7F3F5">
                        <div className='flex items-center'>
                          <div className='flex flex-grow'><NavBreadcrumbs /></div>
                          <SearchParamSearchField />
                        </div>
                      {children}
                    </Background>
                  </Grid>
                  <Grid item><Footer/></Grid>
                </>
            <SpeedDialButton/>
          </Grid>
        </TrpcProvider>
        <AdministrationDirectives style={{ minWidth: '400px', maxWidth: '100vw' }} />
        </NextAuthProvider>
        </ThemeRegistry>
        </AppProgressProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  )
}
