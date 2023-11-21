import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Link from "next/link"
import { z } from 'zod'
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image"
import { format_description, pluralize } from "@/app/data/processed/utils";

const pageSize = 10

export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
  const [library, library_sets] = await prisma.$transaction([
    prisma.xLibrary.findUniqueOrThrow({
      where: { id: props.params.id },
      select: {
        entity_type: true,
        term_type: true,
        dcc_asset_link: true,
        _count: {
          select: {
            sets: true,
            entities: true,
          }
        },
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
                label: true,
                icon: true,
              }
            },
          }
        },
      },
    }),
    prisma.xLibrary.findUniqueOrThrow({
      where: { id: props.params.id },
      select: {
        _count: {
          select: {
            sets: searchParams.q ? {
              where: {
                identity: {
                  OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
                }
              }
            } : true,
          },
        },
        sets: {
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
          where: searchParams.q ? {
            identity: {
              OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
            }
          } : {},
          skip: offset,
          take: limit,
        }
      },
    }),
  ])
  const ps = Math.floor(library_sets._count.sets / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <div className="flex flex-column">
        <div className="flex-grow-0 self-center justify-self-center">
          {library.dcc_asset.dcc?.icon ?
            <Link href={`/data/matrix/${library.dcc_asset.dcc.short_label}`}>
              <Image src={library.dcc_asset.dcc.icon} alt={library.dcc_asset.dcc.label} width={240} height={240} />
            </Link>
            : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{library.identity.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {format_description(library.identity.description)}</Typography></Container>
          {library.dcc_asset.dcc?.label ? <Container><Typography variant="caption">Project: <Link href={`/data/matrix/${library.dcc_asset.dcc.short_label}`}>{library.dcc_asset.dcc.label}</Link></Typography></Container> : null}
          <Container><Typography variant="caption">Number of {pluralize(library.entity_type)}: {library._count.entities}</Typography></Container>
          <Container><Typography variant="caption">Number of {library.term_type} {library.entity_type} sets: {library._count.sets}</Typography></Container>
          <Container><Typography variant="caption">Download: <Link href={library.dcc_asset_link}>{library.dcc_asset_link}</Link></Typography></Container>
        </Container>
      </div>
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
            {library_sets.sets.map(set => (
              <TableRow
                key={set.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link href={`/data/processed/${set.identity.type}/${set.id}`}>
                    <Typography variant='h6'>{set.identity.label}</Typography>
                  </Link>
                </TableCell>
                <TableCell>{format_description(set.identity.description)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
