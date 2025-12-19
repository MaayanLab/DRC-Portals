'use client'
import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from "@/utils/navigation";

export function SearchForm({ children }: React.PropsWithChildren<{}>) {
  const router = useRouter()
  return (
    <form onSubmit={evt => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const value = formData.get("search")
      router.push(`/data/c2m2/search/${value}`)
    }}>
      {children}
      <input className="hidden" type="submit" />
    </form>
  )
}

export function SearchField({ defaultValue, InputProps, placeholder = 'Enter one or more keywords', error }: { defaultValue: string, InputProps?: React.ComponentProps<typeof TextField>['InputProps'], placeholder?: string, error?: string }) {
  return (
    <>
      <TextField
        label={error ? error.split(':')[0] : undefined}
        error={!!error}
        helperText={error ? error.split(':').slice(1).join(':') : undefined}
        name="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        color="secondary"
        InputProps={{
          ...(InputProps??{}),
          sx: {borderRadius: 1, height: 50, fieldset: { borderColor: "#2D5986" }, ...(InputProps?.sx ?? {})},
          endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
        }}
      />
    </>
  )
}
