import React from "react";
import { FancyTab, FancyTabs } from "@/components/misc/FancyTabs";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Button } from "@mui/material";
import Link from "next/link";
import ListingPageLayout from "../ListingPageLayout";
import SearchablePagedTable from "../SearchablePagedTable";
import ErrorRedirect from "./ErrorRedirect";

export default async function Page({ children }: React.PropsWithChildren<{}>) {
  return (
    <FancyTabs
      //preInitializationFallback={<>Loading...</>}
      postInitializationFallback={<ErrorRedirect error={`No results`} />}
    >
      <React.Suspense fallback={
        <FancyTab
          id={`_`}
          label={<>All</>}
          priority={0}
          hidden={false}
        >
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
            q={''}
            p={0}
            r={0}
            columns={[
              <>&nbsp;</>,
              <>Label</>,
              <>Description</>,
            ]}
            rows={[]}
          />
        </ListingPageLayout>
        </FancyTab>
      }>
        {children}
        {/* <C2M2SearchQueryComponent tab {...props} /> */}
      </React.Suspense>
    </FancyTabs>
  )
}
