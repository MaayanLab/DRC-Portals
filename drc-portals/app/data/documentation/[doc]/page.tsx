import { Grid, Toolbar } from "@mui/material";
import ScrollToTop from "@/components/misc/ScrollToTop";
import { H2Renderer, H3Renderer, LinkRenderer } from '@/components/misc/ReactMarkdownRenderers'
import FAIRshake from '../markdown/FAIRshake.mdx'
import OpenAPI from '../markdown/OpenAPI.mdx'
import PWBMetanodes from '../markdown/PWBMetanodes.mdx'
import KGAssertions from '../markdown/KGAssertions.mdx'

import { notFound } from "next/navigation";

const pageMap : { [ key: string ] : Function } = {
  FAIRshake,
  OpenAPI,
  PWBMetanodes,
  KGAssertions,
}

export default async function StandardsPage(
  props : { params: Promise<{ doc: string }> }
) {
  const params = await props.params
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