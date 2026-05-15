"use client";

import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";

import { ColumnData } from "@/components/prototype/interfaces/pathway-search";

interface ColumnsPanelProps {
  columns: ColumnData[];
  onSwitch: (column: number) => void;
  // onShowAllClicked: () => void;
  // onHideAllClicked: () => void;
}

export default function ColumnsPanel(cmpProps: ColumnsPanelProps) {
  const { columns, onSwitch } = cmpProps;

  return (
    <>
      {/* Header */}
      {/* <Box></Box> */}
      {/* Content */}
      <Box paddingX={1}>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            {columns.map((col, idx) => (
              <FormControlLabel
                key={col.key}
                control={
                  <Switch defaultChecked={col.visible} onChange={() => onSwitch(idx)} color="secondary" />
                }
                label={col.label}
                labelPlacement="end"
              />
            ))}
          </FormGroup>
        </FormControl>
      </Box>
      {/* Footer */}
      {/* <Box display="flex" justifyContent="space-between">
        <Button onClick={onShowAllClicked}>Show All</Button>
        <Button onClick={onHideAllClicked}>Hide All</Button>
      </Box> */}
    </>
  );
}
