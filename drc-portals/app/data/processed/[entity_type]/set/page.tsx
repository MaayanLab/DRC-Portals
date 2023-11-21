import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { type_to_string } from "@/app/data/processed/utils"
import Image from "next/image";

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
    prisma.xSet.findMany({
      where: searchParams.q ? {
        identity: {
          searchable: { search: searchParams.q }
        },
        library: {
          entity_type: props.params.entity_type,
        },
      } : {},
      select: {
        id: true,
        identity: {
          select: {
            type: true,
            label: true,
            description: true,
          },
        },
        library: {
          select: {
            dcc_asset: {
              select: {
                dcc: {
                  select: {
                    short_label: true,
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
        library: {
          entity_type: props.params.entity_type,
        },
      } : {
        library: {
          entity_type: props.params.entity_type,
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
                <Typography variant='h3'>Source</Typography>
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
            {items.map(item => (
              <TableRow
                  key={item.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell className="w-4 relative">
                  {item.library.dcc_asset.dcc?.icon ?
                    <Link href={`/data/matrix/${item.library.dcc_asset.dcc.short_label}`}>
                      <Image className="p-2 object-contain" src={item.library.dcc_asset.dcc.icon} alt={item.library.dcc_asset.dcc.label} fill />
                    </Link>
                    : null}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Link href={`/data/processed/${item.identity.type}/${item.id}`}>
                    <Typography variant='h6'>{item.identity.label}</Typography>
                  </Link>
                  <Link href={`/data/processed/${item.identity.type}`}>
                    <Typography variant='caption'>{type_to_string(item.identity.type)}</Typography>
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
