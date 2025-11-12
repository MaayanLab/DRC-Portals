'use client'
import React from "react"
import { Paper, Stack, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, List, ListItem, Box, Divider, TableCellProps, TableCellBaseProps } from "@mui/material"
import { SearchForm, SearchField } from './SearchField'
import Link from "@/utils/link"
import Image, { StaticImageData } from "@/utils/image"
import { categoryLabel, categoryColor } from "./utils"
import { Highlight } from "@/components/misc/Highlight"

export function LinkedTypedNode({
  href,
  type,
  label,
  search,
  focus = false,
}: {
  href: string,
  type: string,
  label: string,
  search?: string,
  focus?: boolean,
}) {
  return (
    <div className="flex flex-col">
      <Link href={href} scroll={false}><Typography variant="body1" sx={{overflowWrap: "break-word", maxWidth: 300, textDecoration: 'underline'}} color="secondary" fontWeight={focus ? "bold" : undefined}><Highlight search={search} text={label} /></Typography></Link>
      <Link href={href} scroll={false}><Typography variant='caption' color={categoryColor(type)}><Highlight search={search} text={`${categoryLabel(type)} (Entity type)`} /></Typography></Link>
    </div>
  )
}

export function Description({ search, description }: { search: string, description: string }) {
  if (description === 'TODO') return null
  else {
    return <Typography variant="body1" color="secondary"><Highlight search={search} text={description} /></Typography>
  }
}

const SearchablePagedTableCellContext = React.createContext<{component: React.ElementType<TableCellBaseProps>}>({ component: 'td' })

export function SearchablePagedTableCell(props: React.PropsWithChildren<TableCellProps>) {
  const { component } = React.useContext(SearchablePagedTableCellContext)
  return (
    <TableCell {...props} component={component} sx={{maxWidth: 300, overflowWrap: 'break-word', borderBottom: {xs: 0, md: '1px solid rgba(224, 224, 224, 1)'}, ...props.sx}}>
      {props.children}
    </TableCell>
  )
}

export function SearchablePagedTableCellIcon({ src, href, alt, ...props}: {
  src: string | StaticImageData, href?: string, alt: string
} & TableCellProps) {
  return (
    <SearchablePagedTableCell {...props} sx={{maxWidth: 'unset'}}>
      <Box sx={{position: "relative", width: {xs: "4rem", sm: "4rem", md: "8rem", lg: "8rem", xl: "8rem"}, height: {xs: "2rem", sm: "2rem", md: "4rem", lg: "4rem", xl: "4rem"}}}>
        <Link href={href ?? 'javascript:'} scroll={false}>
          <Image className="object-contain" src={src} alt={alt} fill />
        </Link>
      </Box>
    </SearchablePagedTableCell>
  )
}

export function SearchablePagedTableHeader(props: {
  label: string,
  search_name: string,
  search: string,
}) {
  const id = React.useId()
  return (
    <Grid item xs={12} sx={{marginBottom: 5}}>
      <Stack direction={"row"} alignItems={"center"} justifyContent={'space-between'}>
        <Typography variant="h2" color="secondary" className="whitespace-nowrap">{props.label}</Typography>
        <SearchForm name={id} param={props.search_name}>
          <SearchField name={id} defaultValue={props.search} placeholder={`Filter ${props.label}`} />
        </SearchForm>
      </Stack>
    </Grid>
  )
}
export default function SearchablePagedTable(props: React.PropsWithChildren<{
  tableHeader?: React.ReactNode,
  loading?: boolean,
  columns: React.ReactNode[],
  rows: React.ReactNode[][],
  tableFooter?: React.ReactNode,
  tablePagination?: React.ReactNode,
}>) {
  return (
    <Grid container justifyContent={'space-between'}>
      {props.tableHeader}
      <Grid item xs={12}>
        <Stack spacing={1}>
          <Box sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block",}}}>
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
                  <SearchablePagedTableCellContext.Provider value={{ component: 'td' }}>
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
                        >{row.map((cell, j) => <React.Fragment key={j}>{cell}</React.Fragment>)}</TableRow>
                      ))}
                  </SearchablePagedTableCellContext.Provider>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
            <List component={Paper}>
              <SearchablePagedTableCellContext.Provider value={{ component: 'div' }}>
                {props.rows.map((row, i) => (
                  <React.Fragment key={i}>
                    <ListItem>
                      <Grid container justifyContent={"flex-start"} alignItems={"center"}>
                        <Grid item xs={2} md={3}>
                          {row[0]}
                        </Grid>
                        <Grid item xs={10} md={9}>
                          <Stack spacing={1}>
                            {row.slice(1).map((cell, j) => <React.Fragment key={j}>{cell}</React.Fragment>)}
                          </Stack>
                        </Grid>
                      </Grid>
                    </ListItem>
                    {(i < props.rows.length - 1 ) && <Divider/>}
                  </React.Fragment>
                ))}
              </SearchablePagedTableCellContext.Provider>
            </List>
          </Box>
          {props.tableFooter}
          {props.tablePagination}
        </Stack>
      </Grid>
    </Grid>
  )
}
