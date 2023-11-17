import ListItemCollapsible from "@/components/misc/ListItemCollapsible"
import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import { z } from 'zod'

const pageSize = 10

export default async function Page(props: { params: { entityType: string, id: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
  const xentity = await prisma.xEntity.findUniqueOrThrow({
    where: { id: `${props.params.entityType}/${props.params.id}` },
    select: {
      identity: {
        select: {
          label: true,
          description: true,
        }
      },
      datasets: {
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
                  label: true,
                  icon: true,
                },
              },
            },
          },
          sets: {
            where: {
              contains: {
                some: {
                  id: `${props.params.entityType}/${props.params.id}`
                }
              }
            },
            select: {
              id: true,
              identity: {
                select: {
                  label: true,
                  description: true,
                }
              }
            },
          }
        }
      },
    },
  })
  return (
    <Container component="form" action="" method="GET">
      <Container><Typography variant="h1">{xentity.identity.label}</Typography></Container>
      <Container><Typography variant="caption">Description: {xentity.identity.description}</Typography></Container>
      {/* <SearchField q={searchParams.q ?? ''} /> */}
      {xentity.datasets.map(dataset => (
        <ListItemCollapsible key={dataset.id} primary={
          <div className="flex flex-row">
            <div className="flex-0">
              {dataset.dcc_asset.dcc?.icon ? <Image src={dataset.dcc_asset.dcc.icon} alt={dataset.dcc_asset.dcc.label} width={120} height={120} /> : null}
            </div>
            <Container className="flex-grow">
              <Container>{dataset.identity.label}</Container>
              <Container>{dataset.identity.description}</Container>
            </Container>
          </div>
        } defaultOpen={false}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableBody>
                {dataset.sets.map(set => (
                  <TableRow key={set.id}>
                    <TableCell component="th" scope="row">
                      <Link href={`/data/processed/${set.id}`}>{set.identity.label}</Link>
                    </TableCell>
                    <TableCell>
                      {set.identity.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ListItemCollapsible>
      ))}
    </Container>
  )
}
