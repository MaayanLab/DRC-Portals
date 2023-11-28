'use client'

import React from 'react'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select from '@mui/material/Select'
import { Theme, useTheme } from '@mui/material'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultiSelect({ label, options, name, value, defaultValue = [] }: { label: string, options: string[], name: string, defaultValue?: string[], value?: string[] }) {
  const id = React.useId()
  const theme = useTheme();
  const [values, setValues] = React.useState<string[]>(value ?? defaultValue);

  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id={id} sx={{fontSize: 16}}>{label}</InputLabel>
      <Select
        labelId={id}
        name={name}
        multiple
        value={values}
        disabled
        onChange={(evt) => {
          const value = evt.target.value
          setValues(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
          );
        }}
        input={<OutlinedInput label="Name" />}
        MenuProps={MenuProps}
        sx={{fontSize: 16}}
      >
        {options.map((option) => (
            <MenuItem
                key={option}
                value={option}
                style={getStyles(option, values, theme)}
                sx={{fontSize: 16}}
            >
                {option}
            </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
