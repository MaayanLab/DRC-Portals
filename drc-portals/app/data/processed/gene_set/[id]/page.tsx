import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Link from "next/link"
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import { format_description, useSanitizedSearchParams } from "@/app/data/processed/utils"
import Image from "next/image"

const pageSize = 10

export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [gene_set, genes] = await prisma.$transaction([
    prisma.geneSetNode.findUniqueOrThrow({
      where: {
        id: props.params.id,
      },
      select: {
        _count: {
          select: {
            genes: true,
          },
        },
        gene_set_library: {
          select: {
            id: true,
            node: {
              select: {
                type: true,
                label: true,
                description: true,
              }
            },
          }
        },
        node: {
          select: {
            type: true,
            label: true,
            description: true,
            dcc: {
              select: {
                short_label: true,
                icon: true,
                label: true,
              },
            },
          }
        },
      }
    }),
    prisma.geneSetNode.findUniqueOrThrow({
      where: {
        id: props.params.id,
      },
      select: {
        _count: {
          select: {
            genes: searchParams.q ? {
              where: {
                entity: {
                  node: {
                    OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
                  }
                },
              }
            } : true,
          },
        },
        genes: {
          select: {
            id: true,
            entity: {
              select: {
                node: {
                  select: {
                    type: true,
                    label: true,
                    description: true,
                  },
                },
              },
            },
          },
          where: searchParams.q ? {
            entity: {
              node: {
                OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
              },
            },
          } : {},
          skip: offset,
          take: limit,
        },
      }
    }),
  ])
  const ps = Math.floor(genes._count.genes / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <div className="flex flex-column">
        <div className="flex-grow-0 self-center justify-self-center">
          {gene_set.node.dcc?.icon ?
            <Link href={`/data/matrix/${gene_set.node.dcc.short_label}`}>
              <Image src={gene_set.node.dcc.icon} alt={gene_set.node.dcc.label} width={240} height={240} />
            </Link>
            : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{gene_set.node.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {format_description(gene_set.node.description)}</Typography></Container>
          {gene_set.node.dcc ? <Container><Typography variant="caption">Project: <Link href={`/data/matrix/${gene_set.node.dcc.short_label}`}>{gene_set.node.dcc.label}</Link></Typography></Container> : null}
          <Container><Typography variant="caption">Gene Set Library: <Link href={`/data/processed/${gene_set.gene_set_library.node.type}/${gene_set.gene_set_library.id}`}>{gene_set.gene_set_library.node.label}</Link></Typography></Container>
          <Container><Typography variant="caption">Number of genes: {gene_set._count.genes.toLocaleString()}</Typography></Container>
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
            {genes.genes.map(gene => (
              <TableRow
                key={gene.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                  <TableCell component="th" scope="row">
                    <Link href={`/data/processed/entity/gene/${gene.id}`}>{gene.entity.node.label}</Link>
                  </TableCell>
                  <TableCell>{format_description(gene.entity.node.description)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
