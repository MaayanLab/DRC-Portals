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
  DCC_NAMES,
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
  SUBJECT_GENDERS,
  SUBJECT_RACES,
  XS_COLUMNS,
} from "../../constants/advanced-search";
import {
  createTextSearchParams,
  getTextSearchValues,
} from "../../utils/advanced-search";

import TextSearchFormRow from "./TextSearchFormRow";

export default function TextSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [anyValue, setAnyValue] = useState("");
  const [phraseValue, setPhraseValue] = useState("");
  const [allValue, setAllValue] = useState("");
  const [noneValue, setNoneValue] = useState("");
  const [searchFile, setSearchFile] = useState(true);
  const [searchSubject, setSearchSubject] = useState(true);
  const [searchBiosample, setSearchBiosample] = useState(true);
  const [selectedDccs, setSelectedDccs] = useState<string[]>([]);
  const allDccsSelected = selectedDccs.length === DCC_NAMES.length;
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const allGendersSelected = selectedGenders.length === SUBJECT_GENDERS.size;
  const [selectedRaces, setSelectedRaces] = useState<string[]>([]);
  const allRacesSelected = selectedRaces.length === SUBJECT_RACES.size;

  const resetSubjectFilters = () => {
    setSelectedGenders([]);
    setSelectedRaces([]);
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
    if (!event.target.checked) {
      resetSubjectFilters();
    }
    setSearchSubject(event.target.checked);
  };

  const onSearchBiosampleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchBiosample(event.target.checked);
  };

  const onDccChange = (event: SelectChangeEvent<typeof selectedDccs>) => {
    const {
      target: { value },
    } = event;

    if (value.indexOf("all") > -1) {
      setSelectedDccs(allDccsSelected ? [] : Array.from(DCC_NAMES));
    } else {
      setSelectedDccs(
        // On autofill we get a stringified value.
        typeof value === "string" ? value.split(",") : value
      );
    }
  };

  const onSubjectGenderChange = (
    event: SelectChangeEvent<typeof selectedGenders>
  ) => {
    const {
      target: { value },
    } = event;

    if (value.indexOf("all") > -1) {
      setSelectedGenders(
        allGendersSelected ? [] : Array.from(SUBJECT_GENDERS.keys())
      );
    } else {
      setSelectedGenders(
        // On autofill we get a stringified value.
        typeof value === "string" ? value.split(",") : value
      );
    }
  };

  const onSubjectRaceChange = (
    event: SelectChangeEvent<typeof selectedRaces>
  ) => {
    const {
      target: { value },
    } = event;

    if (value.indexOf("all") > -1) {
      setSelectedRaces(
        allRacesSelected ? [] : Array.from(SUBJECT_RACES.keys())
      );
    } else {
      setSelectedRaces(
        // On autofill we get a stringified value.
        typeof value === "string" ? value.split(",") : value
      );
    }
  };

  const handleSubmit = () => {
    const advancedQuery = createTextSearchParams(
      anyValue,
      phraseValue,
      allValue,
      noneValue,
      searchFile.toString(),
      searchSubject.toString(),
      searchBiosample.toString(),
      selectedGenders,
      selectedRaces,
      selectedDccs
    ).toString();
    router.push(`/data/c2m2/graph/search?${advancedQuery}`);
  };

  useEffect(() => {
    let {
      query,
      anyQuery,
      phraseQuery,
      allQuery,
      noneQuery,
      searchFile,
      searchSubject,
      searchBiosample,
      subjectGenders,
      subjectRaces,
      dccNames,
    } = getTextSearchValues(searchParams);
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
    setSearchFile(searchFile);
    setSearchSubject(searchSubject);
    setSearchBiosample(searchBiosample);
    setSelectedGenders(subjectGenders);
    setSelectedRaces(subjectRaces);
    setSelectedDccs(dccNames);
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
        <TextSearchFormRow
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
        </TextSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <TextSearchFormRow
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
        </TextSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <TextSearchFormRow
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
        </TextSearchFormRow>
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <TextSearchFormRow
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
        </TextSearchFormRow>
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
        <TextSearchFormRow
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
        </TextSearchFormRow>
      </Grid>
      {searchSubject ? (
        <>
          <Grid
            container
            item
            columnSpacing={COLUMN_SPACING}
            columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
          >
            <TextSearchFormRow
              description={<>subject gender:</>}
              instructions={<>Find subjects with this specific gender.</>}
            >
              <FormControl fullWidth size="small">
                <InputLabel
                  id="advanced-search-subject-gender-label"
                  color="secondary"
                >
                  Subject Gender
                </InputLabel>
                <Select
                  labelId="advanced-search-subject-gender-label"
                  id="advanced-search-subject-gender"
                  multiple
                  color="secondary"
                  value={selectedGenders}
                  onChange={onSubjectGenderChange}
                  input={
                    <OutlinedInput label="Subject Gender" color="secondary" />
                  }
                  renderValue={(selected) =>
                    selected.map((s) => SUBJECT_GENDERS.get(s)).join(", ")
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 244,
                      },
                    },
                  }}
                >
                  <MenuItem key={`gender-list-select-all`} value="all">
                    <Checkbox
                      checked={allGendersSelected}
                      indeterminate={
                        selectedGenders.length > 0 &&
                        selectedGenders.length < SUBJECT_GENDERS.size
                      }
                    />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {Array.from(SUBJECT_GENDERS.keys()).map((genderKey) => (
                    <MenuItem
                      key={`gender-list-item-${genderKey}`}
                      value={genderKey}
                    >
                      <Checkbox
                        checked={selectedGenders.indexOf(genderKey) > -1}
                      />
                      <ListItemText primary={SUBJECT_GENDERS.get(genderKey)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TextSearchFormRow>
          </Grid>
          <Grid
            container
            item
            columnSpacing={COLUMN_SPACING}
            columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
          >
            <TextSearchFormRow
              description={<>subject race:</>}
              instructions={<>Find subjects with this specific race.</>}
            >
              <FormControl fullWidth size="small">
                <InputLabel
                  id="advanced-search-subject-race-label"
                  color="secondary"
                >
                  Subject Race
                </InputLabel>
                <Select
                  labelId="advanced-search-subject-race-label"
                  id="advanced-search-subject-race"
                  multiple
                  color="secondary"
                  value={selectedRaces}
                  onChange={onSubjectRaceChange}
                  input={
                    <OutlinedInput label="Subject Race" color="secondary" />
                  }
                  renderValue={(selected) =>
                    selected.map((s) => SUBJECT_RACES.get(s)).join(", ")
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 244,
                      },
                    },
                  }}
                >
                  <MenuItem key={`race-list-select-all`} value="all">
                    <Checkbox
                      checked={allRacesSelected}
                      indeterminate={
                        selectedRaces.length > 0 &&
                        selectedRaces.length < SUBJECT_RACES.size
                      }
                    />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {Array.from(SUBJECT_RACES.keys()).map((raceKey) => (
                    <MenuItem key={`race-list-item-${raceKey}`} value={raceKey}>
                      <Checkbox checked={selectedRaces.indexOf(raceKey) > -1} />
                      <ListItemText primary={SUBJECT_RACES.get(raceKey)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </TextSearchFormRow>
          </Grid>
        </>
      ) : null}
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <TextSearchFormRow
          description={<>connected DCC:</>}
          instructions={<>Find results connected to specific DCCs.</>}
        >
          <FormControl fullWidth size="small">
            <InputLabel id="advanced-search-dcc-label" color="secondary">
              DCC
            </InputLabel>
            <Select
              labelId="advanced-search-dcc-label"
              id="advanced-search-dcc"
              multiple
              color="secondary"
              value={selectedDccs}
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
              <MenuItem key={`dcc-list-select-all`} value="all">
                <Checkbox
                  checked={allDccsSelected}
                  indeterminate={
                    selectedDccs.length > 0 &&
                    selectedDccs.length < DCC_NAMES.length
                  }
                />
                <ListItemText primary="Select All" />
              </MenuItem>
              {DCC_NAMES.map((abbrev) => (
                <MenuItem key={`dcc-list-item-${abbrev}`} value={abbrev}>
                  <Checkbox checked={selectedDccs.indexOf(abbrev) > -1} />
                  <ListItemText primary={abbrev} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TextSearchFormRow>
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
