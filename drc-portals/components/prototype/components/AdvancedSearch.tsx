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
import { ChangeEvent, useEffect, useState } from "react";

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
  const [anyValue, setAnyValue] = useState("");
  const [phraseValue, setPhraseValue] = useState("");
  const [allValue, setAllValue] = useState("");
  const [noneValue, setNoneValue] = useState("");
  const [searchFile, setSearchFile] = useState(true);
  const [searchSubject, setSearchSubject] = useState(true);
  const [searchBiosample, setSearchBiosample] = useState(true);
  const [dccName, setDccName] = useState<string[]>([]);

  const createAdvancedQuery = () => {
    const searchParams = new URLSearchParams();
    searchParams.set("as_q", anyValue);
    searchParams.set("as_epq", phraseValue);
    searchParams.set("as_aq", allValue);
    searchParams.set("as_eq", noneValue);

    return searchParams.toString();
  };

  const onAnyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnyValue(event.target.value);
  };

  const onPhraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhraseValue(event.target.value);
  };

  const onAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAllValue(event.target.value);
  };

  const onNoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNoneValue(event.target.value);
  };

  const onSearchFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFile(event.target.checked);
  };

  const onSearchSubjectChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchSubject(event.target.checked);
  };

  const onSearchBiosampleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchBiosample(event.target.checked);
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
    router.push(`/data/c2m2/graph/search?${advancedQuery}`);
  };

  useEffect(() => {
    let query = searchParams.get("q") || "";
    const anyQuery = searchParams.get("as_q") || "";
    const phraseQuery = searchParams.get("as_epq") || "";
    const allQuery = searchParams.get("as_aq") || "";
    const noneQuery = searchParams.get("as_eq") || "";
    const phraseQueryRegex = /(["'])(?:(?=(\\?))\2.)*?\1/;
    const allQueryRegex = /\B\+\w+/g;
    const noneQueryRegex = /\B\-\w+/g;
    const extractedAllQuery = Array.from(query.matchAll(allQueryRegex))
      .map((m) => m[0].slice(1))
      .join(" ");
    const extractedNoneQuery = Array.from(query.matchAll(noneQueryRegex))
      .map((m) => m[0].slice(1))
      .join(" ");

    // If the phrase query is empty, try extracting a phrase from "q"
    if (phraseQuery.length === 0) {
      const extractedExactPhraseQuery = (
        Array.from(query.match(phraseQueryRegex) || [])[0] || ""
      ).slice(1, -1);
      query = query.replace(phraseQueryRegex, ""); // Remove the first phrase term
      setPhraseValue(extractedExactPhraseQuery);
    } else {
      // Otherwise set the phrase field to the url param
      setPhraseValue(phraseQuery);
    }

    // Extract any other special query terms from "q"
    query = query
      .replaceAll(allQueryRegex, "") // Remove all exlusion terms
      .replaceAll(noneQueryRegex, ""); // Remove all inclusion terms

    setAnyValue(`${query.trim()} ${anyQuery}`.trim());
    setAllValue(`${allQuery} ${extractedAllQuery}`.trim());
    setNoneValue(`${noneQuery} ${extractedNoneQuery}`.trim());
  }, []);

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
            value={anyValue}
            size="small"
            color="secondary"
            onChange={onAnyChange}
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
            value={phraseValue}
            size="small"
            color="secondary"
            onChange={onPhraseChange}
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
              Put a plus sign just before the words you want:{" "}
              <b>+human, +"liver cancer"</b>
            </>
          }
        >
          <TextField
            fullWidth
            value={allValue}
            size="small"
            color="secondary"
            onChange={onAllChange}
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
            value={noneValue}
            size="small"
            color="secondary"
            onChange={onNoneChange}
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
                  value={searchFile}
                  checked={searchFile}
                  onChange={onSearchFileChange}
                />
              }
              label="File"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={searchSubject}
                  checked={searchSubject}
                  onChange={onSearchSubjectChange}
                />
              }
              label="Subject"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={searchBiosample}
                  checked={searchBiosample}
                  onChange={onSearchBiosampleChange}
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
