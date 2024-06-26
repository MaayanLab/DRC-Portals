import { Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

import {
  LEFT_COLUMN_MD_WIDTH,
  LEFT_COLUMN_SM_WIDTH,
  LEFT_COLUMN_XS_WIDTH,
  MIDDLE_COLUMN_MD_WIDTH,
  MIDDLE_COLUMN_SM_WIDTH,
  MIDDLE_COLUMN_XS_WIDTH,
  RIGHT_COLUMN_MD_WIDTH,
} from "../../constants/advanced-search";

interface FormRowProps {
  children: ReactNode;
  description: JSX.Element;
  instructions: JSX.Element;
}

export default function TextSearchFormRow(cmpProps: FormRowProps) {
  const { children, description, instructions } = cmpProps;

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
        {children}
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
