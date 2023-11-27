import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { format_description, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils";
import Link from "next/link";
import Image from "next/image";
import SearchField from "../../SearchField";
import FormPagination from "../../FormPagination";
import { Prisma } from "@prisma/client";

const pageSize = 10

export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [results] = await prisma.$queryRaw<Array<{
    item: { node: { label: string, description: string } },
    assertions: {
      id: string,
      evidence: Prisma.JsonValue,
      source: { id: string, type: string, label: string },
      relation: { id: string, label: string },
      target: { id: string, type: string, label: string },
      dcc: { short_label: string, icon: string, label: string },
    }[],
    n_filtered_assertions: number,
    n_assertions: number,
  }>>`
    with item as (
      select
        "kg_relation_node"."id",
        jsonb_build_object(
          'label', "node"."label",
          'description', "node"."description"
        ) as node
      from "kg_relation_node"
      inner join "node" on "node"."id" = "kg_relation_node"."id"
      where "kg_relation_node"."id" = ${props.params.id}::uuid
    ), kg_assertion_f as (
      select *
      from "kg_assertion"
      where "kg_assertion"."relation_id" = ${props.params.id}::uuid
    ), kg_assertion_fs as (
      select *
      from kg_assertion_f
    ${searchParams.q ? Prisma.sql`
      where
      "kg_assertion_f"."source_id" in (select id from "node" where "node"."type" = 'entity' and "node"."searchable" @@ to_tsquery('english', ${searchParams.q}))
      or "kg_assertion_f"."target_id" in (select id from "node" where "node"."type" = 'entity' and "node"."searchable" @@ to_tsquery('english', ${searchParams.q}))
    ` : Prisma.empty}
    ), kg_assertion_fsp as (
      select
        kg_assertion_fs."id",
        kg_assertion_fs."evidence",
        (
          select jsonb_build_object(
            'id', "entity_node"."id",
            'type', "entity_node".type,
            'label', "node".label
          )
          from "entity_node"
          inner join "node" on "node"."id" = "entity_node"."id"
          where "entity_node".id = "kg_assertion_fs"."source_id"
        ) as source,
        (
          select jsonb_build_object(
            'id', "entity_node"."id",
            'type', "entity_node".type,
            'label', "node".label
          )
          from "entity_node"
          inner join "node" on "node"."id" = "entity_node"."id"
          where "entity_node".id = "kg_assertion_fs"."target_id"
        ) as target,
        (
          select jsonb_build_object(
            'short_label', "dccs".short_label,
            'icon', "dccs".icon,
            'label', "dccs".label
          )
          from "dccs"
          where "dccs".id = "kg_assertion_fs"."dcc_id"
        ) as dcc
      from kg_assertion_fs
      order by kg_assertion_fs."id"
      offset ${offset}
      limit ${limit}
    )
    select
      (select row_to_json(item.*) from item) as item,
      (select coalesce(jsonb_agg(kg_assertion_fsp.*), '[]'::jsonb) from kg_assertion_fsp) as assertions,
      (select coalesce(count(kg_assertion_fs.*), 0)::int as count from kg_assertion_fs) as n_filtered_assertions,
      (select coalesce(count(kg_assertion_f.*), 0)::int as count from kg_assertion_f) as n_assertions
  `
  const ps = Math.floor((results.n_filtered_assertions ?? 1) / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <Container><Typography variant="h1">Relation: {results.item.node.label}</Typography></Container>
      <Container><Typography variant="caption">Description: {format_description(results.item.node.description)}</Typography></Container>
      <Container><Typography variant="caption">Number of Assertions: {results.n_assertions.toLocaleString()}</Typography></Container>
      <SearchField q={searchParams.q ?? ''} />
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell component="th" className="w-24">
                &nbsp;
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Source</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Relation</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Target</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Evidence</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.assertions.map(assertion => (
              <TableRow
                key={assertion.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell className="relative">
                  {assertion.dcc?.icon ? <Link href={`/data/matrix/${assertion.dcc.short_label}`}><Image className="p-2 object-contain" src={assertion.dcc.icon} alt={assertion.dcc.label} fill /></Link>
                    : null}
                </TableCell>
                <TableCell>
                  <Link href={`/data/processed/entity/${assertion.source.type}/${assertion.source.id}`}><Typography>{assertion.source.label}</Typography></Link>
                  <Typography variant='caption'>{type_to_string('entity', assertion.source.type)}</Typography>
                </TableCell>
                <TableCell>
                  <Link href={`/data/processed/kg_relation/${props.params.id}`}><Typography fontWeight={"bold"}>{results.item.node.label}</Typography></Link>
                </TableCell>
                <TableCell>
                  <Link href={`/data/processed/entity/${assertion.target.type}/${assertion.target.id}`}><Typography>{assertion.target.label}</Typography></Link>
                  <Typography variant='caption'>{type_to_string('entity', assertion.target.type)}</Typography>
                </TableCell>
                <TableCell>
                  {assertion.evidence?.toString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
