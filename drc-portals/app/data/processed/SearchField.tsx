import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';

export default function SearchField({ q }: { q: string }) {
  return (
    <>
      <TextField
        sx={{width: 400}}
        placeholder='Search'
        name="q"
        defaultValue={q}
        InputProps={{
          sx: {borderRadius: 1, height: 50},
          endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
        }}
      />
      <input className="hidden" type="submit" />
    </>
  )
}
