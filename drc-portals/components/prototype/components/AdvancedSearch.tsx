"use client";

import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useState } from "react";

import {
  COLUMN_SPACING,
  DCC_NAMES_MAP,
  LEFT_COLUMN_MD_WIDTH,
  LEFT_COLUMN_SM_WIDTH,
  LEFT_COLUMN_XS_WIDTH,
  MD_COLUMNS,
  MIDDLE_COLUMN_MD_WIDTH,
  MIDDLE_COLUMN_SM_WIDTH,
  MIDDLE_COLUMN_XS_WIDTH,
  RIGHT_COLUMN_MD_WIDTH,
  ROW_SPACING,
  SM_COLUMNS,
  XS_COLUMNS,
} from "../constants/advanced-search";

import AdvancedSearchFormRow from "./AdvancedSearch/AdvancedSearchFormRow";

export default function AdvancedSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [anyMatchText, setAnyMatchText] = useState(
    atob(searchParams.get("q") || "")
  );
  const [phraseMatchText, setPhraseMatchText] = useState("");
  const [allMatchText, setAllMatchText] = useState("");
  const [noneMatchText, setNoneMatchText] = useState("");
  const [includeFile, setIncludeFile] = useState(true);
  const [includeSubject, setIncludeSubject] = useState(true);
  const [includeBiosample, setIncludeBiosample] = useState(true);
  const [dccName, setDccName] = useState<string[]>([]);

  const createAdvancedQuery = () => {
    const any = anyMatchText;
    const phrase = phraseMatchText.length === 0 ? "" : `"${phraseMatchText}"`;
    const all =
      allMatchText.length === 0
        ? ""
        : `(${allMatchText.split(" ").join(" AND ")})`;
    const none =
      noneMatchText.length === 0
        ? ""
        : noneMatchText
            .split(" ")
            .map((s) => `-${s}`)
            .join(" ");

    return `${any} ${phrase} ${all} ${none}`.trim();
  };

  const onAnyMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnyMatchText(event.target.value);
  };

  const onPhraseMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhraseMatchText(event.target.value);
  };

  const onAllMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAllMatchText(event.target.value);
  };

  const onNoneMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNoneMatchText(event.target.value);
  };

  const onIncludeFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIncludeFile(event.target.checked);
  };

  const onIncludeSubjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIncludeSubject(event.target.checked);
  };

  const onIncludeBiosampleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIncludeBiosample(event.target.checked);
  };

  const onDccChange = (event: SelectChangeEvent<typeof dccName>) => {
    const {
      target: { value },
    } = event;
    setDccName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleSubmit = () => {
    const advancedQuery = createAdvancedQuery();
    const b64Query = btoa(JSON.stringify(advancedQuery));
    router.push(`/data/c2m2/graph/search?q=${b64Query}`);
  };

  return (
    <Grid container rowSpacing={ROW_SPACING}>
      {/* Find Terms Rows */}
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <Grid
          item
          xs={LEFT_COLUMN_XS_WIDTH}
          sm={LEFT_COLUMN_SM_WIDTH}
          md={LEFT_COLUMN_MD_WIDTH}
          alignContent="center"
        >
          <Typography variant="h4" color="secondary">
            Find terms with...
          </Typography>
        </Grid>
        <Grid
          item
          xs={MIDDLE_COLUMN_XS_WIDTH}
          sm={MIDDLE_COLUMN_SM_WIDTH}
          md={MIDDLE_COLUMN_MD_WIDTH}
        ></Grid>
        <Grid
          item
          md={RIGHT_COLUMN_MD_WIDTH}
          alignContent="center"
          display={{ xs: "none", sm: "none", md: "block" }}
        >
          <Typography variant="subtitle1" color="secondary">
            <b>To do this in the graph search box</b>
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <AdvancedSearchFormRow
          description={<>any of these words:</>}
          instructions={
            <>
              Type the important words: <b>human liver cancer</b>
            </>
          }
        >
          <TextField
            fullWidth
            value={anyMatchText}
            size="small"
            color="secondary"
            onChange={onAnyMatchChange}
          />
        </AdvancedSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <AdvancedSearchFormRow
          description={<>this exact word or phrase:</>}
          instructions={
            <>
              Put exact words in quotes: <b>"liver cancer"</b>
            </>
          }
        >
          <TextField
            fullWidth
            value={phraseMatchText}
            size="small"
            color="secondary"
            onChange={onPhraseMatchChange}
          />
        </AdvancedSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <AdvancedSearchFormRow
          description={<>all of these words:</>}
          instructions={
            <>
              Type <b>AND</b> between all the words you want:{" "}
              <b>liver AND cancer</b>
            </>
          }
        >
          <TextField
            fullWidth
            value={allMatchText}
            size="small"
            color="secondary"
            onChange={onAllMatchChange}
          />
        </AdvancedSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <AdvancedSearchFormRow
          description={<>none of these words:</>}
          instructions={
            <>
              Put a minus sign just before words you don't want:{" "}
              <b>-human, -"liver cancer"</b>
            </>
          }
        >
          <TextField
            fullWidth
            value={noneMatchText}
            size="small"
            color="secondary"
            onChange={onNoneMatchChange}
          />
        </AdvancedSearchFormRow>
      </Grid>
      {/* Divider Row */}
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <Grid item xs={XS_COLUMNS} sm={SM_COLUMNS} md={MD_COLUMNS}>
          <Divider />
        </Grid>
      </Grid>
      {/* Narrow Results Rows */}
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <Grid
          item
          xs={LEFT_COLUMN_XS_WIDTH}
          sm={LEFT_COLUMN_SM_WIDTH}
          md={LEFT_COLUMN_MD_WIDTH}
          alignContent="center"
        >
          <Typography variant="h4" color="secondary">
            Then narrow your results by...
          </Typography>
        </Grid>
        <Grid
          item
          xs={MIDDLE_COLUMN_XS_WIDTH}
          sm={MIDDLE_COLUMN_SM_WIDTH}
          md={MIDDLE_COLUMN_MD_WIDTH}
        ></Grid>
        <Grid
          item
          md={RIGHT_COLUMN_MD_WIDTH}
          display={{ xs: "none", sm: "none", md: "block" }}
        ></Grid>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <AdvancedSearchFormRow
          description={<>connected core entities:</>}
          instructions={<>Find specific core entities.</>}
        >
          <FormGroup row sx={{ justifyContent: "space-between" }}>
            <FormControlLabel
              control={
                <Checkbox
                  value={includeFile}
                  checked={includeFile}
                  onChange={onIncludeFileChange}
                />
              }
              label="File"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={includeSubject}
                  checked={includeSubject}
                  onChange={onIncludeSubjectChange}
                />
              }
              label="Subject"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={includeBiosample}
                  checked={includeBiosample}
                  onChange={onIncludeBiosampleChange}
                />
              }
              label="Biosample"
            />
          </FormGroup>
        </AdvancedSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <AdvancedSearchFormRow
          description={<>connected DCC:</>}
          instructions={<>Find results connected to specific DCCs.</>}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="demo-multiple-checkbox-label" color="secondary">
              DCC
            </InputLabel>
            <Select
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              color="secondary"
              value={dccName}
              onChange={onDccChange}
              input={<OutlinedInput label="DCC" color="secondary" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 244,
                  },
                },
              }}
            >
              {Array.from(DCC_NAMES_MAP.entries()).map(([abbrev, _]) => (
                <MenuItem key={abbrev} value={abbrev}>
                  <Checkbox checked={dccName.indexOf(abbrev) > -1} />
                  <ListItemText primary={abbrev} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AdvancedSearchFormRow>
      </Grid>
      {/* Search Button Row */}
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <Grid
          item
          xs={LEFT_COLUMN_XS_WIDTH}
          sm={LEFT_COLUMN_SM_WIDTH}
          md={LEFT_COLUMN_MD_WIDTH}
        ></Grid>
        <Grid
          item
          xs={MIDDLE_COLUMN_XS_WIDTH}
          sm={MIDDLE_COLUMN_SM_WIDTH}
          md={MIDDLE_COLUMN_MD_WIDTH}
          display="flex"
          flexDirection="row-reverse"
          alignContent="center"
        >
          <Button variant="contained" color="secondary" onClick={handleSubmit}>
            Advanced Search
          </Button>
        </Grid>
        <Grid
          item
          md={RIGHT_COLUMN_MD_WIDTH}
          display={{ xs: "none", sm: "none", md: "block" }}
        ></Grid>
      </Grid>
    </Grid>
  );
}
