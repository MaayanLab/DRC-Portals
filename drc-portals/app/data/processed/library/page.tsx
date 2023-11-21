import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image";
import { capitalize } from "@/app/data/processed/utils";

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
  const [libraries, count] = await prisma.$transaction([
    prisma.xLibrary.findMany({
      where: searchParams.q ? {
        identity: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {},
      select: {
        _count: {
          select: {
            sets: true,
            entities: true,
          }
        },
        id: true,
        term_type: true,
        entity_type: true,
        identity: {
          select: {
            label: true,
            description: true,
          }
        },
        dcc_asset: {
          select: {
            dcc: {
              select: {
                short_label: true,
                icon: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.xLibrary.count({
      where: searchParams.q ? {
        identity: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {},
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
                <Typography variant='h3'>Source</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Label</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Description</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Type</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {libraries.map(library => (
                <TableRow
                    key={library.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell>
                      {library.dcc_asset.dcc?.icon ? <Image src={library.dcc_asset.dcc.icon} alt={library.dcc_asset.dcc.short_label ?? ''} width={120} height={120} /> : null}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/library/${library.id}`}>
                        <Typography variant='h6'>{library.identity.label}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{library.identity.description}</TableCell>
                    <TableCell>{capitalize(`${library.term_type} ${library.entity_type} sets`)}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
