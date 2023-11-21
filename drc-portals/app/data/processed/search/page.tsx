import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import { z } from 'zod';
import Image from "next/image";
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { capitalize } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'

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
  const [items, count] = searchParams.q ? await prisma.$transaction([
    prisma.xIdentity.findMany({
      where: {
        searchable: { search: searchParams.q },
      },
      select: {
        id: true,
        type: true,
        label: true,
        description: true,
        entity: {
          select: {
            id: true,
          },
        },
        set: {
          select: {
            id: true,
            library: {
              select: {
                dcc_asset: {
                  select: {
                    dcc: {
                      select: {
                        short_label: true,
                        label: true,
                        icon: true
                      },
                    },
                  }
                }
              },
            },
          },
        },
        library: {
          select: {
            id: true,
            dcc_asset: {
              select: {
                dcc: {
                  select: {
                    short_label: true,
                    label: true,
                    icon: true,
                  },
                },
              }
            },
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.xIdentity.count({
      where: {
        searchable: { search: searchParams.q }
      },
    }),
  ]) : [undefined, undefined]
  const ps = Math.floor((count ?? 1) / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <SearchField q={searchParams.q ?? ''} />
      {items ?
        <Container className="mt-10 justify-content-center">
          <Typography variant="h3" className='text-center p-5'>Results</Typography>
          {items.length === 0 ? <>No results</> : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
                            {item.library && item.library.dcc_asset.dcc?.icon ? <Link href={`/data/matrix/${item.library.dcc_asset.dcc.short_label}`}><Image className="p-2 object-contain" src={item.library.dcc_asset.dcc.icon} alt={item.library.dcc_asset.dcc.label} fill /></Link>
                              : item.set && item.set.library.dcc_asset.dcc?.icon ? <Link href={`/data/matrix/${item.set.library.dcc_asset.dcc.short_label}`}><Image className="p-2 object-contain" src={item.set.library.dcc_asset.dcc.icon} alt={item.set.library.dcc_asset.dcc.label} fill /></Link>
                              : item.type === 'gene' ? <Link href={`/data/processed/${item.type}`}><Image className="p-2 object-contain" src={GeneIcon} alt="Gene" fill /></Link>
                              : item.type === 'drug' ? <Link href={`/data/processed/${item.type}`}><Image className="p-2 object-contain" src={DrugIcon} alt="Drug" fill /></Link>
                              : null}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <Link href={`/data/processed/${item.type}/${item.id}`}>
                              <Typography variant='h6'>{item.label}</Typography>
                            </Link>
                            <Typography variant='caption'>{
                              item.entity ? <Link href={`/data/processed/${item.type}`}>{capitalize(item.type.split('/')[0])}</Link>
                                : item.set ? <Link href={`/data/processed/${item.type}`}>{capitalize(item.type.split('/')[2])} {capitalize(item.type.split('/')[0])} Set</Link>
                                : item.library ? <Link href={`/data/processed/${item.type}`}>{capitalize(item.type.split('/')[0])}</Link>
                                : null
                            }</Typography>
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <FormPagination p={searchParams.p} ps={ps} />
        </Container>
        : null}
    </Container>
  )
}
