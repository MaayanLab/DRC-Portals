'use client'
import { Chip, Button } from "@mui/material"

export default function ChatExample({example, submit}: {example: string, submit: Function}) {
    return (
        <Button onClick={(evt) => {
            evt.preventDefault()
            submit()
        }}>
            <Chip label={example} color="primary"/>
        </Button>
    )
}