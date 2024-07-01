import prisma from "@/lib/prisma";
import { Grid, Typography } from "@mui/material";
import { safeAsync } from '@/utils/safe'
import kvCache from "@/lib/prisma/kvcache";

export function StatsFallback() {
  return (
    <>
      {[
        { label: 'KG Assertions' },
        { label: 'Files' },
        { label: 'Drugs' },
        { label: 'Genes' },
        { label: 'Gene Sets' },
      ].map(({ label }) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key="kg">
          <div  className="flex flex-col">
            <Typography variant="h2" color="secondary">...</Typography>
            <Typography variant="subtitle1" color="secondary">{label.toUpperCase()}</Typography>
          </div>
        </Grid>
      ))}
    </>
  )
}
export default async function Stats() {
  const results = await safeAsync(() => kvCache('stats', () => prisma.$queryRaw<Array<{
    label: string,
    count: number,
  }>>`
    with labeled_count as (
      select 'Genes' as label, (select count(*) from gene_entity) as count
      union
      select 'Gene sets' as label, (select count(*) from gene_set_node) as count
      union
      select 'Drugs' as label, (select count(*) from entity_node where type = 'Drug') as count
      union
      select 'Files' as label, (select count(*) from c2m2_file_node) as count
      union
      select 'Assertions' as label, (select count(*) from kg_assertion) as count
    )
    select label, count
    from labeled_count
    order by count desc;
  `, process.env.NODE_ENV === 'development' ? 60*1000 : 24*60*60*1000))
  if ('error' in results) return <StatsFallback />
  return (
    <>
      {results.data.map(({ label, count }) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key="kg">
          <div  className="flex flex-col">
            <Typography variant="h2" color="secondary">{BigInt(count).toLocaleString()}</Typography>
            <Typography variant="subtitle1" color="secondary">{label.toUpperCase()}</Typography>
          </div>
        </Grid>
      ))}
    </>
  )
}
