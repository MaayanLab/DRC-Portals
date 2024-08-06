import React from 'react'
import { Button } from '@mui/material'

const convertCSV = (data: any) => {
    let str = '';
    str += Object.keys(data[0]).join(',') + '\r\n';
    data.forEach((obj: any) => {
        let line = '';
        for (const key in obj) {
            if (line !== '') line += ',';
            if (key === 'score_info') {
                // Ensuring the score_info field is properly stringified and enclosed in quotes
                line += `"${JSON.stringify(obj[key]).replace(/"/g, '""')}"`;
            } else {
                line += `"${obj[key]}"`.replace(',', ' ');
            }
        }
        str += line + '\r\n';
    });
    return str;
}

const downloadCSV = (data: any) => {
    const csv = convertCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.csv');
    a.click();
};

export default function DownloadCSV({ data }: { data: any }) {
    return (
        <>
            <Button variant='outlined' onClick={() => downloadCSV(data)}>
                <div className='flex-row'>
                    Download CSV
                </div>
            </Button>
        </>
    );
}
