import prisma from "@/lib/prisma";
import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import Image from "next/image";
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { format_description, type_to_string } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
import { NodeType, Prisma } from "@prisma/client";

const pageSize = 10

export default async function Page(props: { searchParams: Record<string, string> }) {
  const searchParams = z.object({
    q: z.union([
      z.array(z.string()).transform(qs => qs.join(' ')),
      z.string(),
      z.undefined(),
    ]),
    p: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length-1]),
      z.string().transform(p => +p),
      z.undefined().transform(_ => 1),
    ]),
    t: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split(',') : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(t => {
      const [type, entity_type] = t.split(':')
      return { type, entity_type: entity_type ? entity_type : null }
    }) : undefined),
  }).parse(props.searchParams)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    items: {id: string, type: NodeType, entity_type: string | null, label: string, description: string, dcc: { short_label: string, icon: string, label: string } | null}[],
    count: number,
    type_counts: {type: NodeType, entity_type: string | null, count: number}[],
  }>>`
    with results as (
      select
        "node".*,
        "entity_node"."type" as "entity_type",
        ts_rank_cd("node"."searchable", to_tsquery('english', ${searchParams.q})) as "rank"
      from "node"
      left join "entity_node" on "entity_node"."id" = "node"."id"
      where "node"."searchable" @@ to_tsquery('english', ${searchParams.q})
    ), items as (
      select id, type, entity_type, label, description, (
        select jsonb_build_object(
          'short_label', "dccs".short_label,
          'icon', "dccs".icon,
          'label', "dccs".label
        )
        from "dccs"
        where "dccs".id = "dcc_id"
      ) as dcc
      from "results"
      ${searchParams.t ? Prisma.sql`
      where
        ${Prisma.join(searchParams.t.map(t => Prisma.sql`
        (
          "results"."type" = ${t.type}::"NodeType"
          ${t.entity_type ? Prisma.sql`
            and "results"."entity_type" = ${t.entity_type}
          ` : Prisma.empty}
        )
        `), ' or ')}
      ` : Prisma.empty}
      order by "results"."rank"
      offset ${offset}
      limit ${limit}
    ), total_count as (
      select count(*)::int as count
      from "results"
      ${searchParams.t ? Prisma.sql`
      where
        ${Prisma.join(searchParams.t.map(t => Prisma.sql`
        (
          "results"."type" = ${t.type}::"NodeType"
          ${t.entity_type ? Prisma.sql`
            and "results"."entity_type" = ${t.entity_type}
          ` : Prisma.empty}
        )
        `), ' or ')}
      ` : Prisma.empty}
    ), type_counts as (
      select "type", "entity_type", count(*)::int as count
      from "results"
      group by "type", "entity_type"
      order by count(*) desc
    )
    select 
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from total_count) as count,
      (select coalesce(jsonb_agg(type_counts.*), '[]'::jsonb) from type_counts) as type_counts
    ;
  ` : [undefined]
  const ps = Math.floor((results?.count ?? 1) / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <SearchField q={searchParams.q ?? ''} />
      {results?.items ?
        <Container className="mt-10 justify-content-center">
          <Box className="p-5 text-center">
          <Typography variant="h3">Results</Typography>
          <Typography variant="subtitle1">(found {results.count.toLocaleString()} matches)</Typography>
          </Box>
          <Box className="flex flex-row gap-4 justify-stretch">
            <Box className="flex flex-col w-48">
              {results.type_counts.filter(({ entity_type }) => !entity_type).map((type_count) =>
                <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} type={type_count.type} entity_type={type_count.entity_type} count={type_count.count} />
              )}
              <hr className="m-2" />
              {results.type_counts.filter(({ entity_type }) => !!entity_type).map((type_count) =>
                <SearchFilter key={`${type_count.type}-${type_count.entity_type}`} type={type_count.type} entity_type={type_count.entity_type} count={type_count.count} />
              )}
            </Box>
            <Box className="flex flex-col items-center">
              {results.items.length === 0 ? <>No results</> : (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell component="th" className="w-20">
                          &nbsp;
                        </TableCell>
                        <TableCell component="th">
                          <Typography variant='h3'>Label</Typography>
                        </TableCell>
                        <TableCell component="th">
                          <Typography variant='h3'>Description</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.items.map(item => (
                          <TableRow
                              key={item.id}
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                              <TableCell className="w-4 relative">
                                {item.dcc?.icon ? <Link href={`/data/matrix/${item.dcc.short_label}`}><Image className="p-2 object-contain" src={item.dcc.icon} alt={item.dcc.label} fill /></Link>
                                  : item.type === 'entity' ? 
                                    item.entity_type === 'gene' ? <Link href={`/data/processed/${item.type}`}><Image className="p-2 object-contain" src={GeneIcon} alt="Gene" fill /></Link>
                                    : item.entity_type === 'Drug' ? <Link href={`/data/processed/${item.type}`}><Image className="p-2 object-contain" src={DrugIcon} alt="Drug" fill /></Link>
                                    : null
                                  : null}
                              </TableCell>
                              <TableCell component="th" scope="row">
                                <Link href={`/data/processed/${item.type}${item.entity_type ? `/${item.entity_type}` : ''}/${item.id}`}>
                                  <Typography variant='h6'>{item.label}</Typography>
                                </Link>
                                <Link href={`/data/processed/${item.type}${item.entity_type ? `/${item.entity_type}` : ''}`}>
                                  <Typography variant='caption'>{type_to_string(item.type, item.entity_type)}</Typography>
                                </Link>
                              </TableCell>
                              <TableCell>{format_description(item.description)}</TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <FormPagination p={searchParams.p} ps={ps} />
            </Box>
          </Box>
        </Container>
        : null}
    </Container>
  )
}
