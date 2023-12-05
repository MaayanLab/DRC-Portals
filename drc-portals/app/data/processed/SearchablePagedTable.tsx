import React from "react"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import FormPagination from "./FormPagination"
import SearchField from "./SearchField"
import Link from "next/link"
import Image, { StaticImageData } from "next/image"
import { NodeType } from "@prisma/client"
import { type_to_string } from "./utils"

export function LinkedTypedNode({
  id,
  type,
  label,
  entity_type = null,
  focus = false,
}: {
  id: string,
  type: NodeType,
  label: string,
  entity_type?: string | null,
  focus?: boolean,
}) {
  return (
    <div className="flex flex-col">
      <Link href={`/data/processed/${type}${entity_type ? `/${entity_type}` : ''}/${id}`}><Typography sx={{overflowWrap: "break-word", maxWidth: 300}} fontWeight={focus ? "bold" : undefined}>{label}</Typography></Link>
      <Link href={`/data/processed/${type}${entity_type ? `/${entity_type}` : ''}`}><Typography variant='caption'>{type_to_string(type, entity_type)}</Typography></Link>
    </div>
  )
}

export function SearchablePagedTableCellIcon(props: {
  src: string | StaticImageData, href: string, alt: string
}) {
  return (
    <div className="w-32 h-16 relative">
      <Link href={props.href}>
        <Image className="object-contain" src={props.src} alt={props.alt} fill />
      </Link>
    </div>
  )
}

export default function SearchablePagedTable(props: React.PropsWithChildren<{
  label?: string,
  q: string, p: number, ps: number,
  columns: React.ReactNode[],
  rows: React.ReactNode[][],
}>) {
  return (
    <>
      {props.label ?
        <div className="flex flex-row justify-between">
          <Typography variant="h2" className="whitespace-nowrap">{props.label}</Typography>
          <form className="flex flex-col" action="" method="GET">
            <SearchField q={props.q} />
          </form>
        </div>
        : null}
      {props.rows.length === 0 ? <>No results</> : (
        <>
          <TableContainer component={Paper} elevation={0}>
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
                {props.rows.map((row, i) => (
                  <TableRow
                    key={i}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {row.map((cell, j) => <TableCell sx={{maxWidth: 300, overflowWrap: 'break-word'}} key={j}>{cell}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <FormPagination p={props.p} ps={props.ps} />
        </>
      )}
    </>
  )
}
