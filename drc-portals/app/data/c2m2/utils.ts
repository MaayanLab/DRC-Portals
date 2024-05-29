import React, { ReactNode } from 'react';
import { Metadata } from "next";
import CryptoJS from 'crypto-js';
import SQL from '@/lib/prisma/raw';
import { SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { z } from 'zod';


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

export function isURL(str: string): boolean {
    const http_pattern = /^http/i;
    const drs_pattern = /^drs:\/\//i;
    const doi_pattern = "doi.org";
      return ( !(str === null || str.trim() === '') && ( http_pattern.test(str) || drs_pattern.test(str) || str.toLowerCase().includes(doi_pattern)) ); 
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
dccIconTable["LINCS"] = "/img/LINCS.gif";
dccIconTable["MW"] = "/img/Metabolomics.png";
dccIconTable["MoTrPAC"] = "/img/MoTrPAC.png";
dccIconTable["SPARC"] = "/img/SPARC.svg";

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

    const dynamicColumns = columnNames.filter(column => {
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
    [key: string]: string | null;
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
    { table: 'assay_type', label: 'Assay Type' },
    { table: 'biosample', label: 'Biosample' },
    { table: 'biosample_disease', label: 'Biosample - Disease' },
    { table: 'biosample_from_subject', label: 'Biosample from Subject' },
    { table: 'biosample_gene', label: 'Biosample - Gene' },
    { table: 'biosample_in_collection', label: 'Biosample in Collection' },
    { table: 'biosample_substance', label: 'Biosample - Substance' },
    { table: 'collection', label: 'Collection' },
    { table: 'collection_anatomy', label: 'Collection - Anatomy' },
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
    { table: 'subject_race', label: 'Subject - Race' },
    { table: 'subject_role_taxonomy', label: 'Subject Role Taxonomy' },
    { table: 'subject_substance', label: 'Subject - Substance' },
    { table: 'substance', label: 'Substance' }
];

export function generateFilterQueryStringForRecordInfo(searchParams: any, schemaname: string, tablename: string) {
    const filters: SQL[] = [];

    //const tablename = "allres";
    if (searchParams.t) {
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
                'ncbi_taxonomy_name', 'anatomy_name', 'gene_name', 'protein_name', 'compound_name', 
                'data_type_name'];
                //typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
                if (t.entity_type !== "Unspecified") { // was using "null"
                    //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = '${t.entity_type}'`);
                    typeFilters[t.type].push(SQL.template`"${SQL.raw(schemaname)}"."${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}" = ${t.entity_type}`);
                } else {
                    typeFilters[t.type].push(SQL.template`"${SQL.raw(schemaname)}"."${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}" is null`);
                    //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = 'Unspecified'`);
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
  
            const valid_colnames: string[] = ['dcc', 'disease', 
            'taxonomy', 'anatomy', 'gene', 'protein', 'compound', 
            'data_type']; // Note that here we use taxonomy and not ncbi_taxonomy as the column in allres is taxonomy_name
    //typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
          if (t.entity_type !== "Unspecified") { // was using "null"
            //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = '${t.entity_type}'`);
            //typeFilters[t.type].push(SQL.template`${SQL.raw`"${tablename}."${t.type}_name"`} = ${t.entity_type}`);
            typeFilters[t.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}_name" = ${t.entity_type}`);
        } else {
            //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" is null`);
            typeFilters[t.type].push(SQL.template`"${SQL.raw(tablename)}"."${SQL.assert_in(t.type, valid_colnames)}_name" = ${'Unspecified'}`);
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
  

const dccAbbrTable: { [key: string]: string } = {
    "4D NUCLEOME DATA COORDINATION AND INTEGRATION CENTER": "4DN",
    "The Extracellular Communication Consortium Data Coordination Center": "ERCC",
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
    entity_type: string | null;
}

export function getFilterVals(filtParams: FilterParam[] | undefined, textSearchStr: string | undefined): string {
    if (filtParams !== undefined) {
        const entityTypes = filtParams.map(param => {
            if (param.type === "dcc" && param.entity_type !== null) {
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

export function getNameFromCollectionTable(iconKey: string): string {
    return collectionsTable[iconKey] || "";
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
    "compression_format": "Compression format",
    "data_type_name": "Data type",
    "assay_type_name": "Assay type",
    "analysis_type_name": "Analysis type",
    "mime_type": "MIME type",
    "pk_id": "Primary Key"
}

export function getNameFromFileProjTable(iconKey: string): string {
    return fileProjTable[iconKey] || "";
}


/* export interface Category {
    title: string;
    metadata: { label: React.ReactNode; value: React.ReactNode }[];
  }
  
export  function addCategoryColumns(columns: Record<string, React.ReactNode>, getNameFunction: (key: string) => React.ReactNode, categoryTitle: string, categories: Category[]) {
      if (!columns || Object.keys(columns).length === 0) return;
  
      // Check if the category already exists, if not create a new one
      let category = categories.find(c => c.title === categoryTitle);
      if (!category) {
          category = { title: categoryTitle, metadata: [] };
          categories.push(category);
      }
  
      for (const [key, value] of Object.entries(columns)) {
          if (value !== undefined) { // Check if value is not undefined
              const stringValue = typeof value === 'bigint' ? value.toString() : value.toString();
              category.metadata.push({ label: getNameFunction(key), value: stringValue });
          }
      }
  } */



export interface Category {
    title: string;
    metadata: { label: ReactNode; value: ReactNode }[];
}

export function addCategoryColumns(
    columns: Record<string, ReactNode | string | bigint>,
    getNameFunction: (key: string) => ReactNode,
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
            category.metadata.push({ label: getNameFunction(key), value: stringValue });
        }
    }
}

// This function sanitizes the known parameters and lets through other parameters



export function useSanitizedSearchParams(props: { searchParams: Record<string, string | string[] | undefined> }) {
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
    ]).transform(r => ({ 10: 10, 20: 20, 50: 50 }[r] ?? 10)),
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
}

export function get_partial_list_string(all_count: number, count: number, all_count_limit: number): string {
  return (all_count ?? 0).toLocaleString() + 
    ((all_count > all_count_limit) ? "(" + (count ?? 0).toLocaleString() + " listed)" : '')
    ;
}

export function sanitizeFilename(filename: string, repchar: string): string {
    // Define a regular expression that matches invalid characters
    const invalidCharacters = /[\/\\:*?"<>|]/g;
    // Replace invalid characters with an underscore
    // repchar can be '__'
    return filename.replace(invalidCharacters, repchar);
}
