'use client'
import React from "react";
import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { useRouter } from "@/utils/navigation";
import { categoryLabel, create_url, parse_url } from "./utils";
import { Autocomplete, InputAdornment, TextField } from '@mui/material';
import trpc from '@/lib/trpc/client'
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import classNames from "classnames";
import { ensure_array } from "@/utils/array";

export function SearchForm({ children, name, param = "search" }: React.PropsWithChildren<{ name: string, param?: string }>) {
  const router = useRouter()
  return (
    <form onSubmit={evt => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const params = parse_url()
      const value = formData.get(name)
      for (const k in params) {
        if ((k === 'slug' || k === 'type' || k === 'search_type') && params[k] !== 'c2m2') continue
        params[k] = null
      }
      params[param] = value !== null ? value.toString() : null
      router.push(create_url(params))
    }}>
      {children}
      <input className="hidden" type="submit" />
    </form>
  )
}

export function SearchField({ name = 'search', defaultValue, InputProps, placeholder = 'Enter one or more keywords', error, autocomplete }: { name?: string, defaultValue: string, InputProps?: React.ComponentProps<typeof TextField>['InputProps'], placeholder?: string, error?: string, autocomplete?: { source_id?: string, type?: string, facet?: string[] } }) {
  const [value, setValue] = React.useState('')
  React.useEffect(() => {setValue(defaultValue)}, [defaultValue])
  const { data: options } = trpc.autocomplete.useQuery({
    search: value.toLocaleLowerCase(),
    facet: [
      ...ensure_array(autocomplete?.facet),
      ...ensure_array(autocomplete?.type).map(type => `type:"${type}"`),
    ],
    source_id: autocomplete?.source_id,
  }, { staleTime: Infinity, enabled: autocomplete !== undefined && value.length >= 3 })
  const filteredOptionTypes = React.useMemo(() => Object.fromEntries(
    (options ?? [])
      .filter(option => option.a_label.toLowerCase().includes(value.toLowerCase()))
      .map(option => [option.a_label, option.type] as const)
  ), [value, options])
  return (
    <Autocomplete
      value={value}
      freeSolo
      options={Object.keys(filteredOptionTypes)}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option, inputValue, { insideWords: true })
        const parts = parse(option, matches)
        return (
          <li {...props} className={classNames(props.className, 'text-nowrap overflow-hidden')}>
            {parts.map((part, index) => (
              <span
                key={index}
                className={classNames({ 'text-ellipsis overflow-hidden': !part.highlight })}
                style={{
                  fontWeight: part.highlight ? 700 : 400,
                }}
              >
                {part.text}
              </span>
            ))}
            {!autocomplete?.type && <>&nbsp;({categoryLabel(filteredOptionTypes[option])})</>}
          </li>
        )
      }}
      renderInput={params =>
        <TextField
          {...params}
          label={error ? error.split(':')[0] : undefined}
          error={!!error}
          helperText={error ? error.split(':').slice(1).join(':') : undefined}
          name={name}
          onChange={evt => {setValue(evt.currentTarget.value)}}
          placeholder={placeholder}
          color="secondary"
          InputProps={{
            ...(InputProps??{}),
            ...params.InputProps,
            sx: {borderRadius: 1, height: 50, fieldset: { borderColor: "#2D5986" }, ...(InputProps?.sx ?? {})},
            endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>,
          }}
        />
      }
    />
  )
}
