'use client'
import React from 'react';
import { Link } from '@mui/material';
import { Table, TableHead, TableRow, TableBody, TableCell, Typography } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { dccAsset } from '@/utils/dcc-assets';

export function DCCFileTable(props : {fileInfo: dccAsset[], isCode: boolean}) {
  return (
    props.fileInfo.length > 0 ? (
      <Table sx={{mb:2}}>
        <TableHead>
          <TableRow sx={{backgroundColor: '#edf1f7'}}>
            <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}}>{props.isCode ? ("Name") : ("Filename")}</TableCell>
            {props.isCode ? (<span/>): (<TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Filesize</TableCell>)}
            <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Date Modified</TableCell>
            <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Creator</TableCell>
            <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">DCC Approved</TableCell>
            <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">DRC Approved</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.fileInfo.map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell sx={{border:0}}>
                  {item.link != '' ? (
                    <Link className="underline" href={item.link} target="_blank" rel="noopener">
                      <Typography color="#3470e5" fontSize="11pt">{item.filename}</Typography>
                    </Link>
                  ) : (
                    <p className="underline">{item.filename}</p>
                  )}
                </TableCell>
                {props.isCode ? (
                  <span />
                ): (
                  <TableCell align="center" sx={{border:0, fontSize: '11pt'}}> {item.size != '' ? (item.size) : ('--')}</TableCell>
                )}
                <TableCell align="center" sx={{border:0, fontSize: '11pt'}}>{item.lastmodified}</TableCell>
                <TableCell align="center" sx={{border:0, fontSize: '11pt'}}>{item.creator}</TableCell>
                <TableCell align="center" sx={{border:0}}>
                  {item.dccapproved ? (<CheckCircle sx={{color:"#7187C3"}} />) : (<span />)}
                </TableCell>
                <TableCell align="center" sx={{border:0}}>
                  {item.drcapproved ? (<CheckCircle sx={{color:"#7187C3"}} />) : (<span />)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
  ) : (
    <Typography sx={{ml:2, mt:1, mb:2}} fontSize="11pt" color="text.secondary">
      None Available
    </Typography>
    )
  )
}