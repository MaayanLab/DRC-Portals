'use client'
import { Alert, IconButton } from "@mui/material";
import { useS3UploadStatus } from "./S3UploadForm";
import CloseIcon from '@mui/icons-material/Close';
import React, { useEffect, useState } from "react";

export default function Status() {
    let status = useS3UploadStatus();
    const [open, setOpen] = useState<boolean>(false)
    useEffect(
        () => { setOpen(true) },
        [status]
    );

    return (
        <>
            {open && status.error && <Alert severity="error"
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                } sx={{fontSize:14}}> {status.error.message} </Alert>}
            {open && status.loading && <Alert onClose={() => { }} severity="info"
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                } sx={{fontSize:14}}>Upload in Progress!</Alert>}
            {open && status.success && <Alert onClose={() => { }}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                } sx={{fontSize:14}}>Success! File Uploaded</Alert>}
        </>

    )
}
