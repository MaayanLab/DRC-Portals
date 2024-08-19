import Typography from '@mui/material/Typography';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import NewsClient from './NewsClient';
import NewsComponent from '@/components/misc/News/NewsComponent';

export interface queryJson {
  order?: {
    field: Prisma.NewsScalarFieldEnum,
    ordering: 'asc' | 'desc'
  },
  where?: Prisma.NewsWhereInput,
  take?: number,
  skip?: number,
}

export default async function News({
  searchParams,
}: {
  searchParams?: {
    q?: string
  }
}) {
  const q: queryJson = JSON.parse((searchParams || {}).q || '{}');
  const { where, order = [{ field: "date", ordering: "desc" }, { field: "version", ordering: "desc" }], take = 25, skip } = q;
  const count = await prisma.news.count({
    where,
  });

  const orderBy = Array.isArray(order)
  ? order.map(({ field, ordering }) => ({ [field]: ordering }))
  : [{ [order.field]: order.ordering }];

const news = await prisma.news.findMany({
  where,
  orderBy,
  take,
  skip: skip || 0,
});

  return (
    <div>
      <Typography variant="h2" color="secondary">What's new on the CFDE Workbench?</Typography>
      <div className="my-3">
        <Typography variant="subtitle1" color="secondary">
          The latest updates of content added to the CFDE Workbench.
        </Typography>
      </div>
      <NewsClient count={count} q={q}>
        <NewsComponent news={news} />
      </NewsClient>
    </div>
  );
}
