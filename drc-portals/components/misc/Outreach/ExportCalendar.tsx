'use client'
import { Button, Grid, IconButton, Tooltip } from "@mui/material"
import { Outreach } from "@prisma/client";
import fileDownload from 'js-file-download';
import Icon from '@mdi/react';
import { mdiCalendar } from "@mdi/js"
import Link from "next/link";
const pad = (n:number) => n < 10 ? `0${n}` : `${n}`
    
const ExportCalendar = ({event}: {event: Outreach}) => {
    const export_event = () => {
    const start_date = event.start_date ? [
        event?.start_date.getUTCFullYear(),
        pad(event?.start_date.getUTCMonth() + 1),
        pad(event?.start_date.getUTCDate()),
        'T',
        pad(event?.start_date.getUTCHours()),
        pad(event?.start_date.getUTCMinutes()),
        pad(event?.start_date.getUTCSeconds()),
        'Z'
        ].join(''): event.application_start ? 
        [
            event?.application_start.getUTCFullYear(),
            pad(event?.application_start.getUTCMonth() + 1),
            pad(event?.application_start.getUTCDate()),
            'T',
            pad(event?.application_start.getUTCHours()),
            pad(event?.application_start.getUTCMinutes()),
            pad(event?.application_start.getUTCSeconds()),
            'Z'
        ].join(''):''
    
    const end_date = event.end_date ? [
        event?.end_date.getUTCFullYear(),
        pad(event?.end_date.getUTCMonth() + 1),
        pad(event?.end_date.getUTCDate()),
        'T',
        pad(event?.end_date.getUTCHours()),
        pad(event?.end_date.getUTCMinutes()),
        pad(event?.end_date.getUTCSeconds()),
        'Z'
        ].join(''): event.application_end ? [
        event?.application_end.getUTCFullYear(),
        pad(event?.application_end.getUTCMonth() + 1),
        pad(event?.application_end.getUTCDate()),
        'T',
        pad(event?.application_end.getUTCHours()),
        pad(event?.application_end.getUTCMinutes()),
        pad(event?.application_end.getUTCSeconds()),
        'Z'
        ].join(''): start_date    

        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CFDEvent//EN
BEGIN:VEVENT
DTSTART:${start_date}
DTEND:${end_date}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
URL:${event.link}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`
        fileDownload(ics, `${event.title}.ics`)
    }
    const now = new Date()
    const event_dates = [event.end_date, event.start_date, event.application_end, event.application_start].filter(i=>i!==null && i > now)
    if (event.ical) {
        return (
            <Grid item>
                <Tooltip title={"Add to Calendar"}><Link href={event.ical} target="_blank" rel="noopener noreferrer"><IconButton color="secondary"><Icon path={mdiCalendar} size={1} /></IconButton></Link></Tooltip>
            </Grid>
        )
    }
    if (event_dates.length === 0)
        return null
    return (
        <Grid item>
            <Tooltip title={"Add to Calendar"}><IconButton onClick={export_event} color="secondary"><Icon path={mdiCalendar} size={1} /></IconButton></Tooltip>
        </Grid>
    )
}

export default ExportCalendar
