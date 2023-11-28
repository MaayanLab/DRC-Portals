import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Link from "next/link"
import { z } from 'zod'
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { capitalize, format_description, pluralize } from "@/app/data/processed/utils"
import Image from "next/image"

const pageSize = 10

export default async function Page(props: { params: { entity_type: string, term_type: string, id: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
  const [xset, xset_genes] = await prisma.$transaction([
    prisma.xSet.findUniqueOrThrow({
      where: {
        id: props.params.id,
        identity: {
          type: `${props.params.entity_type}/set/${props.params.term_type}`,
        },
      },
      select: {
        _count: {
          select: {
            contains: true,
          },
        },
        library: {
          select: {
            id: true,
            identity: {
              select: {
                type: true,
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
                    label: true,
                  },
                },
              },
            },
          }
        },
        identity: {
          select: {
            type: true,
            label: true,
            description: true,
          }
        },
      }
    }),
    prisma.xSet.findUniqueOrThrow({
      where: {
        id: props.params.id,
        identity: {
          type: `${props.params.entity_type}/set/${props.params.term_type}`
        },
      },
      select: {
        _count: {
          select: {
            contains: searchParams.q ? {
              where: {
                identity: {
                  OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
                }
              }
            } : true,
          },
        },
        contains: {
          select: {
            id: true,
            identity: {
              select: {
                type: true,
                label: true,
                description: true,
              }
            }
          },
          where: searchParams.q ? {
            identity: {
              OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
            }
          } : {},
          skip: offset,
          take: limit,
        },
      }
    }),
  ])
  const ps = Math.floor(xset_genes._count.contains / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <div className="flex flex-column">
        <div className="flex-grow-0 self-center justify-self-center">
          {xset.library.dcc_asset.dcc?.icon ?
            <Link href={`/data/matrix/${xset.library.dcc_asset.dcc.short_label}`}>
              <Image src={xset.library.dcc_asset.dcc.icon} alt={xset.library.dcc_asset.dcc.label} width={240} height={240} />
            </Link>
            : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{xset.identity.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {format_description(xset.identity.description)}</Typography></Container>
          {xset.library.dcc_asset.dcc ? <Container><Typography variant="caption">Project: <Link href={`/data/matrix/${xset.library.dcc_asset.dcc.short_label}`}>{xset.library.dcc_asset.dcc.label}</Link></Typography></Container> : null}
          <Container><Typography variant="caption">Library: <Link href={`/data/processed/${xset.library.identity.type}/${xset.library.id}`}>{xset.library.identity.label}</Link></Typography></Container>
          <Container><Typography variant="caption">{pluralize(capitalize(props.params.entity_type))}: {xset._count.contains.toLocaleString()}</Typography></Container>
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
            {xset_genes.contains.map(xentity => (
              <TableRow
                key={xentity.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                  <TableCell component="th" scope="row">
                    <Link href={`/data/processed/${xentity.identity.type}/${xentity.id}`}>{xentity.identity.label}</Link>
                  </TableCell>
                  <TableCell>{format_description(xentity.identity.description)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
