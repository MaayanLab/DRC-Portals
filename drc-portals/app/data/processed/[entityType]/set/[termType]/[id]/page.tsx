import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Link from "next/link"
import { z } from 'zod'
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { capitalize, pluralize } from "@/app/data/processed/utils"
import Image from "next/image"

const pageSize = 10

export default async function Page(props: { params: { entityType: string, termType: string, id: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
        id: `${props.params.entityType}/set/${props.params.termType}/${props.params.id}`,
      },
      select: {
        _count: {
          select: {
            contains: true,
          },
        },
        dataset: {
          select: {
            id: true,
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
            label: true,
            description: true,
          }
        },
      }
    }),
    prisma.xSet.findUniqueOrThrow({
      where: {
        id: `${props.params.entityType}/set/${props.params.termType}/${props.params.id}`,
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
          {xset.dataset.dcc_asset.dcc?.icon ? <Image src={xset.dataset.dcc_asset.dcc.icon} alt={xset.dataset.dcc_asset.dcc.label} width={240} height={240} /> : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{xset.identity.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {xset.identity.description}</Typography></Container>
          <Container><Typography variant="caption">Dataset: <Link href={`/data/processed/${xset.dataset.id}`}>{xset.dataset.identity.label}</Link></Typography></Container>
          <Container><Typography variant="caption">{pluralize(capitalize(props.params.entityType))}: {xset._count.contains}</Typography></Container>
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
                    <Link href={`/data/processed/${xentity.id}`}>{xentity.identity.label}</Link>
                  </TableCell>
                  <TableCell>{xentity.identity.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
