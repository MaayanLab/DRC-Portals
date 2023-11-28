import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image";
import { format_description } from "@/app/data/processed/utils";
import { Prisma } from "@prisma/client";

const pageSize = 10

export default async function Page(props: { searchParams: Record<string, string | string[] | undefined> }) {
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
  }).parse(props.searchParams)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = await prisma.$queryRaw<Array<{
    items: {
      id: string,
      data_type: string,
      assay_type: string,
      identity: {
        type: string,
        label: string,
        description: string,
      },
      dcc: {
        short_label: string,
        icon: string,
      } | null,
    }[]
    count: number,
  }>>`
    with results as (
      select *
      from "c2m2file"
      inner join "xidentity" on "c2m2file"."id" = "xidentity"."c2m2file_id"
      ${searchParams.q ? Prisma.sql`
        where to_tsvector('english', "xidentity"."searchable") @@ to_tsquery('english', ${searchParams.q})
        order by ts_rank_cd(to_tsvector('english', "xidentity"."searchable"), to_tsquery('english', ${searchParams.q})) desc
      ` : Prisma.sql`
        order by "c2m2file"."id"
      `}
    ), items as (
      select
        results."c2m2file_id" as id,
        results."data_type",
        results."assay_type",
        jsonb_build_object(
          'type', results."type",
          'label', results."label",
          'description', results."description"
        ) as identity,
        (
          select jsonb_build_object(
            'short_label', short_label,
            'icon', icon
          )
          from "c2m2datapackage"
          inner join "dcc_assets" on "c2m2datapackage"."dcc_asset_link" = "dcc_assets"."link"
          inner join "dccs" on "dcc_assets"."dcc_id" = "dccs"."id"
          where results."datapackage_id" = "c2m2datapackage"."id"
        ) as dcc
      from results
      offset ${offset}
      limit ${limit}
    ), total_count as (
      select count("c2m2file_id")::int as count
      from results
    )
    select 
      (select coalesce(jsonb_agg(items.*), '[]'::jsonb) from items) as items,
      (select count from total_count) as count
    ;
  `
  const ps = Math.floor(results.count / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <SearchField q={searchParams.q ?? ''} />
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell component="th">
                <Typography variant='h3'>Source</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Label</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Description</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Data Type</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Assay Type</Typography>
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
                      {item.dcc?.icon ?
                        <Link href={`/data/matrix/${item.dcc.short_label}`}>
                          <Image className="p-2 object-contain" src={item.dcc.icon} alt={item.dcc.short_label ?? ''} fill />
                        </Link>
                        : null}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/${item.identity.type}/${item.id}`}>
                        <Typography variant='h6'>{item.identity.label}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{format_description(item.identity.description)}</TableCell>
                    <TableCell>{item.data_type}</TableCell>
                    <TableCell>{item.assay_type}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
