import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function ProteinFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH protres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      protres AS (
        SELECT 
          protres_full.rank AS rank,
          COALESCE(protres_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(protres_full.protein_name, 'Unspecified') AS protein_name
        FROM protres_full 
        LEFT JOIN c2m2.project ON (protres_full.project_id_namespace = c2m2.project.id_namespace AND 
          protres_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          protres_full.rank,
          protres_full.project_local_id,
          protres_full.protein_name
        ORDER BY rank DESC, protein_name
      ),
      protein_name_count AS (
        SELECT protein_name, COUNT(*) AS count 
        FROM protres
        GROUP BY protein_name ORDER BY protein_name
      )
      SELECT
        COALESCE(jsonb_agg(protein_name_count.*), '[]'::jsonb) AS protein_filters
      FROM protein_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ protein_filters: { protein_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for ProteinFilterComponent queries: ", t1 - t0, " milliseconds");
    
    if (result.length === 0 || !result[0].protein_filters) {
      return; // do not do anything
    }
    const ProteinFilters: FilterObject[] = result[0].protein_filters.map((proteinFilter) => ({
        id: proteinFilter.protein_name, // Use protein_name as id
        name: proteinFilter.protein_name,
        count: proteinFilter.count,
    }));
    

    return ( 
                                         
    <FilterSet
        key={`ID:$protein`}
        id={`protein`}
        filterList={ProteinFilters}
        filter_title="Protein"
        example_query="e.g. A0N4X2"
        maxCount={maxCount}
    />
    );
  } catch (error) {
    console.error("Error fetching Protein filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Protein filters</div>;
  }
}
