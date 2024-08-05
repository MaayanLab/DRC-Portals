// SearchQueryComponent.tsx
import { generateFilterQueryString } from '@/app/data/c2m2/utils';
import prisma from '@/lib/prisma/c2m2';
import { useSanitizedSearchParams } from "@/app/data/c2m2/utils";
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet"
import SearchablePagedTable, { SearchablePagedTableCellIcon, PreviewButton, Description } from "@/app/data/c2m2/SearchablePagedTable";
import ListingPageLayout from "../ListingPageLayout";
import { Button } from "@mui/material";
import { redirect } from "next/navigation";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "@/utils/link";
import { getDCCIcon, capitalizeFirstLetter, isURL, generateMD5Hash, sanitizeFilename} from "@/app/data/c2m2/utils";
import SQL from '@/lib/prisma/raw';
import C2M2MainSearchTable from './C2M2MainSearchTable';
import { FancyTab } from '@/components/misc/FancyTabs';
import DCCFilterComponent from './DCCFilterComponent';
import DataTypeFilterComponent from './DataTypeFilterComponent';
import CompoundFilterComponent from './CompoundFilterComponent';
import ProteinFilterComponent from './ProteinFilterComponent';
import GeneFilterComponent from './GeneFilterComponent';
import AnatomyFilterComponent from './AnatomyFilterComponent';
import TaxonomyFilterComponent from './TaxonomyFilterComponent';
import DiseaseFilterComponent from './DiseaseFilterComponent';
import React from "react";
import { safeAsync } from '@/utils/safe';
import DownloadButton from '../DownloadButton';

const allres_filtered_maxrow_limit = 200000;

type PageProps = { search: string, searchParams: Record<string, string> }

const doQuery = React.cache(async (props: PageProps) => {
  const searchParams = useSanitizedSearchParams({ searchParams: { ...props.searchParams, q: props.search } });
  if (!searchParams.q) return
  const currentPage = searchParams.C2M2MainSearchTbl_p ? +searchParams.C2M2MainSearchTbl_p : 1;
  const offset = (currentPage - 1) * searchParams.r;
  const limit = searchParams.r;

  const filterClause = generateFilterQueryString(searchParams, "ffl_biosample_collection");
  // To measure time taken by different parts
  const t0: number = performance.now();
  const [results] = await prisma.$queryRaw<Array<{
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
      gene_name: string,
      gene: string,
      protein_name: string,
      protein: string,
      compound_name: string,
      compound: string,
      data_type_name: string,
      data_type: string,
      project_name: string,
      project_description: string,
      project_persistent_id: string,
      count: number, // this is based on across all-columns of ffl_biosample
      count_bios: number,
      count_sub: number,
      count_col: number,
      record_info_url: string,
    }[],
    records_full: {
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
      gene_name: string,
      gene: string,
      protein_name: string,
      protein: string,
      compound_name: string,
      compound: string,
      data_type_name: string,
      data_type: string,
      project_name: string,
      project_description: string,
      project_persistent_id: string,
      count: number, // this is based on across all-columns of ffl_biosample
      count_bios: number,
      count_sub: number,
      count_col: number,
      record_info_url: string,
    }[],
    count: number,
    all_count: number, // this refers to total rows in (filtercause applied on allres but without applying allres_filtered_maxrow_limit)
    // Mano: The count in filters below id w.r.t. rows in allres on which DISTINCT 
    // is already applied (indirectly via GROUP BY), so, these counts are much much lower than the count in allres
  }>>(SQL.template`
    WITH allres_full AS (
      SELECT  c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q})
        ${!filterClause.isEmpty() ? SQL.template`and ${filterClause}` : SQL.empty()}
        ORDER BY rank DESC,  dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name  , subject_local_id, biosample_local_id, collection_local_id
        LIMIT ${allres_filtered_maxrow_limit}     
    ),
    allres AS (
      SELECT 
        allres_full.rank AS rank,
        allres_full.dcc_name AS dcc_name,
        allres_full.dcc_abbreviation AS dcc_abbreviation,
        SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
        COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id, /* added Unspecified as needed in record_info_col */
        /* CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name, */
        COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
        SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
        /* CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name, */
        COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
        REPLACE(allres_full.disease, ':', '_') AS disease,
        /* CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name, */
        COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
        REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
        /* CASE WHEN allres_full.gene_name IS NULL THEN 'Unspecified' ELSE allres_full.gene_name END AS gene_name, */
        COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
        allres_full.gene AS gene,
        COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
        allres_full.protein AS protein,
        COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
        allres_full.substance_compound AS compound,
        COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
        REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
        /* allres_full.project_name AS project_name, */
        COALESCE(allres_full.project_name, 
          concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
        c2m2.project.description AS project_description,
        allres_full.project_persistent_id as project_persistent_id,
        COUNT(*)::INT AS count,
        COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
        COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
        COUNT(DISTINCT collection_local_id)::INT AS count_col
      FROM allres_full 
      LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
        allres_full.project_local_id = c2m2.project.local_id) 
      /* LEFT JOIN c2m2.project_data_type ON (allres_full.project_id_namespace = c2m2.project_data_type.project_id_namespace AND 
        allres_full.project_local_id = c2m2.project_data_type.project_local_id) keep for some time */
      GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
        disease_name, disease, anatomy_name, anatomy, gene_name, gene, protein_name, protein, compound_name, compound,
        data_type_name, data_type, project_name, project_description, allres_full.project_persistent_id 
      ORDER BY rank DESC, dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
        protein_name, compound_name, data_type_name
    ),
    allres_filtered_count AS (SELECT count(*)::int as filtered_count FROM allres /*${filterClause}*/),
    allres_filtered AS (
      SELECT allres.*, 
      concat_ws('', '/data/c2m2/search/record_info?q=', ${searchParams.q}, '&t=', 'dcc_name:', allres.dcc_name, 
      '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
      '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
      '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name,
      '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
      FROM allres
      /*${filterClause}*/
      /*LIMIT ${allres_filtered_maxrow_limit}*/
    ),
    allres_limited AS (
      SELECT *
      FROM allres_filtered
      /* OFFSET ${offset} */ /* Commented out to speed up pagination */
      /* LIMIT ${limit} */  
    ),
    total_count as (
      select count(*)::int as count
      from allres_filtered
    )
    
    SELECT
    (SELECT COALESCE(jsonb_agg(allres_filtered.*), '[]'::jsonb) AS records_full FROM allres_filtered ), 
    (SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited ), 
    (SELECT count FROM total_count) as count,
    (SELECT filtered_count FROM allres_filtered_count) as all_count
  `.toPrismaSql())
  return results
})

export async function SearchQueryComponentTab(props: { search: string }) {
  const results = await safeAsync(() => doQuery({ ...props, searchParams: {} }))
  if (results.error) console.error(results.error)
  if (!results.data) return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata</>} hidden />
  return <FancyTab id="c2m2" priority={Infinity} label={<>Cross-Cut Metadata<br />{results.data.all_count ? BigInt(results.data.all_count).toLocaleString() : null}</>} hidden={results.data.all_count === 0} />
}

export async function SearchQueryComponent(props: PageProps) {
    const searchParams = useSanitizedSearchParams({ searchParams: { ...props.searchParams, q: props.search } });

    const filterClause = generateFilterQueryString(searchParams, "ffl_biosample_collection");
    
    // this is for filters count limit, passed to various filters for lazy loading
    const maxCount = 1000; 
    try {
        // To measure time taken by different parts
        const t0: number = performance.now();
        const results = await doQuery(props)
        const t1: number = performance.now();
        
          if (!results) return null
          //  console.log(results)
          

          // Create download filename for this recordInfo based on md5sum
          // Stringify q and t from searchParams pertaining to this record
          const qString = JSON.stringify(searchParams.q);
          const tString = JSON.stringify(searchParams.t);

          // Concatenate qString and tString into a single string
          const concatenatedString = `${qString}${tString}`;
          const SearchHashFileName = generateMD5Hash(concatenatedString);
          const qString_clean = sanitizeFilename(qString, '__');
          
          console.log("Total count of results (after filterclause but before allres_filtered_maxrow_limit): ", results?.all_count);
          console.log("Elapsed time for DB queries: ", t1 - t0, " milliseconds");
          
          // const t4: number = performance.now();
          // THese are passed to the component C2M2MainSearchTable
          const tableCols = [
            <>View</>,
            <>DCC</>,
            <>Project Name</>,
            //<>Description</>,
            <>Attributes</>,
            <>Assets</>
            //<>Rank</>
          ];
          const tableRows = results ? results.records.map((res, index) => ({
            id: `row-${index}`, // Generate an ID using the index, prefixed for clarity
            previewButton: <PreviewButton href={res.record_info_url} alt="More details about this result" />,
            dccIcon: <SearchablePagedTableCellIcon href={`/info/dcc/${res.dcc_short_label}`} src={getDCCIcon(res.dcc_short_label)} alt={res.dcc_short_label} />,
            projectName: (res.project_persistent_id && isURL(res.project_persistent_id)) 
              ? <Link href={`${res.project_persistent_id}`} className="underline cursor-pointer text-blue-600" target="_blank"><u>{res.project_name}</u></Link> 
              : <Description description={res.project_name} />,
            attributes: (
              <>
                {res.taxonomy_name !== "Unspecified" && (
                  <>
                    <span>Species: </span>
                    <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${res.taxonomy_id}`} target="_blank"><i><u>{res.taxonomy_name}</u></i></Link>
                    <br />
                  </>
                )}
                {res.disease_name !== "Unspecified" && (
                  <>
                    <span>Disease: </span>
                    <Link href={`http://purl.obolibrary.org/obo/${res.disease}`} target="_blank"><i><u>{capitalizeFirstLetter(res.disease_name)}</u></i></Link>
                    <br />
                  </>
                )}
                {res.anatomy_name !== "Unspecified" && (
                  <>
                    <span>Sample source: </span>
                    <Link href={`http://purl.obolibrary.org/obo/${res.anatomy}`} target="_blank"><i><u>{capitalizeFirstLetter(res.anatomy_name)}</u></i></Link>
                    <br />
                  </>
                )}
                {res.gene_name !== "Unspecified" && (
                  <>
                    <span>Gene: </span>
                    <Link href={`http://www.ensembl.org/id/${res.gene}`} target="_blank"><i><u>{res.gene_name}</u></i></Link>
                    <br />
                  </>
                )}
                {res.protein_name !== "Unspecified" && (
                  <>
                    <span>Protein: </span>
                    <Link href={`https://www.uniprot.org/uniprotkb/${res.protein}`} target="_blank"><i><u>{res.protein_name}</u></i></Link>
                    <br />
                  </>
                )}
                {res.compound_name !== "Unspecified" && (
                  <>
                    <span>Compound: </span>
                    <Link href={`https://pubchem.ncbi.nlm.nih.gov/compound/${res.compound}`} target="_blank"><i><u>{res.compound_name}</u></i></Link>
                    <br />
                  </>
                )}
                {res.data_type_name !== "Unspecified" && (
                  <>
                    <span>Data type: </span>
                    <Link href={`http://edamontology.org/${res.data_type}`} target="_blank"><i><u>{capitalizeFirstLetter(res.data_type_name)}</u></i></Link>
                    <br />
                  </>
                )}
              </>
            ),
            assets: (
              <>
                Subjects: {res.count_sub}<br />
                Biosamples: {res.count_bios}<br />
                Collections: {res.count_col}<br />
              </>
            )
          })) : [];
          
          
          return (
            <ListingPageLayout
            count={results?.count} // This matches with #records in the table on the right (without limit)
            all_count={results?.all_count} // This matches with #records in the table on the right (without any limit)
            all_count_limit={allres_filtered_maxrow_limit}
            searchText={searchParams.q}
              filters={
                <>
                  <React.Suspense fallback={<>Loading..</>}>
                    <DiseaseFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <TaxonomyFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <AnatomyFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <GeneFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <ProteinFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <CompoundFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <DataTypeFilterComponent q={searchParams.q ??''} filterClause={filterClause}  maxCount = {maxCount}/>
                  </React.Suspense>
                  <hr className="m-2" />
                  <React.Suspense fallback={<>Loading..</>}>
                    <DCCFilterComponent q={searchParams.q ??''} filterClause={filterClause} maxCount = {maxCount} />
                  </React.Suspense>
                  <hr className="m-2" />
                  
                </>
              }
              footer={
                <>
                <Link href="/data">
                  <Button
                    sx={{ textTransform: "uppercase", marginRight: '16px' }}
                    color="primary"
                    variant="contained"
                    startIcon={<Icon path={mdiArrowLeft} size={1} />}>
                    BACK TO SEARCH
                  </Button>
                </Link>
                <DownloadButton 
                data={results?.records_full} 
                filename={"CFDEC2M2MainSearchTable_" + qString_clean + "_" + SearchHashFileName + ".json"}
                name='DOWNLOAD ALL' 
                />
                </>
              }
              data={results?.records_full}
              downloadFileName={"CFDEC2M2MainSearchTable_" + qString_clean + "_" + SearchHashFileName + ".json"}
            >
              {/* Search tags are part of SearchablePagedTable. No need to send the selectedFilters as string instead we send searchParams.t*/}
              <C2M2MainSearchTable
                q={searchParams.q ?? ''}
                p={searchParams.p}
                r={searchParams.r}
                count={results?.count}
                t={searchParams.t}
                columns={tableCols}
                rows={tableRows}
                tablePrefix="C2M2MainSearchTbl"
                data={results?.records}
                downloadFileName={"CFDEC2M2MainSearchTable_" + qString_clean + "_" + SearchHashFileName + ".json"}
              />

            </ListingPageLayout>
        )

        
    } catch (error) {
        console.error('Error fetching query results:', error);
        return <>
        <div className="mb-10">Error fetching query results.</div>
        <Link href="/data">
          <Button
            sx={{ textTransform: "uppercase" }}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
            BACK TO SEARCH
          </Button>
        </Link>
        </>
    }

    
}
//const t1: number = performance.now();
     
  //if (!results) redirect('/data')
  //  console.log(results)
  
  // Not reached since already returtned
  //const t5: number = performance.now();
  //console.log("Elapsed time for display (filters + table): ", t5 - t4, " milliseconds");
  
  // 2024/05/21: Some issue with taxonomy filter.
  // https://ucsd-sslab.ngrok.app/data/processed/search?q=parkinson&p=1&s=c2m2&t=taxonomy%3AHomo+sapiens
  // Issue fixed by changing ncbi_taxonomy to taxonomy in utils.ts in function generateFilterQueryString
  //
