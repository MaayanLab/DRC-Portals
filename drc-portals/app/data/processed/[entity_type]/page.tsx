import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { format_description } from "../utils";

const pageSize = 10

export default async function Page(props: { params: { entity_type: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
  const [items, count] = await prisma.$transaction([
    prisma.xEntity.findMany({
      where: searchParams.q ? {
        identity: {
          type: props.params.entity_type,
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        },
      } : {
        identity: {
          type: props.params.entity_type,
        },
      },
      select: {
        id: true,
        identity: {
          select: {
            type: true,
            label: true,
            description: true,
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.xEntity.count({
      where: searchParams.q ? {
        identity: {
          type: props.params.entity_type,
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {
        identity: {
          type: props.params.entity_type,
        }
      },
    }),
  ])
  const ps = Math.floor(count / pageSize) + 1
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
            {items.map(item => (
                <TableRow
                    key={item.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/${item.identity.type}/${item.id}`}>
                        <Typography variant='h6'>{item.identity.label}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{format_description(item.identity.description)}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
