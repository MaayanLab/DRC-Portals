'use client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IconButton, Link, Typography } from '@mui/material';
import * as React from 'react';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import type { DccAsset } from '@prisma/client'
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteAsset } from './getDCCAsset';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


export function CollapsibleArrow({open, setOpen}: {open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>}) {
    return (
        <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
        >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
    );
}

// gotten from https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c 
function formatBytes(bytes: number,decimals: number) {
    if(bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
 }

export function FileInfo({ open, fileInfo }: {
    open: boolean;
    fileInfo: {
        fileName: string,
        fileLink: string,
        sha256checksum: string | null
        filesize: BigInt | null
    }
}
) {
    return (
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                    Asset Info
                </Typography>
                {fileInfo.filesize ?               
                <Table>
                    <TableRow>
                        <TableCell variant="head">File</TableCell>
                        <TableCell><Link color="secondary" href={fileInfo.fileLink} target="_blank" rel="noopener">{fileInfo.fileName}</Link></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head">Checksum (SHA256)</TableCell>
                        <TableCell>{fileInfo.sha256checksum ? Buffer.from(fileInfo.sha256checksum, 'base64').toString('hex') : ''}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head">File size</TableCell>
                        <TableCell>{fileInfo.filesize ? fileInfo.filesize.toString() : ''}</TableCell>
                    </TableRow>
                </Table>  :
                <Table>
                    <TableRow>
                        <TableCell variant="head">File</TableCell>
                        <TableCell><Link color="secondary" href={fileInfo.fileLink} target="_blank" rel="noopener">{fileInfo.fileName}</Link></TableCell>
                    </TableRow>
                </Table> 
                }

            </Box>
        </Collapse>
    )
}

export function DeleteDialogButton({userFile} : {userFile: DccAsset}) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const deleteRow = () => {
        deleteAsset(userFile);
        handleClose();
    }
  
    return (
      <React.Fragment>
        <button onClick={handleClickOpen}>
          <DeleteIcon />
        </button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Delete Uploaded File?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this file? Deleting files is permanent and cannot be undone
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={handleClose}>No</Button>
            <Button color="secondary" onClick={deleteRow} autoFocus>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );    
}

export function FileRow({userFile, approvedSymboldcc, approvedSymbol, currentSymbol} : {userFile: {dcc: {
    label: string;
} | null;
} & DccAsset, approvedSymboldcc: React.JSX.Element, approvedSymbol: React.JSX.Element, currentSymbol: React.JSX.Element}) {
    const [open, setOpen] = React.useState(false);



    return (
        <>
            <TableRow
                key={userFile.lastmodified.toString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell><CollapsibleArrow open={open} setOpen={setOpen}/></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center" >{userFile.lastmodified.toLocaleString()}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.creator}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.filetype}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.dcc?.label ?? userFile.dcc_id}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="right"><div className='flex justify-center'>{approvedSymboldcc}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'>{approvedSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'>{currentSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'><DeleteDialogButton userFile={userFile}/></div></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <FileInfo open={open} fileInfo={{ 'fileLink': userFile.link, 'fileName': userFile.filename, 'sha256checksum': userFile.sha256checksum, 'filesize': userFile.size }} />
                </TableCell>
            </TableRow>
        </>
    );
}