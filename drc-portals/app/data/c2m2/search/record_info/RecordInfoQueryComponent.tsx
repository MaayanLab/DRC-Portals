import prisma from "@/lib/prisma/c2m2";
import { format_description } from "@/app/data/processed/utils"
import { MetadataItem, getDCCIcon, getdccCFlink, generateRecordInfoColnamesString, generateFilterQueryStringForRecordInfo } from "@/app/data/c2m2/utils"
import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import Link from "@/utils/link";
import { capitalizeFirstLetter, isURL, generateHashedJSONFilename, useSanitizedSearchParams, groupByRecordInfoQueryString, orderByRecordInfoQueryString } from "@/app/data/c2m2/utils"
import SQL from "@/lib/prisma/raw";
import BiosamplesTableComponent from "./BiosamplesTableComponent";
import BiosamplesSubjectTableComponent from "./BiosamplesSubjectsTableComponent";
import SubjectsTableComponent from "./SubjectstableComponent";
import CollectionsTableComponent from "./CollectionsTableComponent";
import FilesProjTableComponent from "./FileProjTableComponent";
import FilesSubjectTableComponent from "./FilesSubjectTableComponent";
import FilesBiosampleTableComponent from "./FileBiosamplesComponent";
import FilesCollectionTableComponent from "./FilesCollectionComponent";
import React from "react";

const file_count_limit = 200000;
const file_count_limit_proj = file_count_limit; // 500000;
const file_count_limit_sub = file_count_limit; // 500000;
const file_count_limit_bios = file_count_limit; // 500000;
const file_count_limit_col = file_count_limit; // 500000;
const maxTblCount = 200000;

type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

export async function RecordInfoQueryComponent(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props);
  console.log("In RecordInfoQueryComponent");

  try {
    const results = await fetchRecordInfoQueryResults(searchParams);
    return results;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return undefined;
  }
}

async function fetchRecordInfoQueryResults(searchParams: any) {
  try {
    const offset = (searchParams.p - 1) * searchParams.r;
    const limit = searchParams.r;

    // console.log("In function fetchRecordInfoQueryResuts");

    console.log("******");
    console.log("q = " + searchParams.q + " p = " + searchParams.p + " offset = " + offset + " limit = " + limit);
    // Declare different offsets for all the tables and this is needed to fine grain pagination
    const bioSamplTbl_p = searchParams.bioSamplTbl_p !== undefined ? searchParams.bioSamplTbl_p : searchParams.p;
    const bioSamplTblOffset = (bioSamplTbl_p - 1) * limit;
    // console.log("bioSamplTbl_p = " + bioSamplTbl_p + " bioSamplTblOffset = " + bioSamplTblOffset);
    const bioSamplSubTbl_p = searchParams.bioSamplSubTbl_p !== undefined ? searchParams.bioSamplSubTbl_p : searchParams.p;
    const bioSamplSubTblOffset = (bioSamplSubTbl_p - 1) * limit;
    // console.log("bioSamplSubTbl_p = " + bioSamplSubTbl_p + " bioSamplSubTblOffset = " + bioSamplSubTblOffset);
    const colTbl_p = searchParams.colTbl_p !== undefined ? searchParams.colTbl_p : 1;
    const colTblOffset = (colTbl_p - 1) * limit;
    // console.log("colTbl_p = " + colTbl_p + " colTblOffset = " + colTblOffset);
    const subTbl_p = searchParams.colTbl_p !== undefined ? searchParams.subTbl_p : 1;
    const subTblOffset = (subTbl_p - 1) * limit;
    // console.log("subTbl_p = " + subTbl_p + " subTblOffset = " + subTblOffset);
    const fileProjTbl_p = searchParams.fileProjTbl_p !== undefined ? searchParams.fileProjTbl_p : 1;
    const fileProjTblOffset = (fileProjTbl_p - 1) * limit;
    // console.log("fileProjTbl_p = " + fileProjTbl_p + " fileProjTblOffset = " + fileProjTblOffset);
    const fileBiosTbl_p = searchParams.fileProjTbl_p !== undefined ? searchParams.fileBiosTbl_p : 1;
    const fileBiosTblOffset = (fileBiosTbl_p - 1) * limit;
    // console.log("fileBiosTbl_p = " + fileBiosTbl_p + " fileBiosTblOffset = " + fileBiosTblOffset);
    const fileSubTbl_p = searchParams.fileSubTbl_p !== undefined ? searchParams.fileSubTbl_p : 1;
    const fileSubTblOffset = (fileSubTbl_p - 1) * limit;
    // console.log("fileSubTbl_p = " + fileSubTbl_p + " fileSubTblOffset = " + fileSubTblOffset);
    const fileColTbl_p = searchParams.fileColTbl_p !== undefined ? searchParams.fileColTbl_p : 1;
    const fileColTblOffset = (fileColTbl_p - 1) * limit;
    // console.log("fileColTbl_p = " + fileColTbl_p + " fileColTblOffset = " + fileColTblOffset);

    // console.log("*********");



    // Generate the query clause for filters

    const filterClause = generateFilterQueryStringForRecordInfo(searchParams, "c2m2", "ffl_biosample_collection");
    const selectCols = generateRecordInfoColnamesString();
    const groupByString = groupByRecordInfoQueryString();
    const orderByString = orderByRecordInfoQueryString();
    console.log("generated FilterClause in RecordInfoQuery");
    // To measure time taken by different parts
    const t0: number = performance.now();

    const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
      records: {
        //rank: number,
        dcc_name: string,
        dcc_abbreviation: string,
        dcc_short_label: string,
        taxonomy_name: string,
        taxonomy_id: string,
        disease_name: string,
        disease: string,
        anatomy_name: string,
        anatomy: string,
        biofluid_name: string,
        biofluid: string,
        gene_name: string,
        gene: string,
        protein_name: string,
        protein: string,
        compound_name: string,
        compound: string,
        data_type_name: string,
        data_type: string,
        assay_type_name: string,
        assay_type: string,
        file_format_name: string,
        file_format: string,
        subject_ethnicity_name: string,
        subject_ethnicity: string,
        subject_sex_name: string,
        subject_sex: string,
        subject_race_name: string,
        subject_race: string,
        project_name: string,
        project_persistent_id: string,
        project_local_id: string,
        project_description: string,
        anatomy_description: string,
        biofluid_description: string,
        disease_description: string,
        gene_description: string,
        protein_description: string,
        compound_description: string,
        taxonomy_description: string,
        ptm_type_name: string, // PTM Type
        ptm_type: string, // PTM Type
        ptm_type_description: string, // PTM Type Description
        ptm_subtype_name: string, // PTM SubType
        ptm_subtype: string, // PTM SubType
        ptm_subtype_description: string, // PTM SubType Description
        count: number, // this is based on across all-columns of ffl_biosample 
      }[],
      sample_prep_method_name_filters: { sample_prep_method_name: string, count: number, }[],
    }>>(SQL.template`
          WITH allres_full AS (
            SELECT DISTINCT c2m2.ffl_biosample_collection.*,
                ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
              FROM c2m2.ffl_biosample_collection
              WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
              ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
              ORDER BY rank DESC
          ),
          allres AS (
            SELECT DISTINCT
              ${SQL.raw(selectCols)}
              COUNT(*)::INT AS count
            FROM allres_full 
            LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
              allres_full.project_local_id = c2m2.project.local_id) 
            LEFT JOIN c2m2.anatomy ON (allres_full.anatomy = c2m2.anatomy.id)
            LEFT JOIN c2m2.biofluid ON (allres_full.biofluid = c2m2.biofluid.id)
            LEFT JOIN c2m2.disease ON (allres_full.disease = c2m2.disease.id)
            LEFT JOIN c2m2.gene ON (allres_full.gene = c2m2.gene.id)
            LEFT JOIN c2m2.protein ON (allres_full.protein = c2m2.protein.id)
            LEFT JOIN c2m2.compound ON (allres_full.substance_compound = c2m2.compound.id)
            LEFT JOIN c2m2.ncbi_taxonomy ON (allres_full.subject_role_taxonomy_taxonomy_id = c2m2.ncbi_taxonomy.id)
            LEFT JOIN c2m2.ptm_type ON (allres_full.ptm_type = c2m2.ptm_type.id)
            LEFT JOIN c2m2.ptm_subtype ON (allres_full.ptm_subtype = c2m2.ptm_subtype.id)
            GROUP BY ${SQL.raw(groupByString)}
            ORDER BY ${SQL.raw(orderByString)}
          ) 
          SELECT
            (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres)
          ;
      `.toPrismaSql()) : [undefined];

    const t1: number = performance.now();

    console.log("Elapsed time for DB queries: ", t1 - t0, "milliseconds");




    //const baseUrl = window.location.origin;

    const resultsRec = results?.records[0];
    console.log("DESCRIPTION PTM SubType = ", resultsRec?.ptm_subtype_description);
    console.log("resultsRec = ", resultsRec);
    const projectLocalId = resultsRec?.project_local_id ?? 'NA';// Assuming it's the same for all rows
    // The following items are present in metadata and downloadMetadata
    const downloadMetadata = {
      project: {
        id: resultsRec?.project_local_id || "",
        name: resultsRec?.project_name || "",
        url: resultsRec?.project_persistent_id || null,
        description: resultsRec?.project_description ?? ""
      },
      dcc: {
        name: resultsRec?.dcc_name || "",
        abbreviation: resultsRec?.dcc_abbreviation || "",
        short_label: resultsRec?.dcc_short_label || "",
        // url: resultsRec?.dcc_short_label ? `/info/dcc/${getdccCFlink(resultsRec?.dcc_short_label)}` : "",
      },
      taxonomy: resultsRec?.taxonomy_name && resultsRec.taxonomy_name !== "Unspecified"
        ? {
          id: resultsRec.taxonomy_id,
          name: resultsRec.taxonomy_name,
          url: `https://www.ncbi.nlm.nih.gov/taxonomy/?term=${resultsRec.taxonomy_id}`,
          description: resultsRec.taxonomy_description || null,
        }
        : null,
      sampleSource: resultsRec?.anatomy_name && resultsRec.anatomy_name !== "Unspecified"
        ? {
          id: resultsRec.anatomy,
          name: resultsRec.anatomy_name,
          url: `http://purl.obolibrary.org/obo/${resultsRec.anatomy}`,
          description: resultsRec.anatomy_description || null,
        }
        : null,
      biofluid: resultsRec?.biofluid_name && resultsRec.biofluid_name !== "Unspecified"
        ? {
          id: resultsRec.biofluid,
          name: resultsRec.biofluid_name,
          url: `http://purl.obolibrary.org/obo/${resultsRec.biofluid}`,
          description: resultsRec.biofluid_description || null,
        }
        : null,
      disease: resultsRec?.disease_name && resultsRec.disease_name !== "Unspecified"
        ? {
          id: resultsRec.disease,
          name: resultsRec.disease_name,
          url: `http://purl.obolibrary.org/obo/${resultsRec.disease}`,
          description: resultsRec.disease_description || null,
        }
        : null,
      gene: resultsRec?.gene_name && resultsRec.gene_name !== "Unspecified"
        ? {
          id: resultsRec.gene,
          name: resultsRec.gene_name,
          url: `http://www.ensembl.org/id/${resultsRec.gene}`,
          description: resultsRec.gene_description ? capitalizeFirstLetter(resultsRec.gene_description) : null,
        }
        : null,
      protein: resultsRec?.protein_name && resultsRec.protein_name !== "Unspecified"
        ? {
          id: resultsRec.protein,
          name: resultsRec.protein_name,
          url: `https://www.uniprot.org/uniprotkb/${resultsRec.protein}`,
          description: resultsRec.protein_description ? capitalizeFirstLetter(resultsRec.protein_description) : null,
        }
        : null,
      compound: resultsRec?.compound_name && resultsRec.compound_name !== "Unspecified"
        ? {
          id: resultsRec.compound,
          name: resultsRec.compound_name,
          url: `http://www.ensembl.org/id/${resultsRec.compound}`,
          description: resultsRec.compound_description ? capitalizeFirstLetter(resultsRec.compound_description) : null,
        }
        : null,
      data_type: resultsRec?.data_type_name && resultsRec.data_type_name !== "Unspecified"
        ? {
          id: resultsRec.data_type,
          name: resultsRec.data_type_name,
          url:
            resultsRec.data_type?.includes("ILX_") || resultsRec.data_type?.includes("ilx_")
              ? `http://uri.interlex.org/${resultsRec.data_type.toLowerCase()}`
              : `http://edamontology.org/${resultsRec.data_type}`,
        }
        : null,
      assay_type: resultsRec?.assay_type_name && resultsRec.assay_type_name !== "Unspecified"
        ? {
          id: resultsRec.assay_type,
          name: resultsRec.assay_type_name,
          url: `http://purl.obolibrary.org/obo/${resultsRec.assay_type}`,
        }
        : null,
      file_format: resultsRec?.file_format_name && resultsRec.file_format_name !== "Unspecified"
        ? {
          id: resultsRec.file_format,
          name: resultsRec.file_format_name
        }
        : null,
      subject_ethnicity: resultsRec?.subject_ethnicity_name && resultsRec.subject_ethnicity_name != "Unspecified"
        ? {
          id: resultsRec.subject_ethnicity,
          name: resultsRec.subject_ethnicity_name
        }
        : null,
      subject_sex: resultsRec?.subject_sex_name && resultsRec.subject_sex_name != "Unspecified"
        ? {
          id: resultsRec.subject_sex,
          name: resultsRec.subject_sex_name
        }
        : null,
      subject_race: resultsRec?.subject_race_name && resultsRec.subject_race_name != "Unspecified"
        ? {
          id: resultsRec.subject_race,
          name: resultsRec.subject_race_name
        }
        : null,
      ptm_type: resultsRec?.ptm_type_name && resultsRec.ptm_type_name !== "Unspecified"
        ? {
          id: resultsRec.ptm_type,
          name: resultsRec.ptm_type_name,
          url: `https://amigo.geneontology.org/amigo/term/${resultsRec.ptm_type}`,
          description: resultsRec.ptm_type_description ? capitalizeFirstLetter(resultsRec.ptm_type_description) : null
        }
        : null,
      ptm_subtype: resultsRec?.ptm_subtype_name && resultsRec.ptm_subtype_name !== "Unspecified"
        ? {
          id: resultsRec.ptm_subtype,
          name: resultsRec.ptm_subtype_name,
          url: `https://amigo.geneontology.org/amigo/term/${resultsRec.ptm_subtype}`,
          description: resultsRec.ptm_subtype_description ? capitalizeFirstLetter(resultsRec.ptm_subtype_description) : null
        }
        : null,
    };

    // Remove null values
    const filteredMetadata = Object.fromEntries(
      Object.entries(downloadMetadata).filter(([_, v]) => v !== null)
    );




    const downloadFilename = generateHashedJSONFilename("Metadata_", searchParams);
    const metadata: (MetadataItem | null)[] = [
      { label: 'Project ID', value: projectLocalId },
      resultsRec?.project_persistent_id && isURL(resultsRec?.project_persistent_id)
        ? { label: 'Project URL', value: <Link href={`${resultsRec?.project_persistent_id}`} className="underline cursor-pointer text-blue-600" target="_blank">{resultsRec?.project_name}</Link> }
        : resultsRec?.project_persistent_id ? { label: 'Project URL', value: resultsRec?.project_persistent_id } : null,
      {
        label: 'DCC',
        value: resultsRec?.dcc_name
      },
      {
        label: 'Taxonomy',
        value: resultsRec?.taxonomy_name && resultsRec?.taxonomy_name !== "Unspecified"
          ? <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${resultsRec?.taxonomy_id}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {resultsRec?.taxonomy_name}
          </Link>
          : /* resultsRec?.taxonomy_name || */ ''
      },
      resultsRec?.taxonomy_description ? { label: 'Taxonomy/Species Description', value: capitalizeFirstLetter(resultsRec?.taxonomy_description) } : null,
      {
        label: 'Sample Source',
        value: resultsRec?.anatomy_name && resultsRec?.anatomy_name !== "Unspecified"
          ? <Link href={`http://purl.obolibrary.org/obo/${resultsRec?.anatomy}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.anatomy_name)}
          </Link>
          : /* resultsRec?.anatomy_name || */ ''
      },
      resultsRec?.anatomy_description ? { label: 'Sample Source Description', value: resultsRec?.anatomy_description } : null,
      {
        label: 'Biofluid',
        value: resultsRec?.biofluid_name && resultsRec?.biofluid_name !== "Unspecified"
          ? <Link href={`http://purl.obolibrary.org/obo/${resultsRec?.biofluid}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.biofluid_name)}
          </Link>
          : /* resultsRec?.biofluid_name || */ ''
      },
      resultsRec?.biofluid_description ? { label: 'Biofluid Description', value: resultsRec?.biofluid_description } : null,
      {
        label: 'Disease',
        value: resultsRec?.disease_name && resultsRec?.disease_name !== "Unspecified"
          ? <Link href={`http://purl.obolibrary.org/obo/${resultsRec?.disease}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.disease_name)}
          </Link>
          : /* resultsRec?.disease_name || */ ''
      },
      resultsRec?.disease_description ? { label: 'Disease Description', value: resultsRec?.disease_description } : null,
      {
        label: 'Gene',
        value: resultsRec?.gene_name && resultsRec?.gene_name !== "Unspecified"
          ? <Link href={`http://www.ensembl.org/id/${resultsRec?.gene}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {resultsRec?.gene_name}
          </Link>
          : /* resultsRec?.gene_name || */ ''
      },
      resultsRec?.gene_description ? { label: 'Gene Description', value: capitalizeFirstLetter(resultsRec?.gene_description) } : null,
      {
        label: 'Protein',
        value: resultsRec?.protein_name && resultsRec?.protein_name !== "Unspecified"
          ? <Link href={`https://www.uniprot.org/uniprotkb/${resultsRec?.protein}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {resultsRec?.protein_name}
          </Link>
          : /* resultsRec?.protein_name || */ ''
      },
      resultsRec?.protein_description ? { label: 'Protein Description', value: capitalizeFirstLetter(resultsRec?.protein_description) } : null,
      {
        label: 'Compound',
        value: resultsRec?.compound_name && resultsRec?.compound_name !== "Unspecified"
          ? <Link href={`http://www.ensembl.org/id/${resultsRec?.compound}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {resultsRec?.compound_name}
          </Link>
          : /* resultsRec?.compound_name || */ ''
      },
      resultsRec?.compound_description ? { label: 'Compound Description', value: capitalizeFirstLetter(resultsRec?.compound_description) } : null,
      {
        label: 'Data type',
        value: resultsRec?.data_type_name && resultsRec?.data_type_name !== "Unspecified"
          ? <Link
            href={resultsRec?.data_type?.includes("ILX_") || resultsRec?.data_type?.includes("ilx_")
              ? `http://uri.interlex.org/${resultsRec?.data_type.toLowerCase()}`
              : `http://edamontology.org/${resultsRec?.data_type}`
            }
            className="underline cursor-pointer text-blue-600"
            target="_blank"
          >
            {capitalizeFirstLetter(resultsRec?.data_type_name)}
          </Link>
          : /* resultsRec?.data_type_name || */ ''
      },
      {
        label: 'Assay type',
        value: resultsRec?.assay_type_name && resultsRec?.assay_type_name !== "Unspecified"
          ? <Link href={`http://purl.obolibrary.org/obo/${resultsRec?.assay_type}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.assay_type_name)}
          </Link>
          : ''
      },
      {
        label: 'File format',
        value: resultsRec?.file_format_name && resultsRec?.file_format_name !== "Unspecified"
          ? <Link href={`http://edamontology.org/${resultsRec?.file_format}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.file_format_name)}
          </Link>
          : ''
      },
      {
        label: 'Subject ethnicity',
        value: resultsRec?.subject_ethnicity_name && resultsRec?.subject_ethnicity_name !== "Unspecified"
          ? capitalizeFirstLetter(resultsRec?.subject_ethnicity_name)
          : ''
      },
      {
        label: 'Subject sex',
        value: resultsRec?.subject_sex_name && resultsRec?.subject_sex_name !== "Unspecified"
          ? capitalizeFirstLetter(resultsRec?.subject_sex_name)
          : ''
      },
      {
        label: 'Subject race',
        value: resultsRec?.subject_race_name && resultsRec?.subject_race_name !== "Unspecified"
          ? capitalizeFirstLetter(resultsRec?.subject_race_name)
          : ''
      },
      {
        label: 'PTM type',
        value: resultsRec?.ptm_type_name && resultsRec?.file_format_name !== "Unspecified"
          ? <Link href={`https://amigo.geneontology.org/amigo/term/${resultsRec?.ptm_type}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.ptm_type_name)}
          </Link>
          : ''
      },
      resultsRec?.ptm_type_description ? { label: 'PTM Type Description', value: capitalizeFirstLetter(resultsRec?.ptm_type_description) } : null,
      {
        label: 'PTM SubType',
        value: resultsRec?.ptm_subtype_name && resultsRec?.file_format_name !== "Unspecified"
          ? <Link href={`https://amigo.geneontology.org/amigo/term/${resultsRec?.ptm_subtype}`} className="underline cursor-pointer text-blue-600" target="_blank">
            {capitalizeFirstLetter(resultsRec?.ptm_subtype_name)}
          </Link>
          : ''
      },
      resultsRec?.ptm_subtype_description ? { label: 'PTM SubType Description', value: capitalizeFirstLetter(resultsRec?.ptm_subtype_description) } : null,
    ];



    // const categories: Category[] = []; // dummy, remove it after making this a optional prop in Landing page
    return (
      <LandingPageLayout
        icon={{
          //href: resultsRec?.dcc_short_label ? `/info/dcc/${resultsRec?.dcc_short_label}` : "",
          href: resultsRec?.dcc_short_label ? `/info/dcc/${getdccCFlink(resultsRec?.dcc_short_label)}` : "",
          //src: getDCCIcon(results ? resultsRec?.dcc_short_label : ""), // Till 2024/05/30 9:50AM PST
          src: getDCCIcon(resultsRec ? resultsRec?.dcc_short_label : ""),
          alt: resultsRec?.dcc_short_label ? resultsRec?.dcc_short_label : ""
        }}
        title={resultsRec?.project_name ?? ""}
        subtitle={""}
        description={format_description(resultsRec?.project_description ?? "")}
        metadata={metadata}
        downloadMetadata={filteredMetadata}
        downloadFilename={downloadFilename}
      //categories={categories}
      >
        {/* <React.Suspense fallback={<>Loading..</>}>
          <BiosamplesTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} bioSamplTblOffset={bioSamplTblOffset} />
        </React.Suspense> */}

        <React.Suspense fallback={<>Loading..</>}>
          <BiosamplesSubjectTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} bioSamplSubTblOffset={bioSamplSubTblOffset} />
        </React.Suspense>


        {/* <React.Suspense fallback={<>Loading..</>}>
          <SubjectsTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} subTblOffset={subTblOffset} />
        </React.Suspense> */}


        <React.Suspense fallback={<>Loading..</>}>
          <CollectionsTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} colTblOffset={colTblOffset} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <FilesProjTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} fileProjTblOffset={fileProjTblOffset} file_count_limit_proj={file_count_limit_proj} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <FilesSubjectTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} fileSubTblOffset={fileSubTblOffset} file_count_limit_sub={file_count_limit_sub} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <FilesBiosampleTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} fileBiosTblOffset={fileBiosTblOffset} file_count_limit_bios={file_count_limit_bios} />
        </React.Suspense>


        <React.Suspense fallback={<>Loading..</>}>
          <FilesCollectionTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit} fileColTblOffset={fileColTblOffset} file_count_limit_col={file_count_limit_col} />
        </React.Suspense>
      </LandingPageLayout>
    )
  } catch (error) {
    console.error('Error fetching record info query results:', error);
    return <div>Error fetching record info query results</div>;
  }
}

// Keep these comments to remind of a trial I already did to improve speed
// Using some code string twice, so, listing it here
// This string doesn't involve anything that the user inputs or something 
// based on that, so, there is no risk of SQL injection here.
// Conclusion based on observing the time taken:
// Since nearly the same query gets executed twice (+ the limit added in the 
// first execution) in this approach of using ${Prisma.sql([file_sub_table_query_code_part2])},
// it actually ends up taking more time for "LINCS 2021" project: 83 vs 96 seconds.
// Thus, we will not use this approach.
/**Mano
const file_sub_table_query_code_part2 = `FROM c2m2.file_describes_subject
INNER JOIN file_table_keycol ON 
(file_table_keycol.local_id = c2m2.file_describes_subject.file_local_id AND 
  file_table_keycol.id_namespace = c2m2.file_describes_subject.file_id_namespace)
INNER JOIN sub_info ON 
(sub_info.subject_local_id = c2m2.file_describes_subject.subject_local_id AND 
  sub_info.subject_id_namespace = c2m2.file_describes_subject.subject_id_namespace)`;

  // Part of code in query:
    file_sub_table_keycol AS (
    SELECT DISTINCT c2m2.file_describes_subject.*
    ** ${Prisma.sql([file_sub_table_query_code_part2])} **
  
  // and
    count_file_sub AS (
    select count(*)::int as count
    ** from (SELECT DISTINCT c2m2.file_describes_subject.* ${Prisma.sql([file_sub_table_query_code_part2])}) **
    from file_sub_table_keycol
  ),

**/

/* Mano: 2024/04/19: will it be much faster to do: ui INNER JOIN f LEFT JOIN dt LEFT JOIN at LEFT JOIN aty */
/* FROM c2m2.file AS f
LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
                LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
                LEFT JOIN c2m2.file_format AS ff ON f.compression_format = ff.id
INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                          AND f.project_id_namespace = ui.project_id_namespace
                          AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) ) */
