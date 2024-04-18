import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import { ChangeEvent, useEffect, useState } from "react";

import { DEFAULT_QUERY_SETTINGS } from "../../constants/search-bar";
import {
  SearchBarOption,
  SearchQuerySettings,
} from "../../interfaces/search-bar";

import SettingsCard from "./SettingsCard";

export interface SearchSettingsDialogProps {
  open: boolean;
  value: SearchBarOption[];
  settings: SearchQuerySettings;
  onClose: () => void;
  onSubmit: (value: SearchBarOption[], settings: SearchQuerySettings) => void;
}

const pathSettingsDivider = (
  <Box
    sx={{
      height: "16px",
    }}
  ></Box>
);

export default function SearchSettingsDialog(props: SearchSettingsDialogProps) {
  const { open, onClose, onSubmit } = props;
  const [value, setValue] = useState<SearchBarOption[]>(props.value);
  const [settings, setSettings] = useState<SearchQuerySettings>(props.settings);

  useEffect(() => {
    // If the dialog was just opened, make sure it has the latest values from the props
    if (open) {
      setValue(props.value);
      setSettings(props.settings);
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(value, settings);
  };

  const handleReset = () => {
    setSettings(DEFAULT_QUERY_SETTINGS);
    setValue(
      value.map((v) => {
        return { ...v, filters: [] };
      })
    );
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value);
    setSettings({
      ...settings,
      limit: Number.isNaN(newLimit) ? 1 : newLimit,
    });
  };

  const handleSkipChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSkip = parseInt(event.target.value);
    setSettings({
      ...settings,
      skip: Number.isNaN(newSkip) ? 0 : newSkip,
    });
  };

  const updateValueElement = (index: number) => (newValue: SearchBarOption) => {
    const updatedValue = [...value];
    updatedValue[index] = newValue;
    setValue(updatedValue);
  };

  // TODO: While this is fine with the current implementation, it produces kind of weird results in the settings display. A node should
  // probably never sit right next to another node. If a named node/relationship is "deleted", it should probably be replaced by an
  // anonymous equivalent to indicate that, while the node/relationship no longer refers to a specific entity, we still must traverse
  // *something*.
  const deleteValueElement = (index: number) => () => {
    const updatedValue = [...value];
    updatedValue.splice(index, 1);
    setValue(updatedValue);
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth="sm"
      scroll="paper"
      onClose={handleClose}
    >
      <DialogTitle>Search Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ maxHeight: "400px", overflow: "auto" }}>
          <Typography variant="subtitle1" gutterBottom>
            Path Settings
          </Typography>
          <Stack divider={pathSettingsDivider} sx={{ marginBottom: "0.35em" }}>
            {value.map((v, index) => (
              <SettingsCard
                key={`search-settings-card-${index}`}
                value={v}
                liftValue={updateValueElement(index)}
                deleteValue={deleteValueElement(index)}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Pagination Settings
          </Typography>
          <Box
            sx={{
              "& .MuiFormControl-root": { m: "0.35em", width: "25ch" },
              display: "flex",
            }}
          >
            <TextField
              required
              color="secondary"
              label="Limit"
              name="limit"
              type="number"
              value={settings.limit}
              onChange={handleLimitChange}
              InputProps={{ inputProps: { min: 1, max: 1000 } }}
            />
            <TextField
              required
              color="secondary"
              label="Skip"
              name="skip"
              type="number"
              value={settings.skip}
              onChange={handleSkipChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Button color="error" variant="contained" onClick={handleReset}>
              Reset <ReplayIcon />
            </Button>
          </Box>
          <Box>
            <Button color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            {/* TODO: Need to add validation to the form */}
            <Button onClick={handleSubmit} variant="contained">
              <SearchIcon />
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
