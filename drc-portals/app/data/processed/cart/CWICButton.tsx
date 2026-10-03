'use client'
// Thank you @dannon
//  https://gist.github.com/dannon/c40f8a2c9d225316db204c3e70e37b39

import React from 'react'
import { Button } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CWIC_URL = 'https://galaxy.cfdeworkspace.org'

export async function createLandingRequest(uris: string[]): Promise<string> {
  const response = await fetch(`${CWIC_URL}/api/data_landings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_state: {
        targets: [
          {
            destination: { type: 'hdas' },
            // `ext` is intentionally omitted -- it defaults to "auto" so Galaxy
            // sniffs the datatype, same as pasting the URIs into the upload box.
            // `auto_decompress` defaults to FALSE, and CFDE serves .tsv.gz, so
            // leaving it off yields a gzip blob instead of a parsed table.
            elements: uris.map((url) =>
              ({ src: 'url', url, auto_decompress: true })
            ),
          },
        ],
      },
      public: true,
      origin: process.env.PUBLIC_URL,
    }),
  })
  if (!response.ok) {
    throw new Error(`Galaxy returned ${response.status}: ${await response.text()}`)
  }
  const { uuid } = await response.json()
  return `${CWIC_URL}/tool_landings/${uuid}?public=true`
}


export default function CWICButton(props: { data: string[] }) {
  const [loading, setLoading] = React.useState(false)
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<CloudUploadIcon />}
      disabled={loading}
      onClick={async (evt) => {
        evt.preventDefault()
        if (loading) return
        setLoading(() => true)
        try {
          window.open(await createLandingRequest(props.data), '__blank')
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(() => false)
        }
      }}
    >
      Export{loading ? 'ing': ''} to CFDE Cloud Workspace
    </Button>
  )
}
