'use client'
import { Button, Menu, MenuItem, Typography } from "@mui/material"
import { Cite, util } from '@citation-js/core'
import { useState, useMemo, cache } from "react"
import fileDownload from 'js-file-download';
import '@citation-js/plugin-csl'
import '@citation-js/plugin-ris'

const fetch_pmcid = (pmcid:string) => {
    pmcid = pmcid.replace('PMC', '')
    const url = `https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/?format=csl&id=${pmcid}`
    const headers = {}

    return util.fetchFileAsync(url, { headers })
}

const resolve_citation = cache(async (pmcid: string) => {
    const pmc = pmcid.replace('PMC', '')
    const res = await fetch(`https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/?format=csl&id=${pmc}`)
    const val = await res.json()
    
    return val
})

const formats = ['Harvard', 'APA', 'RIS']
const ExportCitation = ({pmcid}: {pmcid:string}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
      };
    const handleClose = () => {
    setAnchorEl(null);
    };
    

    const download_citation = async (format: string) => {
        const val = await resolve_citation(pmcid)
        const c = new Cite(val)
        let formatted = ''
        if (format === 'RIS') {
            formatted = c.format('ris')
        } else if (format === 'Harvard') {
            formatted = c.format('bibliography',  {
                format: 'text',
                template: 'harvard1',
                lang: 'en-US'
              })
        } else  {
            formatted = c.format('bibliography',  {
                format: 'text',
                template: 'apa',
                lang: 'en-US'
              })
        }
        fileDownload(formatted, `${format}.txt`)
        handleClose()
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
