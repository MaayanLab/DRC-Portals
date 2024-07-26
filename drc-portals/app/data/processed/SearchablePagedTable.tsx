import React from "react"
import { Paper, Stack, Grid, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography, List, ListItem, Box, Divider } from "@mui/material"
import FormPagination from "./FormPagination"
import { SearchForm, SearchField } from './SearchField'
import Link from "next/link"
import Image, { StaticImageData } from "next/image"
import { NodeType } from "@prisma/client"
import { type_to_color, type_to_string } from "./utils"
import { Highlight } from "@/components/misc/Highlight"

export function LinkedTypedNode({
  id,
  type,
  label,
  search,
  entity_type = null,
  focus = false,
}: {
  id: string,
  type: NodeType,
  label: string,
  search?: string,
  entity_type?: string | null,
  focus?: boolean,
}) {
  return (
    <div className="flex flex-col">
      <Link prefetch={false} href={`/data/processed/${type}${entity_type ? `/${encodeURIComponent(entity_type)}` : ''}/${id}`}><Typography variant="body1" sx={{overflowWrap: "break-word", maxWidth: 300, textDecoration: 'underline'}} color="secondary" fontWeight={focus ? "bold" : undefined}><Highlight search={search} text={label} /></Typography></Link>
      <Link prefetch={false} href={`/data/processed/${type}${entity_type ? `/${encodeURIComponent(entity_type)}` : ''}/${id}`}><Typography variant='caption' color={type_to_color(type, entity_type)}><Highlight search={search} text={`${type_to_string(type, entity_type)} (Entity type)`} /></Typography></Link>
    </div>
  )
}

export function Description({ search, description }: { search: string, description: string }) {
  if (description === 'TODO') return null
  else {
    return <Typography variant="body1" color="secondary"><Highlight search={search} text={description} /></Typography>
  }
}

export function SearchablePagedTableCellIcon(props: {
  src: string | StaticImageData, href: string, alt: string
}) {
  return (
    <Box sx={{width: {xs: "4rem", sm: "4rem", md: "8rem", lg: "8rem", xl: "8rem"}, height: {xs: "2rem", sm: "2rem", md: "4rem", lg: "4rem", xl: "4rem"}, position: "relative"}}>
      <Link prefetch={false} href={props.href}>
        <Image className="object-contain" src={props.src} alt={props.alt} fill />
      </Link>
    </Box>
  )
}

export default function SearchablePagedTable(props: React.PropsWithChildren<{
  label?: string,
  q: string, p: number, r: number, count?: number,
  loading?: boolean,
  columns: React.ReactNode[],
  rows: React.ReactNode[][],
}>) {
  return (
    <Grid container justifyContent={'space-between'}>
      {props.label && 
      <Grid item xs={12} sx={{marginBottom: 5}}>
        <Stack direction={"row"} alignItems={"center"} justifyContent={'space-between'}>
          <Typography variant="h2" color="secondary" className="whitespace-nowrap">{props.label}</Typography>
          <SearchForm>
            <SearchField q={props.q} placeholder={`Search ${props.label}`} />
          </SearchForm>
        </Stack>
      </Grid>
      }
      <Grid item xs={12}>
        <Stack spacing={1}>
          <Box sx={{display: {xs: "none", sm: "block", md: "block", lg: "block", xl: "block",}}}>
            <TableContainer component={Paper} elevation={0} variant="rounded-top">
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {props.columns.map((column, i) => (
                      <TableCell key={i} component="th">
                        <Typography variant='body1' color="secondary">{column}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.rows.length === 0 ? <TableRow>
                    <TableCell colSpan={props.columns.length} align="center">
                      {props.loading ? <>Loading results...</> : <>No results satisfy the query and filters</>}
                    </TableCell>
                  </TableRow> :
                    props.rows.map((row, i) => (
                      <TableRow
                        key={i}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        {row.map((cell, j) => <TableCell sx={{maxWidth: 300, overflowWrap: 'break-word'}} key={j}>
                          {cell}
                        </TableCell>)}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
            <Box sx={{display: {xs: "block", sm: "none", md: "none", lg: "none", xl: "none",}}}>
              <List>
                {props.rows.map((row, i) => (
                  <React.Fragment key={i}>
                    <ListItem>
                      <Grid container justifyContent={"flex-start"} alignItems={"center"}>
                        <Grid item xs={3}>
                          {row[0]}
                        </Grid>
                        <Grid item xs={9}>
                          <Stack spacing={1}>
                            {row.slice(1).map((cell, j) => <div key={j}>{cell}</div>)}
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                    {(i < props.rows.length - 1 ) && <Divider/>}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          <FormPagination p={props.p} r={props.r} count={props.count} />
        </Stack>
      </Grid>
    </Grid>
  )
}
