'use client'
import React from "react";
import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';
import { useRouter } from "@/utils/navigation";
import { create_url, parse_url } from "./utils";

export function SearchForm({ children, name = "search" }: React.PropsWithChildren<{ name?: string }>) {
  const router = useRouter()
  return (
    <form onSubmit={evt => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const params = parse_url()
      const value = formData.get(name)
      if (value !== null) params[name] = value.toString()
      else delete params[name]
      params['page'] = null
      params['cursor'] = null
      params['reverse'] = null
      params['facet'] = null
      router.push(create_url(params))
    }}>
      {children}
      <input className="hidden" type="submit" />
    </form>
  )
}

export function SearchField({ name = 'search', defaultValue, InputProps, placeholder = 'Enter one or more keywords', error }: { name?: string, defaultValue: string, InputProps?: React.ComponentProps<typeof TextField>['InputProps'], placeholder?: string, error?: string }) {
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
