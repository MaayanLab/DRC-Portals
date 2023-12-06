'use client'
import React from 'react'
import { mdiMagnify } from "@mdi/js";
import Icon from '@mdi/react';
import { Autocomplete, InputAdornment, TextField } from '@mui/material';
import trpc from '@/lib/trpc/client'
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { type_to_string } from './utils';
import { NodeType } from '@prisma/client';

export default function SearchField({ q, width = '275px', placeholder = 'Search', autocomplete, error }: { q: string, width?: number | string, placeholder?: string, autocomplete?: { type?: NodeType, entity_type?: string }, error?: string }) {
  const [search, setSearch] = React.useState(q)
  const { data: options } = trpc.autocomplete.useQuery({
    q: search.toLocaleLowerCase(),
    type: autocomplete?.type,
    entity_type: autocomplete?.entity_type,
  }, { keepPreviousData: true, enabled: autocomplete !== undefined && search.length >= 3 })
  const filteredOptions = React.useMemo(() => (options ?? []).filter(option => option.label.toLowerCase().includes(search.toLowerCase())), [search, options])
  return (
    <>
      <Autocomplete
        freeSolo
        options={filteredOptions}
        renderOption={(props, option, { inputValue }) => {
          const matches = match(option.label, inputValue, { insideWords: true })
          const parts = parse(option.label, matches)
          return (
            <li {...props}>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{
                    fontWeight: part.highlight ? 700 : 400,
                  }}
                >
                  {part.text}
                </span>
              ))}
              &nbsp;({type_to_string(option.type, option.entity_type)})
            </li>
          )
        }}
        renderInput={params =>
          <TextField
            {...params}
            name="q"
            color="secondary"
            label={error ? error.split(':')[0] : undefined}
            error={!!error}
            placeholder={placeholder}
            value={search}
            onChange={evt => {setSearch(() => evt.target.value)}}
            helperText={error ? error.split(':').slice(1).join(':') : undefined}
            InputProps={{
              ...params.InputProps,
              sx: {borderRadius: 1, height: 50, width, fieldset: { borderColor: "#336699" }},
              endAdornment: <InputAdornment position="end"><Icon path={mdiMagnify} size={1} /></InputAdornment>
            }}
          />
        }
      />
      <input className="hidden" type="submit" />
    </>
  )
}
