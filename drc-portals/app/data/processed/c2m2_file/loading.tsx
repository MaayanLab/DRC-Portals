import { mdiArrowLeft } from "@mdi/js";
import Icon from "@mdi/react";
import { Button } from "@mui/material";
import Link from "@/utils/link";
import React from "react";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable from "@/app/data/processed/SearchablePagedTable";

export default function Page() {
  return (
    <ListingPageLayout
      count={0}
      maxCount={100}
      footer={
        <Link href="/data">
          <Button
            sx={{textTransform: "uppercase"}}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
              BACK TO SEARCH
          </Button>
        </Link>
      }
    >
      <SearchablePagedTable
        loading
        q={''}
        p={1}
        r={10}
        count={0}
        columns={[
          <>&nbsp;</>,
          <>Label</>,
          <>Description</>,
          <>Data Type</>,
          <>Assay Type</>,
        ]}
        rows={[]}
      />
    </ListingPageLayout>
  )
}
