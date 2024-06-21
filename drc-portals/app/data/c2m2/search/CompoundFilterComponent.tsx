import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function CompoundFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {     
    const query = SQL.template`
      WITH cpdres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      cpdres AS (
        SELECT 
          cpdres_full.rank AS rank,
          COALESCE(cpdres_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(cpdres_full.compound_name, 'Unspecified') AS compound_name
        FROM cpdres_full 
        LEFT JOIN c2m2.project ON (cpdres_full.project_id_namespace = c2m2.project.id_namespace AND 
          cpdres_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          cpdres_full.rank,
          cpdres_full.project_local_id,
          cpdres_full.compound_name
        ORDER BY rank DESC, compound_name
      ),
      compound_name_count AS (
        SELECT compound_name, COUNT(*) AS count 
        FROM cpdres
        GROUP BY compound_name ORDER BY compound_name
      )
      SELECT
        COALESCE(jsonb_agg(compound_name_count.*), '[]'::jsonb) AS compound_filters
      FROM compound_name_count;
    `.toPrismaSql();
     
    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ compound_filters: { compound_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for CompoundFilterComponent queries: ", t1 - t0, " milliseconds");
    
    if (result.length === 0 || !result[0].compound_filters) {
      return; // do not do anything
    }
    const CompoundFilters: FilterObject[] = result[0].compound_filters.map((compoundFilter) => ({
        id: compoundFilter.compound_name, // Use compound_name as id
        name: compoundFilter.compound_name,
        count: compoundFilter.count,
    }));
    

    return (                
    <FilterSet
        key={`ID:$compound`}
        id={`compound`}
        filterList={CompoundFilters}
        filter_title="Compound"
        example_query="e.g. Dexamethasone"
        maxCount={maxCount}
    />
    );
  } catch (error) {
    console.error("Error fetching Compound filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Compound filters</div>;
  }
}
