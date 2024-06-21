import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function DataTypeFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    
    const query = SQL.template`
      WITH dtres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      dtres AS (
        SELECT 
          dtres_full.rank AS rank,
          COALESCE(dtres_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(dtres_full.data_type_name, 'Unspecified') AS data_type_name
        FROM dtres_full 
        LEFT JOIN c2m2.project ON (dtres_full.project_id_namespace = c2m2.project.id_namespace AND 
          dtres_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          dtres_full.rank,
          dtres_full.project_local_id,
          dtres_full.data_type_name
        ORDER BY rank DESC, data_type_name
      ),
      data_type_name_count AS (
        SELECT data_type_name, COUNT(*) AS count 
        FROM dtres
        GROUP BY data_type_name ORDER BY data_type_name
      )
      SELECT
        COALESCE(jsonb_agg(data_type_name_count.*), '[]'::jsonb) AS data_type_filters 
      FROM data_type_name_count;
    `.toPrismaSql();
    
    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ data_type_filters: { data_type_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for DataTypeFilterComponent queries: ", t1 - t0, " milliseconds");
    
    if (result.length === 0 || !result[0].data_type_filters) {
      return;
    
    }

    
    const DataTypeFilters: FilterObject[] = result[0].data_type_filters.map((data_typeFilter) => ({
        id: data_typeFilter.data_type_name, // Use gene_name as id
        name: data_typeFilter.data_type_name,
        count: data_typeFilter.count,
    }));

    return (
        <FilterSet 
            key={`ID:$data_type`} 
            id={`data_type`} 
            filterList={DataTypeFilters} 
            filter_title="Data type" 
            example_query="e.g. DNA sequence"
            maxCount={maxCount}
        />
    );
  } catch (error) {
    console.error("Error fetching Data Type filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Data Type filters</div>;
  }
}
