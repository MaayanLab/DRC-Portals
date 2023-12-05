import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';

export default function SearchField({ q, width, placeholder = 'Search', error }: { q: string, width?: number | string, placeholder?: string, error?: string }) {
  return (
    <>
      <TextField
        label={error ? error.split(':')[0] : undefined}
        error={!!error}
        helperText={error ? error.split(':').slice(1).join(':') : undefined}
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        InputProps={{
          sx: {borderRadius: 1, height: 50, width, color: "#336699"},
          endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
        }}
      />
      <input className="hidden" type="submit" />
    </>
  )
}
