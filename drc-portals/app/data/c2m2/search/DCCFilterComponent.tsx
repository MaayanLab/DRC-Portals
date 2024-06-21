import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function DCCFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH dccres_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      dccres AS (
        SELECT 
          dccres_full.rank AS rank,
          dccres_full.dcc_name AS dcc_name,
          dccres_full.dcc_abbreviation AS dcc_abbreviation,
          SPLIT_PART(dccres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
          COALESCE(dccres_full.project_local_id, 'Unspecified') AS project_local_id
        FROM dccres_full 
        LEFT JOIN c2m2.project ON (dccres_full.project_id_namespace = c2m2.project.id_namespace AND 
          dccres_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          dccres_full.rank,
          dccres_full.dcc_name,
          dccres_full.dcc_abbreviation,
          SPLIT_PART(dccres_full.dcc_abbreviation, '_', 1),
          dccres_full.project_local_id
        ORDER BY rank DESC, dcc_short_label
      ),
      dcc_name_count AS (
        SELECT dcc_name, SPLIT_PART(dcc_abbreviation, '_', 1) AS dcc_short_label, COUNT(*) AS count 
        FROM dccres
        GROUP BY dcc_name, SPLIT_PART(dcc_abbreviation, '_', 1)
        ORDER BY dcc_short_label, dcc_name
      )
      SELECT
        COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) AS dcc_filters 
      FROM dcc_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ dcc_filters: { dcc_name: string, dcc_short_label: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for DCCFilterComponent queries: ", t1 - t0, " milliseconds");
          
    if (result.length === 0 || !result[0].dcc_filters) {
      return; // do not do anything
    }

    const DccFilters: FilterObject[] = result[0].dcc_filters.map((dccFilter) => ({
      id: dccFilter.dcc_short_label,
      name: dccFilter.dcc_name, // Use dcc_abbreviation as the name
      count: dccFilter.count,
    }));

    return (
      <FilterSet
        key={`dcc-filter-set`}
        id={`dcc`}
        filterList={DccFilters}
        filter_title="Common Fund Program"
        example_query="e.g. 4DN"
        maxCount = { maxCount }
      />
    );
  } catch (error) {
    console.error("Error fetching DCC filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching DCC filters</div>;
  }
}
