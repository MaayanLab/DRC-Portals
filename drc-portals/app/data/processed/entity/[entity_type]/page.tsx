import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import { NodeType, Prisma } from "@prisma/client";

const pageSize = 10

export default async function Page(props: { params: { entity_type: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = await prisma.$queryRaw<Array<{
    items: {
      id: string,
      type: string,
      node: {
        type: NodeType,
        label: string,
        description: string,
      },
    }[]
    count: number,
  }>>`
    with items as (
      select
        "entity_node"."id",
        "entity_node"."type",
        jsonb_build_object(
          'type', node."type",
          'label', node."label",
          'description', node."description"
        ) as node
      from "entity_node"
      inner join "node" on "node"."id" = "entity_node"."id"
      where "entity_node"."type" = ${props.params.entity_type}
      ${searchParams.q ? Prisma.sql`
        and "node"."searchable" @@ websearch_to_tsquery('english', ${searchParams.q})
        order by ts_rank_cd("node"."searchable", websearch_to_tsquery('english', ${searchParams.q})) desc
      ` : Prisma.sql`
        order by "entity_node"."id"
      `}
    ), paginated_items as (
      select *
      from items
      offset ${offset}
      limit ${limit}
    )
    select
      (select coalesce(jsonb_agg(paginated_items.*), '[]') from paginated_items) as items,
      ${searchParams.q ? Prisma.sql`
        (select count(items.id)::int from items) as count
      ` : Prisma.sql`
        (select count("entity_node".id)::int from "entity_node" where "entity_node"."type" = ${props.params.entity_type}) as count
      `}
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
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/${item.node.type}/${item.type}/${item.id}`}>
                        <Typography variant='h6'>{item.node.label}</Typography>
                      </Link>
                      <Typography variant='caption'>
                        <Link href={`/data/processed/${item.node.type}/${item.type}`}>
                          {type_to_string(item.node.type, item.type)}
                        </Link>
                      </Typography>
                    </TableCell>
                    <TableCell>{format_description(item.node.description)}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
