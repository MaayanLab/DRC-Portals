import { Grid, Toolbar, Fab } from "@mui/material";
import ScrollToTop from "@/components/misc/ScrollToTop";
import C2M2 from '@/components/markdown/C2M2.mdx';
import { H2Renderer, LinkRenderer } from "@/components/misc/ReactMarkdownRenderers";
import { KeyboardArrowUp } from "@mui/icons-material";
import React from "react";

export default function C2M2Page(props: {children: any}) {
  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item sx={{mb:5}}>
        <Toolbar variant="dense" disableGutters sx={{ minHeight:20, height:20 }} id="back-to-top-anchor" />
        <C2M2 components={{
          a: LinkRenderer,
          h2: H2Renderer
        }}/>
        <ScrollToTop />
      </Grid>
    </Grid>
  )
}