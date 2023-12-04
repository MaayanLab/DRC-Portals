'use client'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

export default function DCCSelect(props: { dccOptions: string }) {
  const [dcc, setDCC] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setDCC(event.target.value);
  };

  const dccArray = props.dccOptions.split(',')
  return (
    <div>
      <FormControl sx={{ minWidth: 80 }}>
        <InputLabel id="select-dcc"
          sx={{fontSize: 16 }}
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
        >
          {dccArray.map((dcc) => {
            return <MenuItem key={dcc} value={dcc} sx={{fontSize: 16}}>{dcc}</MenuItem>
          })}
        </Select>
      </FormControl>
    </div>
  );
}