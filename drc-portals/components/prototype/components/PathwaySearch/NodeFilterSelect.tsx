import {
  Autocomplete,
  AutocompleteChangeReason,
  CircularProgress,
  TextField,
} from "@mui/material";

import { SyntheticEvent, useState } from "react";

import { fetchTermsByLabel } from "@/lib/neo4j/api";

import { filterCarouselItemWidth } from "../../constants/pathway-search";

interface NodeFilterSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function NodeFilterSelect(cmpProps: NodeFilterSelectProps) {
  const { label, onChange } = cmpProps;
  const [value, setValue] = useState<string | null>(cmpProps.value || null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOptions = async () => {
    const response = await fetchTermsByLabel(label);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  };

  const handleOpen = () => {
    setOpen(true);

    // If we already fetched the options, we don't need to do it again
    if (options.length > 0) {
      return;
    }

    (async () => {
      setLoading(true);

      try {
        const options = await getOptions();
        setOptions(options);
      } catch (e) {
        console.error(e);
        setError(
          `An error occurred fetching options for ${label}. Please try again later.`
        );
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  const handleOnChange = (
    event: SyntheticEvent,
    value: string | null,
    reason: AutocompleteChangeReason
  ) => {
    setValue(value);
    onChange(value || "");
  };

  return (
    <Autocomplete
      sx={{ width: `${filterCarouselItemWidth}px` }}
      value={value}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={handleOnChange}
      isOptionEqualToValue={(option, value) => option === value}
      getOptionLabel={(option) => option}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          helperText={error}
          error={error !== null}
          InputProps={{
            ...params.InputProps,
            sx: {
              backgroundColor: "#FFF",
            },
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
