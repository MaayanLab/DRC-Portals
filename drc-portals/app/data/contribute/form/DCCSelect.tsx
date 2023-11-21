'use client'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

export default function DCCSelect(props: {dccOptions: string}) {
  const [dcc, setDCC] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setDCC(event.target.value);
  };

  console.log(props.dccOptions)
  const dccArray = props.dccOptions.split(',')
  return (
    <div>
      <FormControl sx={{minWidth: 80 }}>
        <InputLabel id="select-dcc">DCC</InputLabel>
        <Select
          labelId="select-dcc"
          id="simple-select"
          value={dcc}
          onChange={handleChange}
          autoWidth
          required
          label="DCC"
          name="dcc"
        >
        {dccArray.map((dcc) => {
            return  <MenuItem key={dcc} value={dcc}>{dcc}</MenuItem>
        })}
        </Select>
      </FormControl>
    </div>
  );
}