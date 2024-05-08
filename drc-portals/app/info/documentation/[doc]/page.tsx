import { Grid, Toolbar } from "@mui/material";
import ScrollToTop from "@/components/misc/ScrollToTop";
import { H2Renderer, H3Renderer, LinkRenderer } from '@/components/misc/ReactMarkdownRenderers'
import dynamic from 'next/dynamic'
import { notFound } from "next/navigation";

const pageMap : { [ key: string ] : Function } = {
  'FAIRshake': dynamic(() => import('./FAIRshake.mdx')),
  'OpenAPI': dynamic(() => import('./OpenAPI.mdx')),
  'PWBMetanodes': dynamic(() => import('./PWBMetanodes.mdx')),
  'KGAssertions': dynamic(() => import('./KGAssertions.mdx'))
}

export default function StandardsPage(
  { params } : { params: { doc: string } }
) {
  if (params.doc in pageMap) {
    const props = {
      components: {
        a: LinkRenderer,
        h2: H2Renderer,
        h3: H3Renderer
      }
    }
    return (
      <Grid container sx={{ml:3, mt:3}}>
        <Grid item sx={{mb:5}}>
          <Toolbar 
            variant="dense" 
            disableGutters 
            sx={{ minHeight:20, height:20 }} 
            id="back-to-top-anchor" />
          {pageMap[params.doc](props)}
        <ScrollToTop />
        </Grid>
      </Grid>
    )
  } else {
    return (
      notFound()
    )
  }
}