import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function TaxonomyFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL , maxCount: number}) {
  try {
    const query = SQL.template`
      WITH taxres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      taxres AS (
        SELECT 
          taxres_full.rank AS rank,
          COALESCE(taxres_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(taxres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name
        FROM taxres_full 
        LEFT JOIN c2m2.project ON (taxres_full.project_id_namespace = c2m2.project.id_namespace AND 
          taxres_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          taxres_full.rank,
          taxres_full.project_local_id,
          taxres_full.ncbi_taxonomy_name
        ORDER BY rank DESC,  taxonomy_name
      ),
      taxonomy_name_count AS (
        SELECT taxonomy_name, COUNT(*) AS count 
        FROM taxres
        GROUP BY taxonomy_name ORDER BY taxonomy_name
      )
      SELECT
        COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) AS taxonomy_filters
      FROM taxonomy_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ taxonomy_filters: { taxonomy_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for TaxonomyFilterComponent queries: ", t1 - t0, " milliseconds");
    
    if (result.length === 0 || !result[0].taxonomy_filters) {
      return; // do not do anything
    }
    const TaxonomyFilters: FilterObject[] = result[0].taxonomy_filters.map((taxonomyFilter) => ({
        id: taxonomyFilter.taxonomy_name, // Use taxonomy_name as id
        name: taxonomyFilter.taxonomy_name,
        count: taxonomyFilter.count,
    }));
    
    
    return ( 
                                                       
    <FilterSet
        key={`ID:$taxonomy`}
        id={`taxonomy`}
        filterList={TaxonomyFilters}
        filter_title="Species"
        example_query="e.g. Mus musculus"
        maxCount={maxCount}
    />
    );
  } catch (error) {
    console.error("Error fetching Taxonomy filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Taxonomy filters</div>;
  }
}
