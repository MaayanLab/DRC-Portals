import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image";
import { format_description } from "@/app/data/processed/utils";

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
  const [items, count] = await prisma.$transaction([
    prisma.c2M2File.findMany({
      where: searchParams.q ? {
        identity: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {},
      select: {
        id: true,
        data_type: true,
        assay_type: true,
        identity: {
          select: {
            type: true,
            label: true,
            description: true,
          }
        },
        datapackage: {
          select: {
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
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.c2M2File.count({
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
                <Typography variant='h3'>Data Type</Typography>
              </TableCell>
              <TableCell component="th">
                <Typography variant='h3'>Assay Type</Typography>
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
                      {item.datapackage.dcc_asset.dcc?.icon ?
                        <Link href={`/data/matrix/${item.datapackage.dcc_asset.dcc.short_label}`}>
                          <Image className="p-2 object-contain" src={item.datapackage.dcc_asset.dcc.icon} alt={item.datapackage.dcc_asset.dcc.short_label ?? ''} fill />
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
