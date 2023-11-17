import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Link from "next/link"
import { z } from 'zod'
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image"
import { pluralize } from "@/app/data/processed/utils";

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
  const [dataset, dataset_sets] = await prisma.$transaction([
    prisma.xDataset.findUniqueOrThrow({
      where: { id: `dataset/${props.params.id}` },
      select: {
        entityType: true,
        termType: true,
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
                label: true,
                icon: true,
              }
            },
          }
        },
      },
    }),
    prisma.xDataset.findUniqueOrThrow({
      where: { id: `dataset/${props.params.id}` },
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
  const ps = Math.floor(dataset_sets._count.sets / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <div className="flex flex-column">
        <div className="flex-grow-0 self-center justify-self-center">
          {dataset.dcc_asset.dcc?.icon ? <Image src={dataset.dcc_asset.dcc.icon} alt={dataset.dcc_asset.dcc.label} width={240} height={240} /> : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{dataset.identity.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {dataset.identity.description}</Typography></Container>
          {dataset.dcc_asset.dcc?.label ? <Container><Typography variant="caption">DCC: {dataset.dcc_asset.dcc.label}</Typography></Container> : null}
          <Container><Typography variant="caption">Number of {pluralize(dataset.entityType)}: {dataset._count.entities}</Typography></Container>
          <Container><Typography variant="caption">Number of {dataset.termType} {dataset.entityType} sets: {dataset._count.sets}</Typography></Container>
          <Container><Typography variant="caption">Download: <Link href={dataset.dcc_asset_link}>{dataset.dcc_asset_link}</Link></Typography></Container>
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
            {dataset_sets.sets.map(set => (
              <TableRow
                key={set.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link href={`/data/processed/${set.id}`}>
                    <Typography variant='h6'>{set.identity.label}</Typography>
                  </Link>
                </TableCell>
                <TableCell>{set.identity.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
