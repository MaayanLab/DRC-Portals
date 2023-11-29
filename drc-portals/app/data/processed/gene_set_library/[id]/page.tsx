import prisma from "@/lib/prisma"
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Link from "next/link"
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image"
import { format_description, useSanitizedSearchParams } from "@/app/data/processed/utils";

const pageSize = 10

export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [library, library_sets] = await prisma.$transaction([
    prisma.geneSetLibraryNode.findUniqueOrThrow({
      where: { id: props.params.id },
      select: {
        dcc_asset_link: true,
        _count: {
          select: {
            gene_sets: true,
            genes: true,
          }
        },
        node: {
          select: {
            label: true,
            description: true,
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
    prisma.geneSetLibraryNode.findUniqueOrThrow({
      where: { id: props.params.id },
      select: {
        _count: {
          select: {
            gene_sets: searchParams.q ? {
              where: {
                node: {
                  OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
                }
              }
            } : true,
          },
        },
        gene_sets: {
          select: {
            id: true,
            node: {
              select: {
                type: true,
                label: true,
                description: true,
              },
            },
          },
          where: searchParams.q ? {
            node: {
              OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
            }
          } : {},
          skip: offset,
          take: limit,
        }
      },
    }),
  ])
  const ps = Math.floor(library_sets._count.gene_sets / pageSize) + 1
  return (
    <Container component="form" action="" method="GET">
      <div className="flex flex-column">
        <div className="flex-grow-0 self-center justify-self-center">
          {library.node.dcc?.icon ?
            <Link href={`/data/matrix/${library.node.dcc.short_label}`}>
              <Image src={library.node.dcc.icon} alt={library.node.dcc.label} width={240} height={240} />
            </Link>
            : null}
        </div>
        <Container className="flex-grow">
          <Container><Typography variant="h1">{library.node.label}</Typography></Container>
          <Container><Typography variant="caption">Description: {format_description(library.node.description)}</Typography></Container>
          {library.node.dcc?.label ? <Container><Typography variant="caption">Project: <Link href={`/data/matrix/${library.node.dcc.short_label}`}>{library.node.dcc.label}</Link></Typography></Container> : null}
          <Container><Typography variant="caption">Number of genes: {library._count.genes.toLocaleString()}</Typography></Container>
          <Container><Typography variant="caption">Number of gene sets: {library._count.gene_sets.toLocaleString()}</Typography></Container>
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
            {library_sets.gene_sets.map(gene_set => (
              <TableRow
                key={gene_set.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Link href={`/data/processed/${gene_set.node.type}/${gene_set.id}`}>
                    <Typography variant='h6'>{gene_set.node.label}</Typography>
                  </Link>
                </TableCell>
                <TableCell>{format_description(gene_set.node.description)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
