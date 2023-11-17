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
  const [datasets, count] = await prisma.$transaction([
    prisma.xDataset.findMany({
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
        termType: true,
        entityType: true,
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
    prisma.xDataset.count({
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
            {datasets.map(dataset => (
                <TableRow
                    key={dataset.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell>
                      {dataset.dcc_asset.dcc?.icon ? <Image src={dataset.dcc_asset.dcc.icon} alt={dataset.dcc_asset.dcc.short_label ?? ''} width={120} height={120} /> : null}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/${dataset.id}`}>
                        <Typography variant='h6'>{dataset.identity.label}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{dataset.identity.description}</TableCell>
                    <TableCell>{capitalize(`${dataset.termType} ${dataset.entityType} sets`)}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
