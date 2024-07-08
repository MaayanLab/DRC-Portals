import ListItemCollapsible from "@/components/misc/ListItemCollapsible"
import prisma from "@/lib/prisma"
import { Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import { format_description/*, useSanitizedSearchParams*/ } from "@/app/data/processed/utils"
import { safeAsync } from "@/utils/safe"

export default async function Page(props: { params: { entity_type: string, id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  // const searchParams = useSanitizedSearchParams(props)
  if (props.params.entity_type !== 'gene') return null
  // const offset = (searchParams.p - 1)*searchParams.r
  // const limit = searchParams.r
  const { data: item, error } = await safeAsync(() => prisma.geneEntity.findUnique({
    where: { id: props.params.id },
    select: {
      _count: {
        select: {
          gene_sets: true,
        },
      },
      entity: {
        select: {
          node: {
            select: {
              label: true,
              description: true,
            }
          },
        }
      },
      gene_set_libraries: {
        select: {
          id: true,
          _count: {
            select: {
              gene_sets: {
                where: {
                  genes: {
                    some: {
                      id: props.params.id
                    }
                  }
                },
              },
            },
          },
          node: {
            select: {
              label: true,
              description: true,
              dcc: {
                select: {
                  label: true,
                  icon: true,
                },
              },
            }
          },
          gene_sets: {
            where: {
              genes: {
                some: {
                  id: props.params.id
                }
              }
            },
            select: {
              id: true,
              node: {
                select: {
                  type: true,
                  label: true,
                  description: true,
                }
              }
            },
          }
        }
      },
    },
  }))
  if (error) console.error(error)
  if (!item?._count.gene_sets) return null
  return (
    <Grid container sx={{paddingTop: 5, paddingBottom: 5}}>
      <Grid item xs={12} sx={{marginBottom: 5}}>
        <Typography variant="h2" color="secondary" className="whitespace-nowrap">Gene Sets ({item._count.gene_sets})</Typography>
        {/* <SearchField q={searchParams.q ?? ''} /> */}
      </Grid>
      <Grid item xs={12}>
        {item.gene_set_libraries.map(library => (
          <ListItemCollapsible key={library.id} primary={
            <div className="flex flex-row">
              <div className="w-24">
                {library.node.dcc?.icon ? <Image src={library.node.dcc.icon} alt={library.node.dcc.label} width={120} height={120} /> : null}
              </div>
              <Container className="flex-grow">
                <Container>{library.node.label} ({library._count.gene_sets})</Container>
                <Container>{format_description(library.node.description)}</Container>
              </Container>
            </div>
          } defaultOpen={false}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableBody>
                  {library.gene_sets.map(set => (
                    <TableRow key={set.id}>
                      <TableCell component="th" scope="row">
                        <Link href={`/data/processed/${set.node.type}/${set.id}`}>{set.node.label}</Link>
                      </TableCell>
                      <TableCell>
                        {format_description(set.node.description)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ListItemCollapsible>
        ))}
      </Grid>
    </Grid>
  )
}
