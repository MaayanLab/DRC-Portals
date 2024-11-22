'use client'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

export function DCCSelect({dccOptions, dcc, setDCC}: { dccOptions: string, dcc:string, setDCC: Function}) {

  const handleChange = (event: SelectChangeEvent) => {
    setDCC(event.target.value);
  };

  const dccArray = dccOptions.split(',')
  return (
    <div>
      <FormControl sx={{ minWidth: 80 }}>
        <InputLabel id="select-dcc"
          sx={{fontSize: 16 }} color='secondary' 
        >DCC</InputLabel>
        <Select
          labelId="select-dcc"
          id="simple-select"
          value={dcc}
          onChange={handleChange}
          autoWidth
          required
          label="DCC"
          name="dcc"
          sx={{fontSize: 16}}
          color='secondary' 
        >
          {dccArray.map((dcc) => {
            return <MenuItem key={dcc} value={dcc} sx={{fontSize: 16}}>{dcc}</MenuItem>
          })}
        </Select>
      </FormControl>
    </div>
  );
}

const fileTypeArray : string[] = [
  'C2M2',
  'Attribute Table',
  'KG Assertions',
  'XMT'
]

export function FileTypeSelect({filetype='', setFiletype}: {filetype: string, setFiletype: Function}) {
  // const [filetype, setFiletype] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setFiletype(event.target.value);
  };

  return (
    <div>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="select-file-asset-type"
          sx={{fontSize: 16 }} color='secondary' 
        >File Asset Type</InputLabel>
        <Select
          labelId="select-file-asset-type"
          id="filetype-select"
          value={filetype}
          onChange={handleChange}
          autoWidth
          required
          label="File Asset Type"
          name="fileAssetType"
          sx={{fontSize: 16}}
          color='secondary' 
        >
          {fileTypeArray.map((assetType) => {
            return <MenuItem key={assetType} value={assetType} sx={{fontSize: 16}}>{assetType}</MenuItem>
          })}
        </Select>
      </FormControl>
    </div>
  );
}