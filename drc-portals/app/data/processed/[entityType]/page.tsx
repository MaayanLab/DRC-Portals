import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";

const pageSize = 10

export default async function Page(props: { params: { entityType: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
        id: { startsWith: `${props.params.entityType}/` },
        identity: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        },
      } : {
        id: { startsWith: `${props.params.entityType}/` },
      },
      select: {
        id: true,
        identity: {
          select: {
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
        id: { startsWith: `${props.params.entityType}/` },
        identity: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {
        id: { startsWith: `${props.params.entityType}/` },
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
                      <Link href={`/data/processed/${item.id}`}>
                        <Typography variant='h6'>{item.identity.label}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{item.identity.description}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
