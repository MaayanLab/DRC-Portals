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
import type { CodeAsset, DccAsset, FileAsset } from '@prisma/client'
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteAsset } from './getDCCAsset';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CheckCircle, Error } from '@mui/icons-material'



export function CollapsibleArrow({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
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
function formatBytes(bytes: number, decimals: number) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals || 2,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

type FileAssetInfo = {
    open: boolean;
    fileInfo: FileAsset;
    type: 'FileAsset'
}

type CodeAssetInfo = {
    open: boolean;
    fileInfo: CodeAsset;
    type: 'CodeAsset'
}

export function FileInfo(props: FileAssetInfo | CodeAssetInfo) {
    return (
        <Collapse in={props.open} timeout="auto" unmountOnExit>
            {props.type === 'FileAsset' && <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                    File Info
                </Typography>
                <Table>
                    <TableRow>
                        <TableCell variant="head">File</TableCell>
                        <TableCell><Link color="secondary" href={props.fileInfo.link} target="_blank" rel="noopener" style={{ width: 200 }}>{props.fileInfo.filename}</Link></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" style={{ width: 200 }}>File size</TableCell>
                        <TableCell>{props.fileInfo.size ? formatBytes(parseInt(props.fileInfo.size.toString()), 2).toString() : ''}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell variant="head" style={{ width: 200 }}>Checksum (SHA256)</TableCell>
                        <TableCell>{props.fileInfo.sha256checksum ? Buffer.from(props.fileInfo.sha256checksum, 'base64').toString('hex') : ''}</TableCell>
                    </TableRow>
                </Table>
            </Box>}
            {props.type === 'CodeAsset' && <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                    Code Asset Info
                </Typography>
                <Table>
                    {!(props.fileInfo.type === 'API') ?
                        <>
                            <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>URL</TableCell>
                                <TableCell><Link color="secondary" href={props.fileInfo.link} target="_blank" rel="noopener">{props.fileInfo.name}</Link></TableCell>
                            </TableRow>
                            {props.fileInfo.description && <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>Description</TableCell>
                                <TableCell>{props.fileInfo.description}</TableCell>
                            </TableRow>}
                        </>
                        :
                        <>
                            <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>URL</TableCell>
                                <TableCell><Link color="secondary" href={props.fileInfo.link} target="_blank" rel="noopener">{props.fileInfo.name}</Link></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>OpenAPI Specifications</TableCell>
                                <TableCell>{props.fileInfo.openAPISpec ? (<CheckCircle sx={{ color: "#7187C3" }} />) : ((<Error />))}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>Deposited in SmartAPI</TableCell>
                                <TableCell>{props.fileInfo.smartAPISpec ? (<CheckCircle sx={{ color: "#7187C3" }} />) : (<Error />)}</TableCell>
                            </TableRow>
                            {props.fileInfo.smartAPIURL && <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>SmartAPI URL</TableCell>
                                <TableCell >{props.fileInfo.smartAPIURL ? props.fileInfo.smartAPIURL : ''}</TableCell>
                            </TableRow>}
                            {props.fileInfo.description && <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>Description</TableCell>
                                <TableCell >{props.fileInfo.description}</TableCell>
                            </TableRow>}
                        </>}
                </Table>
            </Box>}
        </Collapse>
    )
}

export function DeleteDialogButton({ userFile }: { userFile: DccAsset }) {
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


export function FileRow({ userFile, approvedSymboldcc, approvedSymbol, currentSymbol }: {
    userFile: {
        dcc: {
            label: string;
            short_label: string | null
        } | null;
        fileAsset: FileAsset | null;
        codeAsset: CodeAsset | null;
        assetType: string | null;
    } & DccAsset, approvedSymboldcc: React.JSX.Element, approvedSymbol: React.JSX.Element, currentSymbol: React.JSX.Element
}) {
    const [open, setOpen] = React.useState(false);
    const fileInfo = userFile.fileAsset ? { ...userFile.fileAsset } : { ...userFile.codeAsset } as FileAsset | CodeAsset
    const assetInfoType = userFile.fileAsset ? 'FileAsset' : 'CodeAsset'
    return (
        <>
            <TableRow
                key={userFile.lastmodified.toString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell><CollapsibleArrow open={open} setOpen={setOpen} /></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center" >{userFile.lastmodified.toLocaleString()}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center" style={{
                    whiteSpace: "normal",
                    wordBreak: "break-word"
                }}>{userFile.creator}</TableCell>
                {userFile.fileAsset ? <TableCell sx={{ fontSize: 14 }} align="center">{userFile.fileAsset.filetype}</TableCell> : <TableCell sx={{ fontSize: 14 }} align="center">{userFile.codeAsset?.type}</TableCell>}
                <TableCell sx={{ fontSize: 14 }} align="center">{userFile.dcc?.short_label ?? userFile.dcc_id}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="right"><div className='flex justify-center'>{approvedSymboldcc}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'>{approvedSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'>{currentSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"><div className='flex justify-center'><DeleteDialogButton userFile={userFile} /></div></TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    {assetInfoType === 'FileAsset' && <FileInfo open={open} fileInfo={fileInfo as FileAsset} type='FileAsset' />}
                    {assetInfoType === 'CodeAsset' && <FileInfo open={open} fileInfo={fileInfo as CodeAsset} type='CodeAsset' />}
                </TableCell>
            </TableRow>
        </>
    );
}