'use client'
import React from 'react';
import { Link } from '@mui/material';
import { Table, TableHead, TableRow, TableBody, TableCell, Typography } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { dccAsset } from '@/utils/dcc-assets';

export function DCCFileTable(props : {fileInfo: dccAsset[], isCode: boolean}) {
  props.isCode ? (
    props.fileInfo.sort((a, b) => (a.filename < b.filename) ? -1 : 1)
  ) : (
    props.fileInfo.sort((a, b) => (new Date(a.lastmodified)) > new Date(b.lastmodified) ? -1 : 1)
  )
  return (
    props.fileInfo.length > 0 ? (
      props.isCode ? (
        <Table sx={{mb:2}}>
        <TableHead>
          <TableRow sx={{backgroundColor: '#edf1f7'}}>
            <TableCell width='35%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}}>Name</TableCell>
            <TableCell width='15%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Date Modified</TableCell>
            <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Creator</TableCell>
            <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">DCC Approved</TableCell>
            <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">DRC Approved</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.fileInfo.map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell width='30%' sx={{border:0}}>
                  <Link color="#3470e5" fontSize="11pt" className="underline" href={item.link} target="_blank" rel="noopener">
                    {item.filename}
                  </Link>
                </TableCell>
                <TableCell align="center" sx={{border:0, fontSize: '11pt'}}>{item.lastmodified}</TableCell>
                <TableCell align="center" sx={{border:0, fontSize: '11pt'}}>{item.creator}</TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.dccapproved ? (<CheckCircle sx={{color:"#7187C3"}} />) : (<span />)}
                </TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.drcapproved ? (<CheckCircle sx={{color:"#7187C3"}} />) : (<span />)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      ) : (
        <Table sx={{mb:2}}>
          <TableHead>
            <TableRow sx={{backgroundColor: '#edf1f7'}}>
              <TableCell width='30%' sx={{border:0, fontWeight:'bold', fontSize:'12pt'}}>Filename</TableCell>
              <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Filesize</TableCell>
              <TableCell width='15%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Date Modified</TableCell>
              <TableCell sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">Creator</TableCell>
              <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">DCC Approved</TableCell>
              <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '12pt'}} align="center">DRC Approved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {props.fileInfo.map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell width='30%' sx={{border:0}}>
                  <Link color="#3470e5" fontSize="11pt" className="underline" href={item.link} target="_blank" rel="noopener">
                    {item.filename}
                  </Link>
                </TableCell>
                <TableCell width="10%" align="center" sx={{border:0, fontSize: '11pt'}}>{item.size}</TableCell>
                <TableCell width="15%" align="center" sx={{border:0, fontSize: '11pt'}}>{item.lastmodified}</TableCell>
                <TableCell align="center" sx={{border:0, fontSize: '11pt'}}>{item.creator}</TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.dccapproved ? (<CheckCircle sx={{color:"#7187C3"}} />) : (<span />)}
                </TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.drcapproved ? (<CheckCircle sx={{color:"#7187C3"}} />) : (<span />)}
                </TableCell>
              </TableRow>
            )
          })}
          </TableBody>
        </Table>
      )
  ) : (
    <Typography sx={{ml:2, mt:1, mb:2}} fontSize="11pt" color="text.secondary">
      None Available
    </Typography>
    )
  )
}