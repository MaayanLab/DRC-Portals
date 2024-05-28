'use client'
import { Chip, Button } from "@mui/material"

export default function ChatExample({example, submit}: {example: string, submit: Function}) {
    return (
        <Button onClick={(evt) => {
            evt.preventDefault()
            submit({
                role: 'user',
                content: example,
                output: null,
                options: null,
                args: null
            })
            }}>
            <Chip label={example} color="primary"/>
        </Button>
    )
}