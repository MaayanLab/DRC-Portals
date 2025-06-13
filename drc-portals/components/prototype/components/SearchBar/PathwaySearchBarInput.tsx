import { TextField } from "@mui/material";

import PathwaySearchBarEndAdornment from "./PathwaySearchBarEndAdornment";

interface PathwaySearchBarInputProps {
  inputParams: any;
}

export default function PathwaySearchBarInput(
  cmpProps: PathwaySearchBarInputProps
) {
  const { inputParams } = cmpProps;
  return (
    <TextField
      {...inputParams}
      color="secondary"
      label='Search CV Terms ("diabetes", "human", etc...)'
      InputProps={{
        ...inputParams.InputProps,
        sx: {
          backgroundColor: "#FFF",
        },
        endAdornment: <PathwaySearchBarEndAdornment />,
      }}
      FormHelperTextProps={{
        ...inputParams.FormHelperTextProps,
        style: { backgroundColor: "transparent" },
      }}
    />
  );
}
