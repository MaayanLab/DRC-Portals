'use client'
import React from "react";
import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from "@/utils/navigation";

export function SearchForm({ children, name = "q", action }: React.PropsWithChildren<{ name?: string, action?: string }>) {
  const router = useRouter()
  return (
    <form onSubmit={evt => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const searchParams = new URLSearchParams(window.location.search)
      const value = formData.get(name)
      if (value !== null) searchParams.set(name, value.toString())
      else searchParams.delete(name)
      router.push(`${action ? action : window.location.pathname}?${searchParams.toString()}`)
    }}>
      {children}
      <input className="hidden" type="submit" />
    </form>
  )
}

export function SearchField({ name = 'q', defaultValue, InputProps, placeholder = 'Enter one or more keywords', error }: { name?: string, defaultValue: string, InputProps?: React.ComponentProps<typeof TextField>['InputProps'], placeholder?: string, error?: string }) {
  return (
    <TextField
      label={error ? error.split(':')[0] : undefined}
      error={!!error}
      helperText={error ? error.split(':').slice(1).join(':') : undefined}
      name={name}
      defaultValue={defaultValue}
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
