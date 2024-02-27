import { Grid, Typography } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import { LinkRenderer, HeadingRenderer } from '@/components/misc/ReactMarkdownRenderers'
import path from 'path'
import { readFileSync } from 'fs'

const title_map: { [ key: string ]: string }= {
  'OpenAPI': 'OpenAPI and SmartAPI',
  'PWBMetanodes': 'Playbook Partnership Workflow Builder',
  'KGAssertions': 'Data Distillery Knowledge Graph Assertions'
}

export default function StandardsPage(
  { params } : { params: { doc: string } }
) {
  const markdown = readFileSync(
    path.resolve('app/info/standards/markdown', './doc.md'.replace('doc', params.doc)), 
    {encoding:'utf8', flag:'r'}
  )
  var title = (params.doc in title_map) ? title_map[params.doc] : params.doc
  return (
    <Grid container sx={{ml:3, mt:3}}>
      <Grid item xs={12}>
        <Typography variant="h1" color="secondary.dark">{title}</Typography>
      </Grid>
      <Grid item sx={{mb:5}}>
        <br/>
        <ReactMarkdown 
          components={{ 
            a: LinkRenderer,
            h2: HeadingRenderer,
            h3: HeadingRenderer
        }} className="prose">
          {markdown}
        </ReactMarkdown>
      </Grid>
    </Grid>
  )
}