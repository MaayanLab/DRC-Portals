import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';

export default function SearchField({ q, placeholder = 'Search' }: { q: string, placeholder?: string }) {
  return (
    <>
      <TextField sx={{width: 544}} 
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        InputProps={{
          sx: {borderRadius: 1, height: 50},
          endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
        }}
      />
      <input className="hidden" type="submit" />
    </>
  )
}
