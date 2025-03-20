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
import type { CodeAsset, DccAsset, FairAssessment, FileAsset } from '@prisma/client'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteAsset } from './getDCCAsset';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CheckCircle, Error } from '@mui/icons-material'
import { generateInsignia } from './FairshakeInsignia';
import { assessAsset } from './assessAsset';


export function FairAssessmentLogDialogButton({ log }: { log: string }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <button className="text-blue-600" onClick={handleClickOpen}>view logs</button>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="lg"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"FAIR Assessment Logs"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        These are the logs that occurred while assessing your asset for FAIRness. Please contact us if you're having trouble deciphering them.
                    </DialogContentText>
                    <textarea className="w-full overflow-auto whitespace-nowrap font-mono" rows={20}>{log}</textarea>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={handleClose}>OK</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

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
    fairAssessment: FairAssessment | undefined;
    type: 'FileAsset';
    role: string;
}

type CodeAssetInfo = {
    open: boolean;
    fileInfo: CodeAsset;
    fairAssessment: FairAssessment | undefined;
    type: 'CodeAsset';
    role: string;
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
                    <TableRow>
                        <TableCell variant="head" align="left" style={{ width: 200 }}>FAIR Assessment</TableCell>
                        <TableCell>
                            {props.fairAssessment ? props.fairAssessment.timestamp.toLocaleString() : 'Pending'}
                            {props.role === 'ADMIN' && <>&nbsp;<button className="text-blue-600" onClick={() => {assessAsset(props.fileInfo)}}>trigger run</button></>}
                            {props.fairAssessment?.log && <>&nbsp;<FairAssessmentLogDialogButton log={props.fairAssessment.log} /></>}
                        </TableCell>
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
                            {props.fileInfo.entityPageExample && <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>Entity Page Example</TableCell>
                                <TableCell><Link color="secondary" href={props.fileInfo.entityPageExample} target="_blank" rel="noopener">{props.fileInfo.name + ' ' + 'Example'}</Link></TableCell>
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
                                <TableCell>{props.fileInfo.openAPISpec ? (<CheckCircle sx={{ color: "tertiary.main" }} />) : ((<Error />))}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell variant="head" align="left" style={{ width: 200 }}>Deposited in SmartAPI</TableCell>
                                <TableCell>{props.fileInfo.smartAPISpec ? (<CheckCircle sx={{ color: "tertiary.main" }} />) : (<Error />)}</TableCell>
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
                    <TableRow>
                        <TableCell variant="head" align="left" style={{ width: 200 }}>FAIR Assessment</TableCell>
                        <TableCell>
                            {props.fairAssessment ? props.fairAssessment.timestamp.toLocaleString() : 'Pending'}
                            {props.role === 'ADMIN' && <>&nbsp;<button className="text-blue-600" onClick={() => {assessAsset(props.fileInfo)}}>trigger run</button></>}
                            {props.fairAssessment?.log && <>&nbsp;<FairAssessmentLogDialogButton log={props.fairAssessment.log} /></>}
                        </TableCell>
                    </TableRow>
                </Table>
            </Box>}
        </Collapse>
    )
}

export function EditButton({ userFile, role }: { userFile: {
    dcc: {
        label: string;
        short_label: string | null
    } | null;
    fileAsset: FileAsset | null;
    codeAsset: CodeAsset | null;
    assetType: string | null;
} & DccAsset, role: string }) {
    if (userFile.codeAsset) {
        return (
            <IconButton color='inherit' href={`/data/submit/urlform?url=${encodeURIComponent(userFile.codeAsset.link)}`}>
                <EditIcon />
            </IconButton>
        )
    } else {
        return <></>
    }
}
export function DeleteDialogButton({ userFile, role }: { userFile: DccAsset, role: string }) {
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

    if (role === 'READONLY') {
        return <></>
    } else {
        return (
            <React.Fragment>
                <IconButton color='inherit' onClick={handleClickOpen}>
                    <DeleteIcon />
                </IconButton>
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
}


export function FileRow({ userFile, approvedSymboldcc, approvedSymbol, currentSymbol, role, fairAssessment }: {
    userFile: {
        dcc: {
            label: string;
            short_label: string | null
        } | null;
        fileAsset: FileAsset | null;
        codeAsset: CodeAsset | null;
        assetType: string | null;
    } & DccAsset, approvedSymboldcc: React.JSX.Element, approvedSymbol: React.JSX.Element, currentSymbol: React.JSX.Element, role: string, 
    fairAssessment: FairAssessment | undefined
}) {
    const [open, setOpen] = React.useState(false);
    const fileInfo = userFile.fileAsset ? { ...userFile.fileAsset } : { ...userFile.codeAsset } as FileAsset | CodeAsset
    const assetInfoType = userFile.fileAsset ? 'FileAsset' : 'CodeAsset'

    React.useEffect(() => {
        if (fairAssessment){
            const rubric = fairAssessment.rubric
            const jsonString = JSON.stringify(rubric)
            if (jsonString) {
                const rubricObject = JSON.parse(jsonString)
                const mockScores = Object.assign({}, Object.values(rubricObject)); 
                const mockMetrics = Object.assign({}, Object.keys(rubricObject)); 
                // const mockScores=  {0: 0.62, 1: 0.75, 2: 0.75, 3: 0.75, 4: 0.5, 5: 0.81, 6: 0.5625, 7: 0.8, 8: 0, 9: 0.67}
                // const mockMetrics = {0: "DCC Provides FAIR C2M2", 1: "DCC Provides FAIR XMTs", 2: "DCC Provides FAIR KG Assertions", 3: "DCC Provides FAIR Attribute Tables", 4: "DCC Provides FAIR ETL Github Link", 5: "DCC Provides FAIR API Links", 6: "DCC Provides FAIR Entity Pages", 7: "DCC Provides FAIR PWB Metanodes", 8: "DCC Provides FAIR Chatbot Specs", 9: "DCC Provides FAIR Apps URLs"}
                let insigniaEl = document.createElement('div')
                insigniaEl.id = userFile.link
                generateInsignia(insigniaEl.id, mockScores, mockMetrics)
                document.getElementById('insiginia-div')?.appendChild(insigniaEl)
            }

        }
    }, [fairAssessment])

    return (
        <>
            <TableRow
                key={userFile.lastmodified.toString()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}><CollapsibleArrow open={open} setOpen={setOpen} /></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"  style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}><div className='flex justify-center' id={userFile.link} style={{width: "50px"}}></div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"  style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}>{userFile.lastmodified.toLocaleString()}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center" style={{whiteSpace: "normal", wordBreak: "break-word"}}>{userFile.creator}</TableCell>
                {userFile.fileAsset ? <TableCell sx={{ fontSize: 14 }} align="center" style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}>{userFile.fileAsset.filetype}</TableCell> : <TableCell sx={{ fontSize: 14 }} align="center" style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}>{userFile.codeAsset?.type}</TableCell>}
                <TableCell sx={{ fontSize: 14 }} align="center"  style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box", whiteSpace: "normal", wordBreak: "break-word"}}>{userFile.dcc?.short_label ?? userFile.dcc_id}</TableCell>
                <TableCell sx={{ fontSize: 14 }} align="right"  style={{width: 100,maxWidth: 100,overflow: "hidden",borderStyle: "border-box"}}> <div className='flex justify-center'>{approvedSymboldcc}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"  style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}><div className='flex justify-center'>{approvedSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"  style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}><div className='flex justify-center'>{currentSymbol}</div></TableCell>
                <TableCell sx={{ fontSize: 14 }} align="center"  style={{width: 100,maxWidth: 100,overflow: "hidden", borderStyle: "border-box"}}><div className='flex justify-center'>
                    <EditButton userFile={userFile} role={role} />
                    <DeleteDialogButton userFile={userFile} role={role} />
                </div></TableCell>
                
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    {assetInfoType === 'FileAsset' && <FileInfo open={open} fileInfo={fileInfo as FileAsset} type='FileAsset' fairAssessment={fairAssessment} role={role} />}
                    {assetInfoType === 'CodeAsset' && <FileInfo open={open} fileInfo={fileInfo as CodeAsset} type='CodeAsset' fairAssessment={fairAssessment} role={role} />}
                </TableCell>
            </TableRow>
        </>
    );
}