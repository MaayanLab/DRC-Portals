'use client'
import React from 'react';
import { Link, List, ListItem, Stack, Divider } from '@mui/material';
import { Table, TableHead, TableRow, TableBody, TableCell, Typography } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { dccAsset } from '@/utils/dcc-assets';
import { useWidth } from './Carousel/helper';
import DisableableLink from './DisableableLink';
import { useSession } from 'next-auth/react';

function AccessControledDccAssetLink({ item, ...props }: React.PropsWithChildren<{ item: dccAsset }> & Exclude<React.ComponentProps<typeof DisableableLink>, 'children' | 'disabled'>) {
  const session = useSession({ required: false })
  const disabled = React.useMemo(() => !(
    // user is admin || DRC approver
    session.data?.user.role === 'ADMIN'
    || session.data?.user.role === 'DRC_APPROVER'
    // approved by someone
    || item.dccapproved
    || item.drcapproved
    // created by this person
    || (item.creator && item.creator === session.data?.user.email)
    // is a DCC approver for this dcc (TODO: just match on dcc rather than checking the link by bringing the DCC short label into the dccAsset object)
    || (session.data?.user.role === 'DCC_APPROVER' && session.data.user.dccs.some(dcc => item.link.includes(`/${dcc}/`)))
  ), [item, session.data])
  return <DisableableLink disabled={disabled} {...props}>{props.children ?? item.filename}</DisableableLink> 
}

export function NameCell(props : {item: dccAsset, disabled?: boolean}) {
  const width = useWidth()
  if (props.item.entitypage) {
      return (
        <Typography>
          {props.item.filename}
          <br />
          <AccessControledDccAssetLink color="#3470e5" fontSize="11pt" className="underline" href={props.item.link} target="_blank" rel="noopener" item={props.item}>
            Template
          </AccessControledDccAssetLink>  |  <Link 
            color="#3470e5" fontSize="11pt" className="underline" href={props.item.entitypage} target="_blank" rel="noopener">
            Example
          </Link>
        </Typography>
      )
  } else if ((props.item.openapi) && (!props.item.smartapi)) {
    return (
      <Typography color="#979b9c" fontSize="10pt">
        <AccessControledDccAssetLink color="#3470e5" fontSize="11pt" className="underline" href={props.item.link} target="_blank" rel="noopener" item={props.item}>
          {props.item.filename}
        </AccessControledDccAssetLink> (OpenAPI)
      </Typography>
    )
  } else if (props.item.smartapi) {
    const apiurl = props.item.smartapiurl ? props.item.smartapiurl : props.item.link
    return (
      <Typography color="#979b9c" fontSize="10pt">
        <AccessControledDccAssetLink color="#3470e5" fontSize="11pt" className="underline" href={props.item.link} target="_blank" rel="noopener" item={props.item}>
          {props.item.filename}
        </AccessControledDccAssetLink> (SmartAPI)
      </Typography>
    )
  } else {
    return (
      <AccessControledDccAssetLink color="#3470e5" fontSize="11pt" className="underline" href={props.item.link} target="_blank" rel="noopener" item={props.item}>
        {props.item.filename}
      </AccessControledDccAssetLink>
    )
  }
}

export function DCCFileTable(props : {fileInfo: dccAsset[], isCode: boolean}) {
  props.isCode ? (
    props.fileInfo.sort((a, b) => (a.filename < b.filename) ? -1 : 1)
  ) : (
    props.fileInfo.sort((a, b) => (new Date(a.lastmodified)) > new Date(b.lastmodified) ? -1 : 1)
  )
  const width = useWidth()
  if (props.fileInfo.length === 0) return <Typography sx={{ml:2, mt:1, mb:2}} fontSize="11pt" color="text.secondary">None Available</Typography>
  if (['xs', 'sm'].indexOf(width) > -1) {
    if (props.isCode) {
      return (
        <List>
          {props.fileInfo.map((item, idx) => (
            <React.Fragment key={idx}>
              <ListItem>
                <Stack spacing={1}>
                  <div className='flex space-x-2 items-start'><Typography variant="body2"><b>Name:</b></Typography><NameCell item={item}/></div>
                  <Typography variant="body2"><b>Creator:</b> {item.creator}</Typography>
                  <Typography variant="body2"><b>Date Modified:</b> {item.lastmodified}</Typography>
                  <div className='flex space-x-2 items-center'><Typography variant="body2"><b>DCC Approved:</b></Typography>{item.dccapproved && <CheckCircle sx={{color:"tertiary.main"}} />}</div>
                  <div className='flex space-x-2 items-center'><Typography variant="body2"><b>DRC Approved:</b></Typography>{item.drcapproved && <CheckCircle sx={{color:"tertiary.main"}} />}</div>
                </Stack>
              </ListItem>
              {(idx < props.fileInfo.length-1) && <Divider/>}
            </React.Fragment>
          ))}
        </List>
      )
    } else {
      return (
        <List>
            {props.fileInfo.map((item, idx) => (
              <React.Fragment key={idx}>
                <ListItem>
                  <Stack spacing={1}>
                    <div className='flex space-x-2 items-start'><Typography variant="body2"><b>Filename:</b></Typography><NameCell item={item}/></div>
                    <Typography variant="body2"><b>Creator:</b> {item.creator}</Typography>
                    <Typography variant="body2"><b>Filesize:</b> {item.size}</Typography>
                    <Typography variant="body2"><b>Date Modified:</b> {item.lastmodified}</Typography>
                    <div className='flex space-x-2 items-center'><Typography variant="body2"><b>DCC Approved:</b></Typography>{item.dccapproved && <CheckCircle sx={{color:"tertiary.main"}} />}</div>
                    <div className='flex space-x-2 items-center'><Typography variant="body2"><b>DRC Approved:</b></Typography>{item.drcapproved && <CheckCircle sx={{color:"tertiary.main"}} />}</div>
                  </Stack>
                </ListItem>
                {(idx < props.fileInfo.length-1) && <Divider/>}
              </React.Fragment>
            ))}
          </List>
        )
    }
  } else
  return (
    props.fileInfo.length > 0 ? (
      props.isCode ? (
        <Table sx={{mb:2}}>
        <TableHead>
          <TableRow sx={{backgroundColor: '#edf1f7'}}>
            <TableCell width='45%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}}>Name</TableCell>
            <TableCell width='20%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">Creator</TableCell>
            <TableCell width='15%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">Date Modified</TableCell>
            <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">DCC Approved</TableCell>
            <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">DRC Approved</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.fileInfo.map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell width='45%' style={{wordBreak: "break-word"}} sx={{border:0}}>
                  <NameCell item={item}></NameCell>
                </TableCell>
                <TableCell width='20%' align="center" sx={{border:0}}>{item.creator}</TableCell>
                <TableCell width='15%' align="center" sx={{border:0, fontSize: '11pt'}}>{item.lastmodified}</TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.dccapproved ? (<CheckCircle sx={{color:"tertiary.main"}} />) : (<span />)}
                </TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.drcapproved ? (<CheckCircle sx={{color:"tertiary.main"}} />) : (<span />)}
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
              <TableCell width='35%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}}>Filename</TableCell>
              <TableCell width='20%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">Creator</TableCell>
              <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">Filesize</TableCell>
              <TableCell width='15%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">Date Modified</TableCell>
              <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">DCC Approved</TableCell>
              <TableCell width='10%' sx={{border:0, fontWeight: 'bold', fontSize: '11pt'}} align="center">DRC Approved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {props.fileInfo.map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell width='35%' style={{wordBreak: "break-word"}} sx={{border:0}}>
                  <AccessControledDccAssetLink color="#3470e5" fontSize="11pt" className="underline" href={item.link} target="_blank" rel="noopener" item={item}>
                    {item.filename}
                  </AccessControledDccAssetLink>
                </TableCell>
                <TableCell width='20%' align="center" sx={{border:0}}>{item.creator}</TableCell>
                <TableCell width="10%" align="center" sx={{border:0, fontSize: '11pt'}}>{item.size}</TableCell>
                <TableCell width="15%" align="center" sx={{border:0, fontSize: '11pt'}}>{item.lastmodified}</TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.dccapproved ? (<CheckCircle sx={{color:"tertiary.main"}} />) : (<span />)}
                </TableCell>
                <TableCell width='10%' align="center" sx={{border:0}}>
                  {item.drcapproved ? (<CheckCircle sx={{color:"tertiary.main"}} />) : (<span />)}
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