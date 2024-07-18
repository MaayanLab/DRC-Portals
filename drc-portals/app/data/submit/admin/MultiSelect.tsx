'use client'

import React from 'react'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select from '@mui/material/Select'
import { Box, Chip, Theme, useTheme } from '@mui/material'
import { updateForm } from './DataTable'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  sx: {
    "&& .Mui-selected": {
      backgroundColor: "tertiary.main"
    }
  },
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

export type CreateUserFormData = {
  name: string;
  email: string;
  role: string;
  DCC: string[];
};

type CreateUserFormProps = {
  label: string;
  options: string[];
  name: string;
  value?: string[];
  defaultValue?: string[];
  type: 'createUserForm';
  formData: CreateUserFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateUserFormData>>;
  index: number;
};


type UpdateUserFormProps = {
  label: string;
  options: string[];
  name: string;
  value?: string[];
  defaultValue?: string[];
  type: 'updateUserForm';
  formData: updateForm[];
  setFormData: React.Dispatch<React.SetStateAction<updateForm[]>>;
  index: number;
};

type MyComponentProps = CreateUserFormProps | UpdateUserFormProps;



export default function MultiSelect({ label, options, name, value, defaultValue = [], formData, setFormData, type, index }: MyComponentProps) {
  const id = React.useId()
  const theme = useTheme();
  const [values, setValues] = React.useState<string[]>(value ?? defaultValue);

  return (
    <FormControl sx={{ width: 300 }}>
      <InputLabel id={id} sx={{ fontSize: 16 }}>{label}</InputLabel>
      <Select
        labelId={id}
        name={name}
        multiple
        value={values}
        onChange={(evt) => {
          const value = evt.target.value
          setValues(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
          );
          if (type === 'createUserForm') {
            setFormData({ ...formData, [evt.target.name]: value })
          } else if (type === 'updateUserForm') {
            const newFormData = [...formData]
            newFormData[index] = { 'role': formData[index].role, 'DCC': value.toString(), 'index': formData[index].index }
            setFormData(newFormData);

          };
        }}
        input={<OutlinedInput label="Name" />}
        MenuProps={MenuProps}
        sx={{ fontSize: 16 }}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>)}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            style={getStyles(option, values, theme)}
            sx={{ fontSize: 16}}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
