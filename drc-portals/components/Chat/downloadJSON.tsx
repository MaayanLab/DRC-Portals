import React from 'react'
import { Button } from '@mui/material'


const downloadJSON = (data:any) => {
    const json = JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.json');
    a.click();
  };

export default function DownloadJSON({data}: {data:any}) {
    
    return (
        <>
            <Button variant='outlined' onClick={()=>downloadJSON(data)}>
                <div className='flex-row'>
                Download JSON
                </div>
            </Button>
        </>
    )
}