// Col_SearchQueryComponent.tsx

import { generateFilterQueryString } from '@/app/data/c2m2/utils';
import prisma from '@/lib/prisma/c2m2';
import { useSanitizedSearchParams } from "@/app/data/processed/utils";
import { Prisma } from "@prisma/client";
import FilterSet from "@/app/data/c2m2/FilterSet"
import SearchablePagedTable, { SearchablePagedTableCellIcon, PreviewButton, Description } from "@/app/data/c2m2/SearchablePagedTable";
import ListingPageLayout from "../ListingPageLayout";
import { Button } from "@mui/material";
import { redirect } from "next/navigation";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";
import { getDCCIcon, capitalizeFirstLetter, isURL, generateMD5Hash} from "@/app/data/c2m2/utils";

type PageProps = { searchParams: Record<string, string> }
type FilterObject = {
    id: string;
    name: string;
    count: number; 
  };
  

export async function Col_SearchQueryComponent(props: PageProps) {
    const searchParams = useSanitizedSearchParams(props);
    console.log("In Col_SearchQueryComponent");

    try {
        const results = await fetchQueryResults(searchParams);
        return results;
    } catch (error) {
        console.error('Error fetching search results:', error);
        return undefined;
    }
}

async function fetchQueryResults(searchParams: any) {
    const offset = (searchParams.p - 1) * searchParams.r;
    const limit = searchParams.r;

    const filterConditionStr = generateFilterQueryString(searchParams, "allres");
    const filterClause = filterConditionStr.length ? `WHERE ${filterConditionStr}` : '';
    const cascading: boolean = true;
    const cascading_tablename = cascading ? "allres_filtered" : "allres";

    // Your SQL query goes here

    try {
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
              count: number, // this is based on across all-columns of ffl_collection
              count_bios: number,
              count_sub: number,
              count_col: number,
              record_info_url: string,
            }[],
            count: number,
            // Mano: The count in filters below id w.r.t. rows in allres on which DISTINCT 
            // is already applied (indirectly via GROUP BY), so, these counts are much much lower than the count in allres
            dcc_filters: { dcc_name: string, dcc_short_label: string, count: number, }[],
            taxonomy_filters: { taxonomy_name: string, count: number, }[],
            disease_filters: { disease_name: string, count: number, }[],
            anatomy_filters: { anatomy_name: string, count: number, }[],
            project_filters: { project_name: string, count: number, }[],
            gene_filters: { gene_name: string, count: number, }[],
            protein_filters: { protein_name: string, count: number, }[],
            compound_filters: { compound_name: string, count: number, }[],
            data_type_filters: { data_type_name: string, count: number, }[],
          }>>`
        WITH allres_full AS (
          SELECT DISTINCT c2m2.ffl_collection.*,
            ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
            FROM c2m2.ffl_collection
            WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) 
            /*ORDER BY rank DESC , dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name */
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
              concat_ws('', 'Dummy: Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
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
        allres_filtered AS (
          SELECT allres.*, 
          concat_ws('', '/data/c2m2/record_info_col?q=', ${searchParams.q}, '&t=', 'dcc_name:', allres.dcc_name, 
          '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
          '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
          '|', 'gene_name:', allres.gene_name, '|', 'protein_name:', allres.protein_name, 
          '|', 'compound_name:', allres.compound_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
          FROM allres
          ${Prisma.sql([filterClause])}
        ),
        allres_limited AS (
          SELECT *
          FROM allres_filtered
          OFFSET ${offset}
          LIMIT ${limit}   
        ),
        total_count as (
          select count(*)::int as count
          from allres_filtered
        ),
        dcc_name_count AS (
          SELECT dcc_name, dcc_short_label, COUNT(*) AS count 
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY dcc_name, dcc_short_label ORDER BY dcc_short_label, dcc_name
        ),
        taxonomy_name_count AS (
          SELECT taxonomy_name, COUNT(*) AS count
          /* SELECT CASE WHEN taxonomy_name IS NULL THEN 'Unspecified' ELSE taxonomy_name END AS taxonomy_name, COUNT(*) AS count */
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY taxonomy_name ORDER BY taxonomy_name
        ),
        disease_name_count AS (
          SELECT disease_name, COUNT(*) AS count
          /* SELECT CASE WHEN disease_name IS NULL THEN 'Unspecified' ELSE disease_name END AS disease_name, COUNT(*) AS count */
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY disease_name ORDER BY disease_name
        ),
        anatomy_name_count AS (
          SELECT anatomy_name, COUNT(*) AS count
          /* SELECT CASE WHEN anatomy_name IS NULL THEN 'Unspecified' ELSE anatomy_name END AS anatomy_name, COUNT(*) AS count */
          FROM ${Prisma.sql([cascading_tablename])} 
          GROUP BY anatomy_name ORDER BY anatomy_name
        ),
        project_name_count AS (
          SELECT project_name, COUNT(*) AS count 
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY project_name ORDER BY project_name
        ),
        gene_name_count AS (
          SELECT gene_name, COUNT(*) AS count 
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY gene_name ORDER BY gene_name
        ),
        protein_name_count AS (
          SELECT protein_name, COUNT(*) AS count 
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY protein_name ORDER BY protein_name
        ),
        compound_name_count AS (
          SELECT compound_name, COUNT(*) AS count 
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY compound_name ORDER BY compound_name
        ),
        data_type_name_count AS (
          SELECT data_type_name, COUNT(*) AS count 
          FROM ${Prisma.sql([cascading_tablename])}
          GROUP BY data_type_name ORDER BY data_type_name
        )
        
        SELECT
        (SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited ), 
          (SELECT count FROM total_count) as count,
          (SELECT COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) FROM dcc_name_count) AS dcc_filters,
          (SELECT COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) FROM taxonomy_name_count) AS taxonomy_filters,
          (SELECT COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) FROM disease_name_count) AS disease_filters,
          (SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) FROM anatomy_name_count) AS anatomy_filters,
          (SELECT COALESCE(jsonb_agg(project_name_count.*), '[]'::jsonb) FROM project_name_count) AS project_filters,
          (SELECT COALESCE(jsonb_agg(gene_name_count.*), '[]'::jsonb) FROM gene_name_count) AS gene_filters,
          (SELECT COALESCE(jsonb_agg(protein_name_count.*), '[]'::jsonb) FROM protein_name_count) AS protein_filters,
          (SELECT COALESCE(jsonb_agg(compound_name_count.*), '[]'::jsonb) FROM compound_name_count) AS compound_filters,
          (SELECT COALESCE(jsonb_agg(data_type_name_count.*), '[]'::jsonb) FROM data_type_name_count) AS data_type_filters
          
          ` : [undefined];
        
          const t1: number = performance.now();
        
          if (!results) redirect('/data')
          //  console.log(results)
          // console.log(results.records[0]); console.log(results.records[1]); console.log(results.records[2]);
          // console.log(results.records.map(res => res.count))
          // console.log(results.dcc_filters)
          // console.log(results.taxonomy_filters)
        
          // Create download filename for this recordInfo based on md5sum
          // Stringify q and t from searchParams pertaining to this record
          const qString = JSON.stringify(searchParams.q);
          const tString = JSON.stringify(searchParams.t);

          // Concatenate qString and tString into a single string
          const concatenatedString = `${qString}${tString}`;
          const SearchHashFileName = generateMD5Hash(concatenatedString);

          const t2: number = performance.now();
        
          const total_matches = results?.records.map((res) => res.count).reduce((a, b) => Number(a) + Number(b), 0); // need to sum
          //else if (results.count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
          const DccFilters: FilterObject[] = results?.dcc_filters.map((dccFilter) => ({
            id: dccFilter.dcc_short_label,
            name: dccFilter.dcc_name, // Use dcc_abbreviation as the name
            count: dccFilter.count,
          }));
          const TaxonomyFilters: FilterObject[] = results?.taxonomy_filters.map((taxFilter) => ({
            id: taxFilter.taxonomy_name, // Use taxonomy_name as id
            name: taxFilter.taxonomy_name,
            count: taxFilter.count,
          }));
          const DiseaseFilters: FilterObject[] = results?.disease_filters.map((disFilter) => ({
            id: disFilter.disease_name, // Use disease_name as id
            name: disFilter.disease_name,
            count: disFilter.count,
          }));
          const AnatomyFilters: FilterObject[] = results?.anatomy_filters.map((anaFilter) => ({
            id: anaFilter.anatomy_name, // Use anatomy_name as id
            name: anaFilter.anatomy_name,
            count: anaFilter.count,
          }));
          const ProjectFilters: FilterObject[] = results?.project_filters.map((projFilter) => ({
            id: projFilter.project_name, // Use anatomy_name as id
            name: projFilter.project_name,
            count: projFilter.count,
          }));
          const GeneFilters: FilterObject[] = results?.gene_filters.map((geneFilter) => ({
            id: geneFilter.gene_name, // Use gene_name as id
            name: geneFilter.gene_name,
            count: geneFilter.count,
          }));
          const ProteinFilters: FilterObject[] = results?.protein_filters.map((proteinFilter) => ({
            id: proteinFilter.protein_name, // Use protein_name as id
            name: proteinFilter.protein_name,
            count: proteinFilter.count,
          }));
          const CompoundFilters: FilterObject[] = results?.compound_filters.map((compoundFilter) => ({
            id: compoundFilter.compound_name, // Use compound_name as id
            name: compoundFilter.compound_name,
            count: compoundFilter.count,
          }));
          const DataTypeFilters: FilterObject[] = results?.data_type_filters.map((data_typeFilter) => ({
            id: data_typeFilter.data_type_name, // Use gene_name as id
            name: data_typeFilter.data_type_name,
            count: data_typeFilter.count,
          }));
        
          const t3: number = performance.now();
          console.log("Elapsed time for DB queries: ", t1 - t0, "milliseconds");
          console.log("Elapsed time for creating data for filters: ", t3 - t2, "milliseconds");
        
          // console.log("Length of DCC Filters")
          // console.log(DccFilters.length);
          // console.log(searchParams.q);
          // const selectedFilters = getFilterVals(searchParams.t, searchParams.q);
        
          // console.log(selectedFilters)
        
          //const file_icon_path = "/img/icons/searching-magnifying-glass.png";
          const file_icon_path = "/img/icons/file-magnifiying-glass.png";
        
          //const t4: number = performance.now();
        
          return (
            <ListingPageLayout
              count={results?.count} // This matches with #records in the table on the right (without filters applied)
              searchText={searchParams.q}
              filters={
                <>
                  {DiseaseFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Disease</Typography> */}
                      <FilterSet key={`ID:$disease`} id={`disease`} filterList={DiseaseFilters} filter_title="Disease" example_query="e.g. cancer" />
                      <hr className="m-2" />
                    </>
                  )}
                  {TaxonomyFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Taxonomy</Typography> */}
                      <FilterSet key={`ID:$taxonomy`} id={`taxonomy`} filterList={TaxonomyFilters} filter_title="Species" example_query="e.g. homo sapiens" />
                      <hr className="m-2" />
                    </>
                  )}
                  {AnatomyFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Anatomy</Typography> */}
                      <FilterSet key={`ID:$anatomy`} id={`anatomy`} filterList={AnatomyFilters} filter_title="Anatomy" example_query="e.g. brain" />
                      <hr className="m-2" />
                    </>
                  )}
        
                  {/* Conditionally render FilterSet for GeneFilters */}
                  {GeneFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Gene</Typography> */}
                      <FilterSet key={`ID:$gene`} id={`gene`} filterList={GeneFilters} filter_title="Gene" example_query="e.g. HK1" />
                      <hr className="m-2" />
                    </>
                  )}
                  {ProteinFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Protein</Typography> */}
                      <FilterSet key={`ID:$protein`} id={`protein`} filterList={ProteinFilters} filter_title="Protein" example_query="e.g. A0N4X2" />
                      <hr className="m-2" />
                    </>
                  )}
                  {CompoundFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Compound</Typography> */}
                      <FilterSet key={`ID:$compound`} id={`compound`} filterList={CompoundFilters} filter_title="Compound" example_query="e.g. Dexamethasone" />
                      <hr className="m-2" />
                    </>
                  )}
                  {DataTypeFilters.length > 1 && (
                    <>
                      {/* <Typography className="subtitle1">Anatomy</Typography> */}
                      <FilterSet key={`ID:$data_type`} id={`data_type`} filterList={DataTypeFilters} filter_title="Data type" example_query="e.g. DNA sequence" />
                      <hr className="m-2" />
                    </>
                  )}
                  {/* <Typography variant="h5">Core filters</Typography> */}
                  {/* <hr className="m-2" /> */}
                  {/* <Typography className="subtitle1">CF Program/DCC</Typography> */}
                  <FilterSet key={`ID:$dcc`} id={`dcc`} filterList={DccFilters} filter_title="Common Fund Program" example_query="e.g. 4DN" />
                  <hr className="m-2" />
                  {/* <Typography className="subtitle1">Project</Typography> */}
                  {/* <FilterSet key={`ID:$project`} id={`project`} filterList={ProjectFilters} filter_title="Project" /> */}
                  {/* results?.project_filters.map((res) =>
                    <SearchFilter key={`ID:${res.project_name}`} id={`anatomy:${res.project_name}`} count={res.count} label={`${res.project_name}`} />
              ) */}
                </>
              }
              footer={
                <Link href="/data">
                  <Button
                    sx={{ textTransform: "uppercase" }}
                    color="primary"
                    variant="contained"
                    startIcon={<Icon path={mdiArrowLeft} size={1} />}>
                    BACK TO SEARCH
                  </Button>
                </Link>
              }
              data={results?.records}
              downloadFileName={SearchHashFileName + "_CFDEC2M2MainSearchTable_Collection.json"}
            >
              {/* Search tags are part of SearchablePagedTable. No need to send the selectedFilters as string instead we send searchParams.t*/}
              <SearchablePagedTable
                q={searchParams.q ?? ''}
                p={searchParams.p}
                r={searchParams.r}
                t={searchParams.t}
                count={results?.count}
                columns={[
                  <>View</>,
                  <>DCC</>,
                  <>Project Name</>,
                  //<>Description</>,
                  <>Attributes</>,
                  <>Assets</>
                  //<>Rank</>
                ]}
                rows={results ? results?.records.map(res => [
                  <PreviewButton href={res.record_info_url} alt="More details about this result" />,
                  // [
                  //<>{res.dcc_abbreviation}</>,
                  //<SearchablePagedTableCellIcon href={`/info/dcc/${res.dcc_abbreviation.split("_")[0]}}`} src={dccIconTable[res.dcc_abbreviation.split("_")[0]]} alt={res.dcc_abbreviation.split("_")[0]} />,
                  <SearchablePagedTableCellIcon href={`/info/dcc/${res.dcc_short_label}`} src={getDCCIcon(res.dcc_short_label)} alt={res.dcc_short_label} />,
                  //<Description description={res.dcc_abbreviation.split("_")[0]} />,
                  //<Description description={res.project_name} />,                  
                  //<Link href={`${res.project_persistent_id}`} target="_blank"><u>{res.project_name}</u></Link>,
                  //(res.project_persistent_id && ( http_pattern.test(res.project_persistent_id) || res.project_persistent_id.includes(doi_pattern))) ? 
                  (res.project_persistent_id && isURL(res.project_persistent_id)) ?
                  <Link href={`${res.project_persistent_id}`} className="underline cursor-pointer text-blue-600" target="_blank"><u>{res.project_name}</u></Link> : 
                    <Description description={res.project_name} />,
                
                  //<TruncatedText text={res.project_description} maxLength={80} />,
        
                  <>
                    {res.taxonomy_name !== "Unspecified" && (
                      <>
                        <span>Species: </span>
                        <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${res.taxonomy_id}`} target="_blank"><i><u>{res.taxonomy_name}</u></i></Link>
                        <br />
                      </>
        
                    )}
                    {/*Taxonomy: <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${res.taxonomy_id}`}><i><u>{res.taxonomy_name}</u></i></Link><br></br>*/}
                    {res.disease_name !== "Unspecified" && (
                      <>
                        <span>Disease: </span>
                        <Link href={`http://purl.obolibrary.org/obo/${res.disease}`} target="_blank"><i><u>{capitalizeFirstLetter(res.disease_name)}</u></i></Link>
                        <br />
                      </>
                    )}
                    {/*Disease: <Link href={`http://purl.obolibrary.org/obo/${res.disease}`}><i><u>{res.disease_name}</u></i></Link><br></br>*/}
                    {res.anatomy_name !== "Unspecified" && (
                      <>
                        <span>Sample source: </span>
                        <Link href={`http://purl.obolibrary.org/obo/${res.anatomy}`}  target="_blank"><i><u>{capitalizeFirstLetter(res.anatomy_name)}</u></i></Link>
                        <br />
                      </>
                    )}
                    {/*Sample: <Link href={`http://purl.obolibrary.org/obo/${res.anatomy}`}><i><u>{res.anatomy_name}</u></i></Link><br></br>*/}
                    {/* Gene: <i>{res.gene_name}</i> */}
                    {res.gene_name !== "Unspecified" && (
                      <>
                        <span>Gene: </span>
                        <Link href={`http://www.ensembl.org/id/${res.gene}`}  target="_blank"><i><u>{res.gene_name}</u></i></Link>
                        <br />
                      </>
                    )}
                    {res.protein_name !== "Unspecified" && (
                      <>
                        <span>Protein: </span>
                        <Link href={`https://www.uniprot.org/uniprotkb/${res.protein}`}  target="_blank"><i><u>{res.protein_name}</u></i></Link>
                        <br />
                      </>
                    )}
                    {res.compound_name !== "Unspecified" && (
                      <>
                        <span>Compound: </span>
                        <Link href={`https://pubchem.ncbi.nlm.nih.gov/compound/${res.compound}`}  target="_blank"><i><u>{res.compound_name}</u></i></Link>
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
        
                  </>,
                  <>Subjects: {res.count_sub}<br></br>
                    Biosamples: {res.count_bios}<br></br>
                    Collections: {res.count_col}<br></br>
                    { /* #Matches: {res.count} */}
                  </>
        
                ]) : []}
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
  //console.log("Elapsed time for display (filters + table): ", t5 - t4, "milliseconds");