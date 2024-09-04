import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, TextField } from "@mui/material";
import { ChangeEvent } from "react";

import { PathElement, SearchPath } from "@/lib/neo4j/types";

import { SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS } from "../../constants/advanced-search";

import SchemaAutocomplete from "./SchemaAutocomplete";

interface SchemaSearchFormRowProps {
  value: SearchPath;
  isFirst: boolean;
  isLast: boolean;
  onChange: (value: SearchPath) => void;
  onDelete: () => void;
  onElementSelected: (element: PathElement, index: number) => void;
  onShift: (shiftUp: boolean) => void;
}

export default function SchemaSearchFormRow(
  cmpProps: SchemaSearchFormRowProps
) {
  const {
    value,
    isFirst,
    isLast,
    onChange,
    onDelete,
    onElementSelected,
    onShift,
  } = cmpProps;

  const onAutocompleteChange = (newElements: PathElement[]) => {
    onChange({
      ...value,
      elements: newElements,
    });
  };

  const onLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value);
    onChange({
      ...value,
      limit: Number.isNaN(newLimit) ? 1 : newLimit,
    });
  };

  const onSkipChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSkip = parseInt(event.target.value);
    onChange({
      ...value,
      skip: Number.isNaN(newSkip) ? 1 : newSkip,
    });
  };

  return (
    <Box display={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
        }}
      >
        <IconButton
          disabled={isFirst}
          aria-label="shift path up"
          color="secondary"
          onClick={() => onShift(true)}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          disabled={isLast}
          aria-label="shift path down"
          color="secondary"
          onClick={() => onShift(false)}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flexGrow: 1, margin: 1 }}>
        <SchemaAutocomplete
          value={value.elements}
          onChange={onAutocompleteChange}
          onElementSelected={onElementSelected}
        ></SchemaAutocomplete>
      </Box>
      <TextField
        value={value.limit}
        color="secondary"
        label="Limit"
        name="limit"
        type="number"
        sx={SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS}
        InputProps={{
          sx: {
            backgroundColor: "#fff",
          },
          inputProps: { min: 1, max: 1000 },
        }}
        onChange={onLimitChange}
      ></TextField>
      <TextField
        value={value.skip}
        color="secondary"
        label="Skip"
        name="skip"
        type="number"
        sx={SCHEMA_SEARCH_TEXT_FIELD_SX_PROPS}
        InputProps={{
          sx: {
            backgroundColor: "#fff",
          },
          inputProps: { min: 1 },
        }}
        onChange={onSkipChange}
      ></TextField>
      <Box sx={{ alignContent: "center" }}>
        <IconButton aria-label="delete path" color="error" onClick={onDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
