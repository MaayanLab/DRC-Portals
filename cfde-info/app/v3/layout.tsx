import type { Metadata } from 'next'
import {  ThemeProvider, Box, CssBaseline} from '@mui/material'
import Footer from './footer'
import theme from './theme'
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



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{marginLeft: 0, marginRight: 0}}>
        <ThemeProvider theme={theme}>
			<CssBaseline />
			<Box sx={{
				maxWidth: "1440px",
				width: "100%",
				margin: "0px auto",
				containerType: "inline-size",
				overflow: "hidden"
			}}>
			{children}
			</Box>
			<SpeedDialButton/>
			<Footer />
		</ThemeProvider>
      
      </body>
    </html>
  )
}
