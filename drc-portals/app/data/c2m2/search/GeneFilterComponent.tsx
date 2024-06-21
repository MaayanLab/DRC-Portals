import prisma from "@/lib/prisma";
import SQL from '@/lib/prisma/raw';
import FilterSet, { FilterObject } from "@/app/data/c2m2/FilterSet";
import React from 'react';

export default async function GeneFilterComponent({ q, filterClause, maxCount }: { q: string, filterClause: SQL, maxCount: number }) {
  try {
    const query = SQL.template`
      WITH generes_full AS (
        SELECT DISTINCT c2m2.ffl_biosample_collection.*,
          ts_rank_cd(searchable, websearch_to_tsquery('english', ${q})) as "rank"
        FROM c2m2.ffl_biosample_collection
        WHERE searchable @@ websearch_to_tsquery('english', ${q})
        ${filterClause}
        LIMIT ${maxCount}
      ),
      generes AS (
        SELECT 
          generes_full.rank AS rank,
          COALESCE(generes_full.project_local_id, 'Unspecified') AS project_local_id,
          COALESCE(generes_full.gene_name, 'Unspecified') AS gene_name
        FROM generes_full 
        LEFT JOIN c2m2.project ON (generes_full.project_id_namespace = c2m2.project.id_namespace AND 
          generes_full.project_local_id = c2m2.project.local_id)
        GROUP BY 
          generes_full.rank,
          generes_full.project_local_id,
          generes_full.gene_name
        ORDER BY rank DESC,  gene_name
      ),
      gene_name_count AS (
        SELECT gene_name, COUNT(*) AS count 
        FROM generes
        GROUP BY gene_name ORDER BY gene_name
      )
      SELECT
        COALESCE(jsonb_agg(gene_name_count.*), '[]'::jsonb) AS gene_filters
      FROM gene_name_count;
    `.toPrismaSql();

    const t0: number = performance.now();
    const result = await prisma.$queryRaw<{ gene_filters: { gene_name: string, count: number }[] }[]>(query);
    const t1: number = performance.now();
    console.log("Elapsed time for GeneFilterComponent queries: ", t1 - t0, " milliseconds");
    

    if (result.length === 0 || !result[0].gene_filters) {
      return; // do not do anything
    }
    const GeneFilters: FilterObject[] = result[0].gene_filters.map((geneFilter) => ({
        id: geneFilter.gene_name, // Use gene_name as id
        name: geneFilter.gene_name,
        count: geneFilter.count,
    }));
    

    return ( 
                                                       
    <FilterSet
        key={`ID:$gene`}
        id={`gene`}
        filterList={GeneFilters}
        filter_title="Gene"
        example_query="e.g. RPE"
        maxCount={maxCount}
    />
    );
  } catch (error) {
    console.error("Error fetching Gene filters:", error);
    // Handle error gracefully, e.g., show an error message component
    return <div>Error fetching Gene filters</div>;
  }
}
