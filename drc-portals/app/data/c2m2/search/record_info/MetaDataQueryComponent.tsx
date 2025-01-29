import prisma from "@/lib/prisma/c2m2";
import { format_description } from "@/app/data/processed/utils"
import { MetadataItem, getDCCIcon, getdccCFlink, generateFilterQueryStringForRecordInfo } from "@/app/data/c2m2/utils"
import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import Link from "@/utils/link";
import { Card, CardContent } from "@mui/material";
import { capitalizeFirstLetter, isURL } from "@/app/data/c2m2/utils"
import SQL from "@/lib/prisma/raw";
import React from "react";



export async function MetaDataQueryComponent({ searchParams, schemaName, tableName }: { searchParams: any, schemaName: string, tableName: string }): Promise<JSX.Element> {

  console.log("In MetaDataQueryComponent");
  const filterClause = generateFilterQueryStringForRecordInfo(searchParams, schemaName, tableName);

  try {
    const results = await fetchMetaDataQueryResults(searchParams, filterClause);
    return results;
  } catch (error) {
    console.error("Error fetching MetaData :", error);
    return <div>Error fetching meta data information: {(error as Error).message}</div>;
  }
}

async function fetchMetaDataQueryResults(searchParams: any, filterClause: SQL) {
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
              allres_full.dcc_name AS dcc_name,
              allres_full.dcc_abbreviation AS dcc_abbreviation,
              SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
              COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
              SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
              COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
              REPLACE(allres_full.disease, ':', '_') AS disease,
              COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
              REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
              COALESCE(allres_full.biofluid_name, 'Unspecified') AS biofluid_name,
              REPLACE(allres_full.biofluid, ':', '_') AS biofluid,
              COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
              allres_full.gene AS gene,
              COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
              allres_full.protein AS protein,
              COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
              allres_full.substance_compound AS compound,
              COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
              REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
              /**** COALESCE(c2m2.project_data_type.assay_type_name, 'Unspecified') AS assay_type_name,
              REPLACE(c2m2.project_data_type.assay_type_id, ':', '_') AS assay_type, ****/
              COALESCE(allres_full.assay_type_name, 'Unspecified') AS assay_type_name,
              REPLACE(allres_full.assay_type_id, ':', '_') AS assay_type,
              /* allres_full.project_name AS project_name, */
              COALESCE(allres_full.project_name, 
                concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
              c2m2.project.persistent_id AS project_persistent_id,
              allres_full.project_local_id AS project_local_id,
              c2m2.project.description AS project_description,
              c2m2.anatomy.description AS anatomy_description,
              c2m2.biofluid.description AS biofluid_description,
              c2m2.disease.description AS disease_description,
              c2m2.gene.description AS gene_description,
              c2m2.protein.description AS protein_description,
              c2m2.compound.description AS compound_description,
              c2m2.ncbi_taxonomy.description AS taxonomy_description,
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
            GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, taxonomy_id, disease_name, disease, 
              anatomy_name,  anatomy, biofluid_name,  biofluid, gene_name, gene, protein_name, protein, compound_name, compound, data_type_name, 
              data_type, assay_type_name, assay_type, project_name, c2m2.project.persistent_id, /* project_persistent_id, Mano */
              allres_full.project_local_id, project_description, anatomy_description, biofluid_description, disease_description, gene_description, 
              protein_description, compound_description, taxonomy_description
            /*GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, biofluid_name, project_name, project_description, rank*/
            ORDER BY dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, biofluid_name, gene_name, 
              protein_name, compound_name, data_type_name, assay_type_name /*rank DESC*/
          ) 
          SELECT
            (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres)
          ;
      `.toPrismaSql()) : [undefined];

    const t1: number = performance.now();

    console.log("Elapsed time for DB queries: ", t1 - t0, "milliseconds");



    // The following items are present in metadata

    const resultsRec = results?.records[0];
    const projectLocalId = resultsRec?.project_local_id ?? 'NA';// Assuming it's the same for all rows



    const metadata: (MetadataItem | null)[] = [
      { label: 'Project ID', value: projectLocalId },
      resultsRec?.project_persistent_id && isURL(resultsRec?.project_persistent_id)
        ? { label: 'Project URL', value: <Link href={`${resultsRec?.project_persistent_id}`} className="underline cursor-pointer text-blue-600" target="_blank">{resultsRec?.project_name}</Link> }
        : resultsRec?.project_persistent_id ? { label: 'Project URL', value: resultsRec?.project_persistent_id } : null,
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
          ? <Link href={`http://edamontology.org/${resultsRec?.data_type}`} className="underline cursor-pointer text-blue-600" target="_blank">
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
          : /* resultsRec?.data_type_name || */ ''
      },

    ];


    // const categories: Category[] = []; // dummy, remove it after making this a optional prop in Landing page
    return (
      <Card
        sx={{
          mb: 2, // Add spacing below the card
          p: 2, // Add padding inside the card
          boxShadow: 3, // Optional: Add shadow for better appearance
          borderRadius: 2, // Optional: Round the corners
        }}
      >
        <CardContent>
          <LandingPageLayout
            icon={{
              href: resultsRec?.dcc_short_label
                ? `/info/dcc/${getdccCFlink(resultsRec?.dcc_short_label)}`
                : "",
              src: getDCCIcon(resultsRec ? resultsRec?.dcc_short_label : ""),
              alt: resultsRec?.dcc_short_label ? resultsRec?.dcc_short_label : "",
            }}
            title={resultsRec?.project_name ?? ""}
            subtitle={""}
            description={format_description(resultsRec?.project_description ?? "")}
            metadata={metadata}
          />
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error fetching record info query results:', error);
    return <div>Error fetching meta data info query results</div>;
  }
}

