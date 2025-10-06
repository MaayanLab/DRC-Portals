import React, { ReactNode } from 'react';
import { Metadata } from "next";
import CryptoJS from 'crypto-js';
import SQL from '@/lib/prisma/raw';
import { z } from 'zod';
import { filesize } from 'filesize';


export interface MetadataItem {
  label: string;
  value: ReactNode;
}

export interface Category {
  title: string;
  metadata: MetadataItem[];
}
// Function to generate MD5 hash
export const generateMD5Hash = (inputString: string) => {
  return CryptoJS.MD5(inputString).toString();
}

export interface RowType {
  id: string | number; // Adjust the type based on your `id`
  [key: string]: any; // Use 'any' to include all possible row properties
}


export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateHashedJSONFilename(prefix: string, searchParams: any): string {
  // Create download filename for this recordInfo based on md5sum
  // Stringify q and t from searchParams pertaining to this record
  const qString = JSON.stringify(searchParams.q);
  const tString = JSON.stringify(searchParams.t);

  // Concatenate qString and tString into a single string
  const concatenatedString = `${qString}${tString}`;
  const recordInfoHashFileName = generateMD5Hash(concatenatedString);
  const qString_clean = sanitizeFilename(qString, '__');
  const hashedFileName = prefix + "_" + qString_clean + "_" + recordInfoHashFileName + ".json"

  return hashedFileName;
}
export function isURL(str: string): boolean {
  const http_pattern = /^https?:\/\//i;
  const doi_pattern = "doi.org";
  return (!(str === null || str.trim() === '') && (http_pattern.test(str) || str.toLowerCase().includes(doi_pattern)));
}
export function isDRS(str: string): boolean {
  const drs_pattern = /^drs:\/\//i;
  return (!(str === null || str.trim() === '') && (drs_pattern.test(str)));
}

interface HashTable {
  [key: string]: string;
}
const dccIconTable: HashTable = {};
dccIconTable["4DN"] = "/img/4DN.png";
dccIconTable["ERCC"] = "/img/exRNA.png";
dccIconTable["GTEx"] = "/img/GTEx.png";
dccIconTable["GlyGen"] = "/img/glygen.png";
dccIconTable["HMP"] = "/img/HMP.png";
dccIconTable["HuBMAP"] = "/img/HuBMAP.png";
dccIconTable["IDG"] = "/img/IDG.png";
dccIconTable["KFDRC"] = "/img/Kids First.png";
dccIconTable["LINCS"] = "/img/lincs.png";
dccIconTable["MW"] = "/img/Metabolomics.png";
dccIconTable["MoTrPAC"] = "/img/MoTrPAC.png";
dccIconTable["SPARC"] = "/img/SPARC.svg";
dccIconTable["SenNet"] = "/img/SenNet.png";

const dccCFlinkTable: HashTable = {};
dccCFlinkTable["4DN"] = "4DN";
dccCFlinkTable["ERCC"] = "ExRNA";
dccCFlinkTable["GTEx"] = "GTEx";
dccCFlinkTable["GlyGen"] = "GlyGen";
dccCFlinkTable["HMP"] = "HMP";
dccCFlinkTable["HuBMAP"] = "HuBMAP";
dccCFlinkTable["IDG"] = "IDG";
dccCFlinkTable["KFDRC"] = "Kids First";
dccCFlinkTable["LINCS"] = "LINCS";
dccCFlinkTable["MW"] = "Metabolomics";
dccCFlinkTable["MoTrPAC"] = "MoTrPAC";
dccCFlinkTable["SPARC"] = "SPARC";
dccCFlinkTable["SenNet"] = "SenNet";

// For C2M2 schematic: neo4j-based and postgres ERD
const C2M2_neo4j_level0_img = "/img/C2M2_NEO4J_level0.jpg";
const C2M2_ERD_img = "/img/C2M2_ERD_no_FKlabel_edited.jpg";


export function getDCCIcon(iconKey: string): string {
  if (iconKey && dccIconTable.hasOwnProperty(iconKey)) {
    return dccIconTable[iconKey];
  } else {
    return "";
  }
}

export function getdccCFlink(iconKey: string): string {
  if (iconKey && dccCFlinkTable.hasOwnProperty(iconKey)) {
    return dccCFlinkTable[iconKey];
  } else {
    return "";
  }
}

// Function to prune and get column names

interface PruneAndRetrieveColumnNamesResult {
  prunedData: { [key: string]: string | bigint }[];
  columnNames: string[];
  dynamicColumns: string[];
  staticColumns: { [key: string]: string | bigint };
}

export function pruneAndRetrieveColumnNames(
  data: { [key: string]: string | bigint }[],
  full_data: { [key: string]: string | bigint }[],
  columnsToIgnore: string[] = []
): PruneAndRetrieveColumnNamesResult {
  const prunedData = data.filter(row =>
    Object.values(row).some(value => value !== null && value !== "")
  );

  const prunedData_full = full_data.filter(row =>
    Object.values(row).some(value => value !== null && value !== "")
  );

  const columnNames = Array.from(new Set(prunedData_full.flatMap(row => Object.keys(row))));

  var dynamicColumns = columnNames.filter(column => {
    const uniqueValues = new Set(prunedData_full.map(row => row[column]));
    return uniqueValues.size > 1;
  });

  const staticColumns: { [key: string]: string | bigint } = {};
  columnNames.forEach(column => {
    const values = prunedData_full.map(row => row[column]);
    if (new Set(values).size === 1) {
      staticColumns[column] = values[0];
    }
  });

  columnsToIgnore.forEach(column => {
    delete staticColumns[column];
  });

  // Remove columnsToIgnore from dynamicColumns
  dynamicColumns = dynamicColumns.filter(column => !columnsToIgnore.includes(column));

  return {
    prunedData,
    columnNames,
    dynamicColumns,
    staticColumns
  };
}
type PageProps = { searchParams: Record<string, string> }

export function reorderArrayOfObjectsKeys(originalArray: Record<string, any>[], keyOrder: string[]): Record<string, any>[] {
  return originalArray.map(obj => reorderObjectKeys(obj, keyOrder));
}

interface StaticCols {
  [key: string]: string | bigint | null;
}

export function reorderStaticCols(staticCols: StaticCols, priorityFileCols: string[]): StaticCols {
  const reorderedStaticCols: StaticCols = {};

  // Copy key-value pairs from staticCols that are in priorityFileCols
  priorityFileCols.forEach(key => {
    if (staticCols.hasOwnProperty(key)) {
      reorderedStaticCols[key] = staticCols[key];
    }
  });

  // Copy remaining key-value pairs from staticCols
  for (const key in staticCols) {
    if (!reorderedStaticCols.hasOwnProperty(key)) {
      reorderedStaticCols[key] = staticCols[key];
    }
  }

  return reorderedStaticCols;
}

export function reorderObjectKeys(originalObject: Record<string, any>, keyOrder: string[]): Record<string, any> {
  const reorderedObject: Record<string, any> = {};

  keyOrder.forEach(key => {
    if (originalObject.hasOwnProperty(key)) {
      reorderedObject[key] = originalObject[key];
    }
  });

  for (const key in originalObject) {
    if (!reorderedObject.hasOwnProperty(key)) {
      reorderedObject[key] = originalObject[key];
    }
  }

  return reorderedObject;
}


export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}
// Mano: Not sure if use of this function is sql-injection safe
// This is different from search/Page.tsx because it has specifics for this page.
//export function generateFilterQueryString(searchParams: Record<string, string>, tablename: string) {

export function generateQueryForReview(schemaName: string, tableName: string): SQL {
  // The SQL template function ensures proper formatting and sanitization
  return SQL.template`SELECT * FROM "${SQL.raw(schemaName)}"."${SQL.raw(tableName)}"`;
}


export const schemaToDCC = [
  { schema: '_4dn', label: '4DN' },
  { schema: 'ercc', label: 'ERCC' },
  { schema: 'glygen', label: 'GlyGen' },
  { schema: 'gtex', label: 'GTex' },
  { schema: 'hmp', label: 'HMP' },
  { schema: 'hubmap', label: 'HuBMAP' },
  { schema: 'idg', label: 'IDG' },
  { schema: 'kidsfirst', label: 'KidsFirst' },
  { schema: 'lincs', label: 'LINCS' },
  { schema: 'metabolomics', label: 'Metabolomics Workbench' },
  { schema: 'motrpac', label: 'MoTrPAC' },
  { schema: 'sparc', label: 'SPARC' }
];

export const tableToName = [
  { table: 'analysis_type', label: 'Analysis Type' },
  { table: 'anatomy', label: 'Anatomy' },
  { table: 'biofluid', label: 'Biofluid' },
  { table: 'assay_type', label: 'Assay Type' },
  { table: 'biosample', label: 'Biosample' },
  { table: 'biosample_disease', label: 'Biosample - Disease' },
  { table: 'biosample_from_subject', label: 'Biosample from Subject' },
  { table: 'biosample_gene', label: 'Biosample - Gene' },
  { table: 'biosample_in_collection', label: 'Biosample in Collection' },
  { table: 'biosample_substance', label: 'Biosample - Substance' },
  { table: 'collection', label: 'Collection' },
  { table: 'collection_anatomy', label: 'Collection - Anatomy' },
  { table: 'collection_biofluid', label: 'Collection - Biofluid' },
  { table: 'collection_compound', label: 'Collection - Compound' },
  { table: 'collection_defined_by_project', label: 'Collection defined by Project' },
  { table: 'collection_disease', label: 'Collection - Disease' },
  { table: 'collection_gene', label: 'Collection - Gene' },
  { table: 'collection_in_collection', label: 'Collection in Collection' },
  { table: 'collection_phenotype', label: 'Collection - Phenotype' },
  { table: 'collection_protein', label: 'Collection - Protein' },
  { table: 'collection_substance', label: 'Collection - Substance' },
  { table: 'collection_taxonomy', label: 'Collection - Taxonomy' },
  { table: 'compound', label: 'Compound' },
  { table: 'data_type', label: 'Data Type' },
  { table: 'dcc', label: 'DCC' },
  { table: 'disease', label: 'Disease' },
  { table: 'file', label: 'File' },
  { table: 'file_describes_biosample', label: 'File describes Biosample' },
  { table: 'file_describes_collection', label: 'File describes Collection' },
  { table: 'file_describes_subject', label: 'File describes Subject' },
  { table: 'file_format', label: 'File Format' },
  { table: 'file_in_collection', label: 'File in Collection' },
  { table: 'gene', label: 'Gene' },
  { table: 'id_namespace', label: 'ID Namespace' },
  { table: 'ncbi_taxonomy', label: 'NCBI Taxonomy' },
  { table: 'phenotype', label: 'Phenotype' },
  { table: 'phenotype_disease', label: 'Phenotype - Disease' },
  { table: 'phenotype_gene', label: 'Phenotype - Gene' },
  { table: 'project', label: 'Project' },
  { table: 'project_in_project', label: 'Project in Project' },
  { table: 'protein', label: 'Protein' },
  { table: 'protein_gene', label: 'Protein - Gene' },
  { table: 'sample_prep_method', label: 'Sample Prep Method' },
  { table: 'subject', label: 'Subject' },
  { table: 'subject_disease', label: 'Subject - Disease' },
  { table: 'subject_in_collection', label: 'Subject in Collection' },
  { table: 'subject_phenotype', label: 'Subject - Phenotype' },
  { table: 'subject_ethnicity', label: 'Subject - Ethnicity' },
  { table: 'subject_sex', label: 'Subject - Sex' },
  { table: 'subject_race', label: 'Subject - Race' },
  { table: 'subject_role_taxonomy', label: 'Subject Role Taxonomy' },
  { table: 'subject_substance', label: 'Subject - Substance' },
  { table: 'substance', label: 'Substance' },
  { table: 'file_format', label: 'File Format' },
  { table: 'ptm_type', label: 'PTM Type' },
  { table: 'ptm_subtype', label: 'PTM SubType' },
  { table: 'ptm_site_type', label: 'PTM Site Type' }
];

export function generateFilterQueryStringForRecordInfo(searchParams: any, schemaname: string, tablename: string) {
  const filters: SQL[] = [];

  //const tablename = "allres";
  if (searchParams.t) {
    console.log("generateFilterQueryStringForRecordInfo searchParams.t = ", searchParams.t);
    const typeFilters: { [key: string]: SQL[] } = {};

    searchParams.t.forEach((t: any) => {
      if (!typeFilters[t.type]) {
        typeFilters[t.type] = [];
      }
      if (t.entity_type) {

        // t.entity_type is getting sanitized when using the SQL template, but SQL.RAW part is not, 
        // but OK since schemaname, tablename and t.type are set by the DB and not by the user.
        // Sanitization also takes care of single quotes in the middle of strings, etc, so
        // ${t.entity_type.replace(/'/g, "''")} is not needed: ${t.entity_type} is enough.
        const valid_colnames: string[] = ['dcc_name', 'project_local_id', 'disease_name',
          'ncbi_taxonomy_name', 'anatomy_name', 'biofluid_name', 'gene_name', 'protein_name', 'compound_name',
          'data_type_name', 'assay_type_name', 'subject_ethnicity_name', 'subject_sex_name', 'subject_race_name', 'file_format_name', 'ptm_type_name', 'ptm_subtype_name', 'ptm_site_type_name'];

        if (t.entity_type !== "Unspecified") { // was using "null"
          // Change = to ILIKE to accomodate upper and lower cases
          typeFilters[t.type].push(SQL.template`"${SQL.raw(schemaname)}"."${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}" ILIKE ${t.entity_type}`);
        } else {
          typeFilters[t.type].push(SQL.template`"${SQL.raw(schemaname)}"."${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}" is null`);
        }
      }
    });
    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(SQL.template`(${SQL.join(' OR ', ...typeFilters[type])})`);
      }
    }
  }
  //const filterClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const filterConditionStr = filters.length ? SQL.join(' AND ', ...filters) : SQL.empty();
  // console.log("FILTERS LENGTH =");
  // console.log(filters.length)
  console.log("RECORDINFOQUERY filterConditionStr = ", filterConditionStr);
  return filterConditionStr;
}
// Mano: Not sure if use of this function is sql-injection safe
//export function generateFilterQueryString(searchParams: Record<string, string>, tablename: string) {
export function generateFilterQueryString(searchParams: any, tablename: string): SQL {
  let filters = [] as SQL[]

  //const tablename = "allres";
  if (searchParams.t) {
    const typeFilters: { [key: string]: SQL[] } = {};

    searchParams.t.forEach((t: any) => {
      if (!typeFilters[t.type]) {
        typeFilters[t.type] = [];
      }
      if (t.entity_type) {


        // Note that here we use taxonomy and not ncbi_taxonomy as the column in allres is taxonomy_name
        //typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);

        const valid_colnames: string[] = ['dcc', 'disease',
          'taxonomy', 'ncbi_taxonomy', 'anatomy', 'biofluid', 'gene', 'protein', 'compound',
          'data_type', 'assay_type', 'subject_ethnicity', 'subject_sex', 'subject_race', 'file_format', 'ptm_type', 'ptm_subtype', 'ptm_site_type'];

        if (t.entity_type !== "Unspecified") { // was using "null"
          // Change = to ILIKE to accomodate  upper case and lower case entity names
          typeFilters[t.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}_name" ILIKE ${t.entity_type}`);
        } else {
          if (tablename == 'allres') {
            typeFilters[t.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}_name" = 'Unspecified'`);
          } else {
            typeFilters[t.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}_name" is null`);
          }
        }
      }
    });

    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(SQL.template`(${SQL.join(' OR ', ...typeFilters[type])})`);
      }
    }
  }
  //const filterClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const filterConditionStr = filters.length ? SQL.join(' AND ', ...filters) : SQL.empty();
  // console.log("FILTERS LENGTH =");
  // console.log(filters.length)

  return filterConditionStr;
}



export function generateFilterClauseFromtParam(t: { type: string; entity_type: string; }[] | undefined, tablename: string): SQL {
  let filters = [] as SQL[];

  if (t) {
    const typeFilters: { [key: string]: SQL[] } = {};

    t.forEach((item) => {
      if (!typeFilters[item.type]) {
        typeFilters[item.type] = [];
      }
      if (item.entity_type) {

        const valid_colnames: string[] = ['dcc', 'disease',
          'taxonomy', 'ncbi_taxonomy', 'anatomy', 'biofluid', 'gene', 'protein', 'compound',
          'data_type', 'assay_type', 'subject_ethnicity', 'subject_sex', 'subject_race', 'file_format', 'ptm_type', 'ptm_subtype', 'ptm_site_type'];

        if (item.entity_type !== "Unspecified") {
          typeFilters[item.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(item.type, valid_colnames)}_name" ILIKE ${item.entity_type}`);
        } else {
          if (tablename == 'allres') {
            typeFilters[item.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(item.type, valid_colnames)}_name" = 'Unspecified'`);
          } else {
            typeFilters[item.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(item.type, valid_colnames)}_name" is null`);
          }
        }
      }
    });

    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(SQL.template`(${SQL.join(' OR ', ...typeFilters[type])})`);
      }
    }
  }

  const filterConditionStr = filters.length ? SQL.join(' AND ', ...filters) : SQL.empty();

  return filterConditionStr;
}


// Define your Zod schema
export const searchParamsSchema = z.object({
  q: z.union([z.array(z.string()).transform(arr => arr.join(' ')), z.string(), z.undefined()]),
  t: z.string().optional(),
  et: z.string().optional(),
  // Define other fields based on your requirements
});

// Create a type from the schema
export type SearchParamsType = z.infer<typeof searchParamsSchema>;


const dccAbbrTable: { [key: string]: string } = {
  "4D NUCLEOME DATA COORDINATION AND INTEGRATION CENTER": "4DN",
  "The Extracellular Communication Consortium Data Coordination Center": "ExRNA",
  "Genotype-Tissue Expression Project": "GTEx",
  "GlyGen": "GlyGen",
  "The Human Microbiome Project": "HMP",
  "HuBMAP": "HuBMAP",
  "Illuminating the Druggable Genome": "IDG",
  "The Gabriella Miller Kids First Pediatric Research Program": "KFDRC",
  "Library of Integrated Network-based Cellular Signatures": "LINCS",
  "UCSD Metabolomics Workbench": "MW",
  "MoTrPAC Molecular Transducers of Physical Activity Consortium": "MoTrPAC",
  "Stimulating Peripheral Activity to Relieve Conditions": "SPARC"
};

export function getDCCAbbr(iconKey: string): string {
  return dccAbbrTable[iconKey] || "";
}
interface FilterParam {
  type: string;
  entity_type: string;
}

export function getFilterVals(filtParams: FilterParam[] | undefined, textSearchStr: string | undefined): string {
  if (filtParams !== undefined) {
    const entityTypes = filtParams.map(param => {
      if (param.type === "dcc" && param.entity_type) {
        return getDCCAbbr(param.entity_type);
      } else {
        return param.entity_type || "";
      }
    });
    const entityTypesString = entityTypes.join(' > ');

    if (textSearchStr !== undefined) {
      return `${textSearchStr}: ${entityTypesString}`;
    } else {
      return entityTypesString;
    }
  } else {
    return "";
  }
}

const biosamplesSubjectTable: { [key: string]: string } = {
  "biosample_local_id": "Biosample ID",
  "project_local_id": "Project ID",
  "biosample_persistent_id": "Biosample Persistent ID",
  "biosample_creation_time": "Creation time",
  "sample_prep_method_name": "Sample prep method",
  "disease_association_type_name": "Disease association (in all biosamples)",
  "biosample_age_at_sampling": "Age at sampling (in years)",
  "gene_name": "Gene",
  "substance_name": "Substance",
  "subject_local_id": "Subject ID",
  "subject_race_name": "Race",
  "subject_granularity_name": "Granularity",
  "subject_sex_name": "Sex",
  "subject_ethnicity_name": "Ethnicity",
  "subject_role_name": "Role",
  "subject_age_at_enrollment": "Age at enrollment"
};

export function getNameFromBiosampleSubjectTable(iconKey: string): string {
  console.log("Icon key = " + iconKey);
  return biosamplesSubjectTable[iconKey] || "";
}

const biosamplesTable: { [key: string]: string } = {
  "biosample_local_id": "Biosample ID",
  "project_local_id": "Project ID",
  "biosample_persistent_id": "Persistent ID",
  "biosample_creation_time": "Creation time",
  "sample_prep_method_name": "Sample prep method",
  "disease_association_type_name": "Disease association (in all biosamples)",
  "subject_local_id": "Subject ID",
  "biosample_age_at_sampling": "Age at sampling (in years)",
  "gene_name": "Gene",
  "substance_name": "Substance"
};

export function getNameFromBiosampleTable(iconKey: string): string {
  return biosamplesTable[iconKey] || "";
}

const subjectsTable: { [key: string]: string } = {
  "subject_local_id": "Subject ID",
  "subject_race_name": "Race",
  "subject_granularity_name": "Granularity",
  "subject_sex_name": "Sex",
  "subject_ethnicity_name": "Ethnicity",
  "subject_role_name": "Role",
  "subject_age_at_enrollment": "Age at enrollment"
}

export function getNameFromSubjectTable(iconKey: string): string {
  return subjectsTable[iconKey] || "";
}
const collectionsTable: { [key: string]: string } = {
  "collection_local_id": "Collection ID",
  "persistent_id": "Persistent ID",
  "creation_time": "Creation time",
  "abbreviation": "Abbreviation",
  "name": "Name",
  "description": "Description",
  "has_time_series_data": "Has time series data"
}
const ptmTable: { [key: string]: string } = {
  "ptm_id": "PTM ID",
  "collection_id_namespace": "Collection ID Namespace",
  "collection_local_id": "Collection Local ID",
  "protein": "Protein",
  "protein_name": "Protein Name",
  "site_one": "Site One",
  "aa_site_one": "AA Site One",
  "site_two": "Site Two",
  "aa_site_two": "AA Site Two",
  "ptm_site_type": "PTM Site Type",
  "ptm_site_type_name": "PTM Site Type Name",
  "ptm_type": "PTM Type",
  "ptm_type_name": "PTM Type Name",
  "ptm_subtype": "PTM Subtype",
  "ptm_subtype_name": "PTM Subtype Name"
}

export function getNameFromCollectionTable(iconKey: string): string {
  return collectionsTable[iconKey] || "";
}

export function getNameFromPTMTable(iconKey: string): string {
  return ptmTable[iconKey] || "";
}
const fileProjTable: { [key: string]: string } = {
  "local_id": "File ID",
  "file_local_id": "File ID",
  "biosample_local_id": "Biosample ID",
  "subject_local_id": "Subject ID",
  "dbgap_study_id": "dbGaP Study ID",
  "collection_local_id": "Collection ID",
  "bundle_collection_local_id": "Bundle Collection ID",
  "project_local_id": "Project ID",
  "persistent_id": "Persistent ID",
  "access_url": "Access URL",
  "creation_time": "Creation time",
  "size_in_bytes": "Size (bytes)",
  "uncompressed_size_in_bytes": "Uncompressed size (bytes)",
  "sha256": "Hashing (sha256)",
  "md5": "Checksum (md5)",
  "filename": "File name",
  "file_format": "Format",
  "file_format_name": "Format",
  "compression_format": "Compression format",
  "compression_format_name": "Compression format",
  "data_type_name": "Data type",
  "assay_type_name": "Assay type",
  "analysis_type_name": "Analysis type",
  "mime_type": "MIME type",
  "pk_id": "Primary Key"
}

export function getNameFromFileProjTable(iconKey: string): string {
  return fileProjTable[iconKey] || "";
}



export function addCategoryColumns(
  columns: Record<string, ReactNode | string | bigint>,
  getNameFunction: (key: string) => string,
  categoryTitle: string,
  categories: Category[]
) {
  if (!columns || Object.keys(columns).length === 0 || Object.values(columns).every(value => value === null)) return;

  // Check if the category already exists, if not create a new one
  let category = categories.find(c => c.title === categoryTitle);
  if (!category) {
    category = { title: categoryTitle, metadata: [] };
    categories.push(category);
  }

  for (const [key, value] of Object.entries(columns)) {
    if (value !== undefined) { // Check if value is not undefined
      const stringValue = typeof value === 'bigint' ? value.toString() : value;
      /* const metadataItem: MetadataItem = { 
          label: getNameFunction(key), 
          value: stringValue 
        }; */
      category.metadata.push({ label: getNameFunction(key), value: stringValue });
    }
  }
}

// This function sanitizes the known parameters and lets through other parameters



export function useSanitizedSearchParams(props: { searchParams: Record<string, string | string[] | undefined> }) {
  // Helper to safely split only on the first colon
  const splitTypeEntity = (t: string) => {
    const idx = t.indexOf(":");
    return {
      type: idx >= 0 ? t.slice(0, idx) : t,
      entity_type: idx >= 0 ? t.slice(idx + 1) : null
    };
  };

  // Define the schema for known parameters
  const schema = z.object({
    q: z.union([
      z.array(z.string()).transform(qs => qs.join(" ")),
      z.string(),
      z.undefined(),
    ]),
    s: z.union([
      z.array(z.string()).transform(ss => ss[ss.length - 1]),
      z.string(),
      z.undefined(),
    ]).transform(ss => {
      if (!ss) return undefined;
      return splitTypeEntity(ss);
    }),
    p: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length - 1]),
      z.string().transform(p => +p),
      z.undefined().transform(() => 1),
    ]),
    r: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length - 1]),
      z.string().transform(p => +p),
      z.undefined().transform(() => 10),
    ]).transform(r => ({ 10: 10, 20: 20, 50: 50, 100: 100 }[r] ?? 10)),
    t: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split("|") : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(splitTypeEntity) : undefined),
    et: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split("|") : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(splitTypeEntity) : undefined),
  }).passthrough();

  // Parse and return the parameters
  return schema.parse(props.searchParams);
}


/* export function useSanitizedSearchParams(props: { searchParams: Record<string, string | string[] | undefined> }) {
  // Define the schema for known parameters
  const schema = z.object({
    q: z.union([
      z.array(z.string()).transform(qs => qs.join(' ')),
      z.string(),
      z.undefined(),
    ]),
    s: z.union([
      z.array(z.string()).transform(ss => ss[ss.length - 1]),
      z.string(),
      z.undefined(),
    ]).transform(ss => {
      if (!ss) return undefined;
      const [type, entity_type] = ss.split(':');
      return { type, entity_type: entity_type ? entity_type : null };
    }),
    p: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length - 1]),
      z.string().transform(p => +p),
      z.undefined().transform(() => 1),
    ]),
    r: z.union([
      z.array(z.string()).transform(ps => +ps[ps.length - 1]),
      z.string().transform(p => +p),
      z.undefined().transform(() => 10),
    ]).transform(r => ({ 10: 10, 20: 20, 50: 50, 100: 100 }[r] ?? 10)),
    t: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split('|') : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(t => {
      const [type, entity_type] = t.split(':');
      return { type, entity_type: entity_type ? entity_type : null };
    }) : undefined),
    et: z.union([
      z.array(z.string()),
      z.string().transform(ts => ts ? ts.split('|') : undefined),
      z.undefined(),
    ]).transform(ts => ts ? ts.map(t => {
      const [type, entity_type] = t.split(':');
      return { type, entity_type: entity_type ? entity_type : null };
    }) : undefined),
  }).passthrough();

  // Parse and return the parameters
  return schema.parse(props.searchParams);
} */

export function get_partial_list_string(all_count: number, count: number, all_count_limit: number): string {
  return (all_count ?? 0).toLocaleString() +
    ((all_count > all_count_limit) ? " (" + (count ?? 0).toLocaleString() + " listed)" : '')
    ;
}

export function sanitizeFilename(filename: string, repchar: string): string {
  // Define a regular expression that matches invalid characters
  const invalidCharacters = /[\/\\:*?"<>|]/g;
  // Replace invalid characters with an underscore
  // repchar can be '__'
  return filename.replace(invalidCharacters, repchar);
}

export function formatFileSize(bytes: number, locale = 'en-US') {
  return filesize(bytes, { locale });
}

// generate a string of columna names (separated by comma) to use in sql query for selecting column
export function generateSelectColumnsStringPlain(tablename: string = '') {
  let tablenameWithDot = ((tablename) && (tablename.length > 0)) ? (tablename + ".") : '';

  // decorate and sanitize using SQL.template and SQL.raw

  const colnames: string[] = ['dcc_name', 'dcc_abbreviation', 'dcc_short_label',
    'project_local_id', 'taxonomy_name', 'taxonomy_id', 'disease_name', 'disease', 'anatomy_name',
    'anatomy', 'biofluid_name', 'biofluid', 'gene_name', 'gene', 'protein_name', 'protein',
    'compound_name', 'compound', 'data_type_name', 'data_type', 'assay_type_name', 'assay_type', 'subject_ethnicity_name',
    'subject_ethnicity', 'subject_sex_name', 'subject_sex', 'subject_race_name', 'subject_race', 'file_format_name', 'file_format',
    'project_name', 'project_persistent_id', 'ptm_type_name', 'ptm_type', 'ptm_subtype_name', 'ptm_subtype', 'ptm_site_type_name', 'ptm_site_type'];

  const colnamesStringArray = colnames.map(col => tablenameWithDot + col);
  return colnamesStringArray.join(", ");
}

// generate a string of columna names (separated by comma) to use in sql query for selecting column with modification
export function generateSelectColumnsStringModified(tablename: string = '') {
  let tablenameWithDot = ((tablename) && (tablename.length > 0)) ? (tablename + ".") : '';

  // decorate and sanitize using SQL.template and SQL.raw
  const colnamesString =
    "allres_full.dcc_name AS dcc_name, " +
    "allres_full.dcc_abbreviation AS dcc_abbreviation, " +
    "SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label, " +
    "COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id, " +
    "COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name, " +
    "SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id, " +
    "COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name, " +
    "REPLACE(allres_full.disease, ':', '_') AS disease, " +
    "COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name, " +
    "REPLACE(allres_full.anatomy, ':', '_') AS anatomy, " +
    "COALESCE(allres_full.biofluid_name, 'Unspecified') AS biofluid_name, " +
    "REPLACE(allres_full.biofluid, ':', '_') AS biofluid, " +
    "COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name, " +
    "allres_full.gene AS gene," +
    "COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name, " +
    "allres_full.protein AS protein, " +
    "COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name," +
    "allres_full.substance_compound AS compound, " +
    "COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name, " +
    "REPLACE(allres_full.data_type_id, ':', '_') AS data_type, " +
    "COALESCE(allres_full.assay_type_name, 'Unspecified') AS assay_type_name, " +
    "REPLACE(allres_full.assay_type_id, ':', '_') AS assay_type, " +
    "COALESCE(allres_full.subject_ethnicity_name, 'Unspecified') AS subject_ethnicity_name, " +
    "allres_full.subject_ethnicity AS subject_ethnicity, " +
    "COALESCE(allres_full.subject_sex_name, 'Unspecified') AS subject_sex_name, " +
    "allres_full.subject_sex AS subject_sex," +
    "COALESCE(allres_full.subject_race_name, 'Unspecified') AS subject_race_name, " +
    "allres_full.subject_race AS subject_race, " +
    "COALESCE(allres_full.file_format_name, 'Unspecified') AS file_format_name, " +
    "REPLACE(allres_full.file_format_id, ':', '_') AS file_format, " +
    "COALESCE(allres_full.project_name, concat_ws('', 'Dummy: Biosample/Collection(s) from ', " +
    "    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name, " +
    "allres_full.project_persistent_id AS project_persistent_id, " +
    "COALESCE(allres_full.ptm_type_name, 'Unspecified') AS ptm_type_name, " +
    "allres_full.ptm_type AS ptm_type, " +
    "COALESCE(allres_full.ptm_subtype_name, 'Unspecified') AS ptm_subtype_name, " +
    "allres_full.ptm_subtype AS ptm_subtype, " +
    "COALESCE(allres_full.ptm_site_type_name, 'Unspecified') AS ptm_site_type_name, " +
    "allres_full.ptm_site_type AS ptm_site_type"
    ;

  return colnamesString;
}
// generate RecordInfoComponentQueryString
export function groupByRecordInfoQueryString(tablename: string = '') {

  /* dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, taxonomy_id, disease_name, disease, 
                anatomy_name,  anatomy, biofluid_name,  biofluid, gene_name, gene, protein_name, protein, compound_name, compound, data_type_name, 
                data_type, assay_type_name, assay_type, subject_ethnicity_name, subject_ethnicity, subject_sex_name, subject_sex, 
                subject_race_name, subject_race, file_format_name, project_name, c2m2.project.persistent_id, 
                allres_full.project_local_id, project_description, anatomy_description, biofluid_description, disease_description, gene_description, 
                protein_description, compound_description, taxonomy_description */
  const groupByString = "dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, taxonomy_id, disease_name, disease, anatomy_name,  anatomy, " +
    "biofluid_name,  biofluid, gene_name, gene, protein_name, protein, compound_name, compound, data_type_name, " +
    "data_type, assay_type_name, assay_type, file_format_name, file_format, subject_ethnicity_name, subject_ethnicity, " +
    "subject_sex_name, subject_sex, subject_race_name, subject_race, project_name, c2m2.project.persistent_id, " +
    "allres_full.project_local_id, project_description, anatomy_description, biofluid_description, disease_description, gene_description, " +
    "protein_description, compound_description, taxonomy_description, " +
    "ptm_type_name, ptm_type, ptm_type_description, ptm_subtype_name, ptm_subtype, ptm_subtype_description, " +
    "ptm_site_type_name, ptm_site_type, ptm_site_type_description";

  return groupByString;
}

export function orderByRecordInfoQueryString() {
  const orderByString = "dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, " +
    "protein_name, compound_name, data_type_name, assay_type_name, file_format_name, subject_ethnicity_name, " +
    "subject_sex_name, subject_race_name, ptm_type_name, ptm_subtype_name, ptm_site_type_name /*rank DESC*/";
  return orderByString;
}
export function generateRecordInfoColnamesString(tablename: string = '') {

  const colnamesString =
    "allres_full.dcc_name AS dcc_name," +
    "allres_full.dcc_abbreviation AS dcc_abbreviation," +
    "SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label," +
    "COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name," +
    "SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id," +
    "COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name," +
    "REPLACE(allres_full.disease, ':', '_') AS disease," +
    "COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name," +
    "REPLACE(allres_full.anatomy, ':', '_') AS anatomy," +
    "COALESCE(allres_full.biofluid_name, 'Unspecified') AS biofluid_name," +
    "REPLACE(allres_full.biofluid, ':', '_') AS biofluid," +
    "COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name," +
    "allres_full.gene AS gene," +
    "COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name," +
    "allres_full.protein AS protein," +
    "COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name," +
    "allres_full.substance_compound AS compound," +
    "COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name," +
    "REPLACE(allres_full.data_type_id, ':', '_') AS data_type," +
    "COALESCE(allres_full.assay_type_name, 'Unspecified') AS assay_type_name," +
    "REPLACE(allres_full.assay_type_id, ':', '_') AS assay_type," +
    "COALESCE(allres_full.file_format_name, 'Unspecified') AS file_format_name," +
    "REPLACE(allres_full.file_format_id, ':', '_') AS file_format," +
    "COALESCE(allres_full.subject_ethnicity_name, 'Unspecified') AS subject_ethnicity_name," +
    "allres_full.subject_ethnicity AS subject_ethnicity," +
    "COALESCE(allres_full.subject_sex_name, 'Unspecified') AS subject_sex_name," +
    "allres_full.subject_sex AS subject_sex," +
    "COALESCE(allres_full.subject_race_name, 'Unspecified') AS subject_race_name," +
    "allres_full.subject_race AS subject_race," +
    "COALESCE(allres_full.project_name, " +
    "concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name," +
    "c2m2.project.persistent_id AS project_persistent_id," +
    "allres_full.project_local_id AS project_local_id," +
    "c2m2.project.description AS project_description," +
    "c2m2.anatomy.description AS anatomy_description," +
    "c2m2.biofluid.description AS biofluid_description," +
    "c2m2.disease.description AS disease_description," +
    "c2m2.gene.description AS gene_description," +
    "c2m2.protein.description AS protein_description," +
    "c2m2.compound.description AS compound_description," +
    "c2m2.ncbi_taxonomy.description AS taxonomy_description," +
    "COALESCE(allres_full.ptm_type_name, 'Unspecified') AS ptm_type_name," +
    "allres_full.ptm_type AS ptm_type," +
    "c2m2.ptm_type.description AS ptm_type_description," +
    "COALESCE(allres_full.ptm_subtype_name, 'Unspecified') AS ptm_subtype_name," +
    "allres_full.ptm_subtype AS ptm_subtype," +
    "c2m2.ptm_subtype.description AS ptm_subtype_description," +
    "COALESCE(allres_full.ptm_site_type_name, 'Unspecified') AS ptm_site_type_name," +
    "allres_full.ptm_site_type AS ptm_site_type, " +
    "c2m2.site_type.description AS ptm_site_type_description," +
    " ";
  return colnamesString;

}
// generate order by string
export function generateOrderByString(rankColname: string = 'rank') {
  let orderByRankStr = ((rankColname) && (rankColname.length > 0)) ? rankColname + " DESC, " : '';

  // decorate and sanitize using SQL.template and SQL.raw
  const OrderByString: string = orderByRankStr +
    "dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, " +
    "biofluid_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name, " +
    "subject_ethnicity_name, subject_sex_name, subject_race_name, file_format_name, ptm_type_name, ptm_subtype_name, ptm_site_type_name";
  return OrderByString;
}


/* export function update_q_to_exclude_gender(q: string | undefined) {
  const newq: string = q + "-gender";
  return newq;
} */

export function generateFilterStringsForURL(): string {
  return (
    `'|project_local_id:', allres.project_local_id, ` +
    `'|disease_name:', allres.disease_name, ` +
    `'|ncbi_taxonomy_name:', allres.taxonomy_name, ` +
    `'|anatomy_name:', allres.anatomy_name, ` +
    `'|biofluid_name:', allres.biofluid_name, ` +
    `'|gene_name:', allres.gene_name, ` +
    `'|protein_name:', allres.protein_name, ` +
    `'|compound_name:', allres.compound_name, ` +
    `'|data_type_name:', allres.data_type_name, ` +
    `'|assay_type_name:', allres.assay_type_name, ` +
    `'|subject_ethnicity_name:', allres.subject_ethnicity_name, ` +
    `'|subject_sex_name:', allres.subject_sex_name, ` +
    `'|subject_race_name:', allres.subject_race_name, ` +
    `'|file_format_name:', allres.file_format_name, ` +
    `'|ptm_type_name:', allres.ptm_type_name, ` +
    `'|ptm_subtype_name:', allres.ptm_subtype_name, ` +
    `'|ptm_site_type_name:', allres.ptm_site_type_name `
  );
}

// generate a string of columna names (separated by comma) to use in sql query for selecting column with modification
export function generateSelectColumnsForFileQuery(tablename: string = '') {
  const tablenameWithDot = ((tablename) && (tablename.length > 0)) ? (tablename + ".") : '';

  // decorate and sanitize using SQL.template and SQL.raw
  const colnamesString =
    tablenameWithDot + "dcc_name," +
    tablenameWithDot + "dcc_abbreviation," +
    tablenameWithDot + "project_local_id," +
    tablenameWithDot + "project_id_namespace," +
    tablenameWithDot + "ncbi_taxonomy_name as taxonomy_name," +
    tablenameWithDot + "subject_role_taxonomy_taxonomy_id as taxonomy_id," +
    tablenameWithDot + "disease_name," +
    tablenameWithDot + "disease," +
    tablenameWithDot + "anatomy_name," +
    tablenameWithDot + "anatomy," +
    tablenameWithDot + "biofluid_name," +
    tablenameWithDot + "biofluid," +
    tablenameWithDot + "gene," +
    tablenameWithDot + "gene_name," +
    tablenameWithDot + "protein," +
    tablenameWithDot + "protein_name," +
    tablenameWithDot + "substance_compound as compound," +
    tablenameWithDot + "compound_name," +
    tablenameWithDot + "data_type_id AS data_type," +
    tablenameWithDot + "data_type_name," +
    tablenameWithDot + "assay_type_id AS assay_type," +
    tablenameWithDot + "assay_type_name, " +
    // tablenameWithDot + "subject_sex_id AS subject_sex," +
    tablenameWithDot + "subject_sex_name, " +
    //tablenameWithDot + "subject_race_id AS subject_race," +
    tablenameWithDot + "subject_race_name, " +
    // tablenameWithDot + "subject_ethnicity_id AS subject_ethnicity," +
    tablenameWithDot + "subject_ethnicity_name, " +
    tablenameWithDot + "file_format_id AS file_format," +
    tablenameWithDot + "file_format_name, " +
    tablenameWithDot + "ptm_type_name, " +
    tablenameWithDot + "ptm_subtype_name, " +
    tablenameWithDot + "ptm_site_type_name"
    ;

  return colnamesString;
}
