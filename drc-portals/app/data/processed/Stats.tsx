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
        { label: 'Compounds' },
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
  const results = await safeAsync(() => kvCache('stats', async () => {
    const stats = await Promise.all([
      prisma.geneEntity.count().then(count => ({ label: 'Genes', count })),
      prisma.geneSetNode.count().then(count => ({ label: 'Gene sets', count })),
      prisma.entityNode.count({ where: { type: 'Compound' } }).then(count => ({ label: 'Compounds', count })),
      prisma.c2M2FileNode.count().then(count => ({ label: 'Files', count })),
      prisma.kGAssertion.count().then(count => ({ label: 'Assertions', count })),
    ])
    stats.sort((a, b) => b.count - a.count)
    return stats
  }, process.env.NODE_ENV === 'development' ? 60*1000 : 24*60*60*1000))
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
