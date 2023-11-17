import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { capitalize } from "@/app/data/processed/utils"
import Image from "next/image";

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
    prisma.xSet.findMany({
      where: searchParams.q ? {
        identity: {
          searchable: { search: searchParams.q }
        },
        dataset: {
          entityType: props.params.entityType,
        },
      } : {},
      select: {
        id: true,
        identity: {
          select: {
            label: true,
            description: true,
          },
        },
        dataset: {
          select: {
            dcc_asset: {
              select: {
                dcc: {
                  select: {
                    icon: true,
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.xSet.count({
      where: searchParams.q ? {
        identity: {
          searchable: { search: searchParams.q }
        },
        dataset: {
          entityType: props.params.entityType,
        },
      } : {
        dataset: {
          entityType: props.params.entityType,
        },
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
            {items.map(item => {
              const split = item.id.indexOf('/')
              const type = item.id.slice(0, split)
              return (
                <TableRow
                    key={item.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell>
                      {item.dataset.dcc_asset.dcc?.icon ? <Image src={item.dataset.dcc_asset.dcc.icon} alt={item.dataset.dcc_asset.dcc.label} width={120} height={120} /> : null}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/${item.id}`}>
                        <Typography variant='h6'>{item.identity.label}</Typography>
                      </Link>
                      <Link href={`/data/processed/${item.id.split('/').slice(0, -1).join('/')}`}>
                        <Typography variant='caption' sx={{textTransform: 'capitalize'}}>{capitalize(item.id.split('/')[2])} {capitalize(item.id.split('/')[0])} Set</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{item.identity.description}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
