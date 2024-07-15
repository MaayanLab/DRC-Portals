import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';

export default function SearchField({ q, InputProps, placeholder = 'Enter one or more keywords', error }: { q: string, InputProps?: React.ComponentProps<typeof TextField>['InputProps'], placeholder?: string, error?: string }) {
  return (
    <>
      <TextField
        label={error ? error.split(':')[0] : undefined}
        error={!!error}
        helperText={error ? error.split(':').slice(1).join(':') : undefined}
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        color="secondary"
        InputProps={{
          sx: {borderRadius: 1, height: 50, fieldset: { borderColor: "#2D5986" }, ...(InputProps?.sx ?? {})},
          endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>,
          ...(InputProps??{}),
        }}
      />
      <input className="hidden" type="submit" />
    </>
  )
}
