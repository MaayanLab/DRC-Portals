'use client'
import React from "react";
import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from "@/utils/navigation";

export function SearchForm({ children, action }: React.PropsWithChildren<{ action?: string }>) {
  const router = useRouter()
  return (
    <form onSubmit={evt => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const q = formData.get('q')
      router.push(`${action ? action : window.location.pathname}?q=${q}`)
    }}>
      {children}
      <input className="hidden" type="submit" />
    </form>
  )
}

export function SearchField({ q, InputProps, placeholder = 'Enter one or more keywords', error }: { q: string, InputProps?: React.ComponentProps<typeof TextField>['InputProps'], placeholder?: string, error?: string }) {
  return (
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
  )
}
