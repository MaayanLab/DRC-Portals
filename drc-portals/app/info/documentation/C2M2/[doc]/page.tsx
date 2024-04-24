import { Grid } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm"
import { fetchC2m2Markdown, LinkRenderer, HeadingRenderer } from '@/components/misc/ReactMarkdownRenderers'

export default async function StandardsPage(
  { params } : { params: { doc: string } }
) {
    function fixProblematic ( page: string ) {
      const problematic = [
        '-subject_phenotype.tsv',
        '-phenotype_gene.tsv',
        '-phenotype_disease.tsv',
        '-phenotype.tsv',
        '-collection_phenotype.tsv',
        '-collection_disease.tsv',
        '-analysis_type.tsv'
      ]
      for (let pg of problematic) {
        if (page.endsWith(pg)) {
          return page.replace('TableInfo', 'Tableinfo').concat('.md')
        } 
      }
      return page.concat('.md')
    }

    const suffix = fixProblematic(params.doc)
    const markdown = await fetchC2m2Markdown(suffix)
    const title = '# ' + suffix.split('-')[1].split('.md')[0] + '\n\n'
    return (
      <Grid container sx={{ml:3, mt:3}}>
        <Grid item sx={{mb:5}}>
          <br/>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{ 
              a: LinkRenderer,
              h2: HeadingRenderer,
              h3: HeadingRenderer
          }} className="prose">
            {''.concat(
              title,
              markdown.replace('https://docs.nih-cfde.org/en/latest/c2m2/draft-C2M2_specification/', 'https://github.com/nih-cfde/c2m2/blob/master/draft-C2M2_specification/'),
              '\n#### Return to [C2M2 Documentation](./)' 
            )}
          </ReactMarkdown>
        </Grid>
      </Grid>
    )
}