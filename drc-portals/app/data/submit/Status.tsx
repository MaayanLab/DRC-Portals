'use client'
import { Alert, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import React, { useEffect, useState } from "react";


export type StatusType = {
    success?: {
        selected: boolean;
        message: string
    },
    loading?: {
        selected: boolean;
        message: string
    },
    error?: {
        selected: boolean;
        message: string
    },
}


export default function Status({ status }: { status: StatusType }) {
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
                } sx={{ fontSize: 14 }}> {status.error.message} </Alert>}
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
                } sx={{ fontSize: 14 }}>{status.loading.message}</Alert>}
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
                } sx={{ fontSize: 14 }}> {status.success.message}</Alert>}
        </>

    )
}
