import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import { useSanitizedSearchParams } from "@/app/data/c2m2/utils"
import { MetaDataQueryComponent } from "./MetaDataQueryComponent";
import { BiosamplesTableComponent } from "./BiosamplesTableComponent";
import { SubjectstableComponent } from "./SubjectstableComponent";
import { CollectionsTableComponent } from "./CollectionsTableComponent";
import { FileProjTableComponent } from "./FileProjTableComponent";
import { FileBiosamplesComponent } from "./FileBiosamplesComponent";
import { FilesCollectionComponent } from "./FilesCollectionComponent";
import { FilesSubjectTableComponent } from "./FilesSubjectTableComponent";
import React from "react";



type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

export async function RecordInfoQueryComponent(props: PageProps) {

  console.log("In RecordInfoQueryComponent");

  try {
    const searchParams = useSanitizedSearchParams(props);
    const schemaName = "c2m2";
    const tableName = "ffl_biosample_collection";

    return (
      <LandingPageLayout
        title={""}
        subtitle={""}
        description={""}
      >
        <React.Suspense fallback={<>Loading..</>}>
          <MetaDataQueryComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>

        <React.Suspense fallback={<>Loading..</>}>
          <BiosamplesTableComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <SubjectstableComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <CollectionsTableComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <FileProjTableComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>

        <React.Suspense fallback={<>Loading..</>}>
          <FileBiosamplesComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>

        <React.Suspense fallback={<>Loading..</>}>
          <FilesSubjectTableComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>

        <React.Suspense fallback={<>Loading..</>}>
          <FilesCollectionComponent searchParams={searchParams} schemaName={schemaName} tableName={tableName} />
        </React.Suspense>



      </LandingPageLayout>
    );
  } catch (error) {
    console.error('Error fetching record info query results:', error);
    return "<div>Error fetching record info query results</div>";
  }
}

