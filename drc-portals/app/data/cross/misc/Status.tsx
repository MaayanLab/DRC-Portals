'use client'
import { Alert, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import React, { useEffect, useState } from "react";
import { addStatus } from "./helper_server";

export default function Status({status} : {status: addStatus}) {
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
                } sx={{fontSize:14}}>Adding gene sets to your session cart...</Alert>}
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
                } sx={{fontSize:14}}>Added to Session Cart</Alert>}
        </>

    )
}