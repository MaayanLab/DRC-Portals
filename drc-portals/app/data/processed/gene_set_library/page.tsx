import prisma from "@/lib/prisma";
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Link from "next/link";
import FormPagination from "@/app/data/processed/FormPagination";
import SearchField from "@/app/data/processed/SearchField";
import Image from "next/image";
import { format_description, useSanitizedSearchParams } from "@/app/data/processed/utils";

const pageSize = 10

export default async function Page(props: { searchParams: Record<string, string | string[] | undefined> }) {
  const searchParams = useSanitizedSearchParams(props)
  const offset = (searchParams.p - 1)*pageSize
  const limit = pageSize
  const [libraries, count] = await prisma.$transaction([
    prisma.geneSetLibraryNode.findMany({
      where: searchParams.q ? {
        node: {
          OR: [{ label: { mode: 'insensitive', contains: searchParams.q } }, { description: { search: searchParams.q } }]
        }
      } : {},
      select: {
        _count: {
          select: {
            gene_sets: true,
            genes: true,
          }
        },
        id: true,
        node: {
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
                icon: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.geneSetLibraryNode.count({
      where: searchParams.q ? {
        node: {
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
                <Typography variant='h3'>Type</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {libraries.map(library => (
              <TableRow
                  key={library.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell className="w-4 relative">
                  {library.dcc_asset.dcc?.icon ?
                    <Link href={`/data/matrix/${library.dcc_asset.dcc.short_label}`}>
                      <Image className="p-2 object-contain" src={library.dcc_asset.dcc.icon} alt={library.dcc_asset.dcc.short_label ?? ''} fill />
                    </Link>
                    : null}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Link href={`/data/processed/gene_set_library/${library.id}`}>
                    <Typography variant='h6'>{library.node.label}</Typography>
                  </Link>
                </TableCell>
                <TableCell>{format_description(library.node.description)}</TableCell>
                <TableCell>Gene Sets</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <FormPagination p={searchParams.p} ps={ps} />
    </Container>
  )
}
