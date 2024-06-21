import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function AnatomyFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    
    const query = SQL.template`
      WITH anares_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      anares AS (
        SELECT 
          anares_full.rank AS rank,
          COALESCE(anares_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(anares_full.anatomy_name, 'Unspecified') AS anatomy_name
        FROM anares_full 
        LEFT JOIN c2m2.project ON (anares_full.project_id_namespace = c2m2.project.id_namespace AND 
          anares_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          anares_full.rank,
          anares_full.project_local_id,
          anares_full.anatomy_name
        ORDER BY rank DESC, anatomy_name
      ),
      anatomy_name_count AS (
        SELECT anatomy_name, COUNT(*) AS count 
        FROM anares
        GROUP BY anatomy_name ORDER BY anatomy_name
      )
      SELECT
        COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) AS anatomy_filters 
      FROM anatomy_name_count;
    `.toPrismaSql();
    
    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ anatomy_filters: { anatomy_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for AnatomyFilterComponent queries: ", t1 - t0, " milliseconds");
    
    if (result.length === 0 || !result[0].anatomy_filters) {
      return;
    
    }

    
    const AnatomyFilters: FilterObject[] = result[0].anatomy_filters.map((anatomyFilter) => ({
        id: anatomyFilter.anatomy_name, // Use gene_name as id
        name: anatomyFilter.anatomy_name,
        count: anatomyFilter.count,
    }));

    return (
        <FilterSet 
            key={`ID:$anatomy`} 
            id={`anatomy`} 
            filterList={AnatomyFilters} 
            filter_title="Anatomy" 
            example_query="e.g. brain"
            maxCount={maxCount}
        />
    );
  } catch (error) {
    console.error("Error fetching Anatomy filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Anatomy filters</div>;
  }
}
