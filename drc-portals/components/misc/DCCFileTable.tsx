'use client'
import React from 'react';
import { Link } from '@mui/material';
import { Table, TableHead, TableRow, TableBody, TableCell } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { dccAsset } from '@/utils/dcc-assets';

export function DCCFileTable(props : {fileInfo: dccAsset[], isCode: boolean}) {
  return (
    props.fileInfo.length > 0 ? (
      <Table sx={{mb:2}}>
        <TableHead>
          <TableRow>
            <TableCell sx={{fontWeight: 'bold'}}>{props.isCode ? ("Name") : ("Filename")}</TableCell>
            {props.isCode ? (<span/>): (<TableCell sx={{fontWeight: 'bold'}} align="center">Filesize</TableCell>)}
            <TableCell sx={{fontWeight: 'bold'}} align="center">Date Modified</TableCell>
            <TableCell sx={{fontWeight: 'bold'}} align="center">Creator</TableCell>
            <TableCell sx={{fontWeight: 'bold'}} align="center">DCC Approved</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.fileInfo.map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell>
                  {item.link != '' ? (
                    <Link className="underline" href={item.link} target="_blank" rel="noopener">{item.filename}</Link>
                  ) : (
                    <p className="underline">{item.filename}</p>
                  )}
                </TableCell>
                {props.isCode ? (<span />): (<TableCell align="center"> {item.size != '' ? (item.size) : ('--')}</TableCell>)}
                <TableCell align="center">{item.lastmodified}</TableCell>
                <TableCell align="center">{item.creator}</TableCell>
                <TableCell align="center">
                  {item.approved ? (<CheckCircle />) : (<span />)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
  ) : (
    <p>None Available</p>
    )
  )
}