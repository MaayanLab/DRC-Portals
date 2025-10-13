import { Grid, Toolbar } from "@mui/material";
import ScrollToTop from "@/components/misc/ScrollToTop";
import GQI from '../markdown/GQI.mdx';
import { H2Renderer, LinkRenderer } from "@/components/misc/ReactMarkdownRenderers";
import React from "react";

export default function C2M2Page() {
  const props = {
    components: {
      a: LinkRenderer,
      h2: H2Renderer
    }
  }
  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item sx={{mb:5}}>
        <Toolbar variant="dense" disableGutters sx={{ minHeight:20, height:20 }} id="back-to-top-anchor" />
        {GQI(props)}
        <ScrollToTop />
      </Grid>
    </Grid>
  )
}