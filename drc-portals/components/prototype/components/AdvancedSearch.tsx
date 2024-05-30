"use client";

import { Button, Grid, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

interface FormRowProps {
  description: JSX.Element;
  instructions: JSX.Element;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ROW_SPACING = 1;
const COLUMN_SPACING = 1;
const LEFT_COLUMN_XS_WIDTH = 4;
const MIDDLE_COLUMN_XS_WIDTH = 4;
const LEFT_COLUMN_SM_WIDTH = 3;
const MIDDLE_COLUMN_SM_WIDTH = 6;
const LEFT_COLUMN_MD_WIDTH = 2.5;
const MIDDLE_COLUMN_MD_WIDTH = 5.5;
const RIGHT_COLUMN_MD_WIDTH = 4;
const XS_COLUMNS = 4;
const SM_COLUMNS = 9;
const MD_COLUMNS = 12;

function FormRow(cmpProps: FormRowProps) {
  const { description, instructions, onChange } = cmpProps;

  return (
    <>
      <Grid
        item
        xs={LEFT_COLUMN_XS_WIDTH}
        sm={LEFT_COLUMN_SM_WIDTH}
        md={LEFT_COLUMN_MD_WIDTH}
        alignContent="center"
      >
        <Typography>{description}</Typography>
      </Grid>
      <Grid
        item
        xs={MIDDLE_COLUMN_XS_WIDTH}
        sm={MIDDLE_COLUMN_SM_WIDTH}
        md={MIDDLE_COLUMN_MD_WIDTH}
        alignContent="center"
      >
        <TextField
          fullWidth
          type="search"
          size="small"
          color="secondary"
          onChange={onChange}
        />
      </Grid>
      <Grid
        item
        md={RIGHT_COLUMN_MD_WIDTH}
        alignContent="center"
        display={{ xs: "none", sm: "none", md: "block" }}
      >
        <Typography variant="caption">{instructions}</Typography>
      </Grid>
    </>
  );
}

export default function AdvancedSearch() {
  const router = useRouter();
  const [anyMatchText, setAnyMatchText] = useState("");
  const [phraseMatchText, setPhraseMatchText] = useState("");
  const [allMatchText, setAllMatchText] = useState("");
  const [noneMatchText, setNoneMatchText] = useState("");

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

  const handleSubmit = () => {
    const advancedQuery = createAdvancedQuery();
    const b64Query = btoa(JSON.stringify(advancedQuery));
    router.push(`/data/c2m2/graph/search?q=${b64Query}`);
  };

  return (
    <Grid container rowSpacing={ROW_SPACING}>
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
        <FormRow
          description={<>any of these words:</>}
          instructions={
            <>
              Type the important words: <b>human liver cancer</b>
            </>
          }
          onChange={onAnyMatchChange}
        />
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <FormRow
          description={<>this exact word or phrase:</>}
          instructions={
            <>
              Put exact words in quotes: <b>"liver cancer"</b>
            </>
          }
          onChange={onPhraseMatchChange}
        />
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <FormRow
          description={<>all of these words:</>}
          instructions={
            <>
              Type <b>AND</b> between all the words you want:{" "}
              <b>liver AND cancer</b>
            </>
          }
          onChange={onAllMatchChange}
        />
      </Grid>
      <Grid
        container
        item
        columnSpacing={COLUMN_SPACING}
        columns={{ xs: XS_COLUMNS, sm: SM_COLUMNS, md: MD_COLUMNS }}
      >
        <FormRow
          description={<>none of these words:</>}
          instructions={
            <>
              Put a minus sign just before words you don't want:{" "}
              <b>-human, -"liver cancer"</b>
            </>
          }
          onChange={onNoneMatchChange}
        />
      </Grid>
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
