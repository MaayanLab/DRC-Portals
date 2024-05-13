'use client'
import { Button, Menu, MenuItem, Typography } from "@mui/material"
import { Cite, util } from '@citation-js/core'
import { useState } from "react"
import fileDownload from 'js-file-download';
require('@citation-js/plugin-csl')
require('@citation-js/plugin-ris')
require('@citation-js/plugin-bibtex')

const fetch_pmcid = (pmcid:string) => {
    pmcid = pmcid.replace('PMC', '')
    const url = `https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/?format=csl&id=${pmcid}`
    const headers = {}

    return util.fetchFileAsync(url, { headers })
}

const formats = ['Harvard', 'APA', 'RIS']
const ExportCitation = ({pmcid}: {pmcid:string}) => {
    const [citation, setCitation] = useState(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
      };
      const handleClose = () => {
        setAnchorEl(null);
      };

    const resolve_citation = async () => {
        if (!citation) {
            const val = await fetch_pmcid(pmcid)
            const c = new Cite(val)
            setCitation(c)
            return c
        } else return citation
        
    }

    const download_citation = async (format: string) => {
        handleClose()
        const citation = await resolve_citation()
        let formatted = ''
        if (format === 'RIS') {
            formatted = citation.format('ris')
        } else if (format === 'Harvard') {
            formatted = citation.format('bibliography',  {
                format: 'text',
                template: 'harvard1',
                lang: 'en-US'
              })
        } else  {
            formatted = citation.format('bibliography',  {
                format: 'text',
                template: 'apa',
                lang: 'en-US'
              })
        }
        fileDownload(formatted, `${format}.txt`)
    }
    return (
        <>
            <Button onClick={handleClick} color="secondary">Export Citation</Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                'aria-labelledby': 'basic-button',
                }}
            >   {formats.map(format=>(
                    <MenuItem key={format} onClick={()=>download_citation(format)}><Typography variant="caption" color="secondary">{format}</Typography></MenuItem>
                ))}
            </Menu>
        </>
    )
}

export default ExportCitation
