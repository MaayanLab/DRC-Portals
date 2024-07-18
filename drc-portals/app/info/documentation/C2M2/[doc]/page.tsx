import { Grid } from "@mui/material";
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm"
import { fetchC2m2Markdown } from "@/components/misc/ExternalC2m2";
import {  LinkRenderer } from '@/components/misc/ReactMarkdownRenderers'

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
    let markdown = await fetchC2m2Markdown(suffix)
    markdown = markdown
      .replaceAll('https://docs.nih-cfde.org/en/latest/c2m2', 'https://github.com/nih-cfde/c2m2/blob/master')
      .replaceAll('./C2M2-Table-Summary', './#c2m2-tables')
      .replaceAll('osf.io/vzgx9', 'osf.io/3sra4')
      .replaceAll('./submission-prep-script', './#submission-prep-script')
    const title = suffix.includes('-') ? 
      `# ${suffix.split("-")[1].split(".md")[0]}\n\n` : `# ${suffix.split(".md")[0].replaceAll("-"," ")}\n\n`
    const source = '*Sourced from the [CFDE-CC Documentation Wiki]'
      + '(https://github.com/nih-cfde/published-documentation/wiki/' 
      + params.doc + ')*\n\n'
    return (
      <Grid container sx={{ml:3, mt:3}}>
        <Grid item sx={{mb:5}}>
          <br/>
          <ReactMarkdown 
            skipHtml
            remarkPlugins={[remarkGfm]}
            components={{ 
              a: LinkRenderer
          }} className="prose">
            {''.concat(
              title,
              source,
              markdown,
              '\n#### Return to [C2M2 Documentation](./)' 
            )}
          </ReactMarkdown>
        </Grid>
      </Grid>
    )
}