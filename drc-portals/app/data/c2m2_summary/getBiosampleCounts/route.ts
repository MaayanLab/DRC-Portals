// File: app/api/getBiosampleCount/route.ts
import { NextResponse } from 'next/server';
import { generateDummyGroupedData } from '../_utils/generateDummyGroupedData';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const x_axis = searchParams.get('x_axis') || 'dcc';
    const group_by = searchParams.get('group_by');
    const y_axis = searchParams.get('y_axis') || 'subject';

    const data = generateDummyGroupedData({ x_axis, group_by, y_axis });
    return NextResponse.json({ data });
}


/* --- sql code for various combinations of x axis and group by for subject counts
--- Use if/then etc in tsx code to invoke one of these, i.e. these will form part of the mix of tsx/sql code.

--- For biosample table, try the different combinations
--- Include group by
--- Get count of biosample[y axis/count parameter] by anatomy[x axis parameter], group by disease[group by parameter]
--- This also applies to association_type instead of disease
--- Join with c2m2.biosample_disease is needed since disease column is in that table and not directly in the c2m2.biosample table.
SELECT
  tmp.anatomy AS "Anatomy ID",
  COALESCE(a.name, 'Unspecified') AS "Anatomy name",
  tmp.disease AS "Disease ID",
  COALESCE(d.name, 'Unspecified') AS "Disease name",
  tmp.count AS "Biosample Count"
FROM (
  SELECT
    b.anatomy,
    bd.disease,
    COUNT(*) AS count
  FROM c2m2.biosample b
  LEFT JOIN c2m2.biosample_disease bd
    ON b.local_id = bd.biosample_local_id
    AND b.id_namespace = bd.biosample_id_namespace
  GROUP BY b.anatomy, bd.disease
) tmp
LEFT JOIN c2m2.anatomy a ON a.id = tmp.anatomy
LEFT JOIN c2m2.disease d ON d.id = tmp.disease
ORDER BY tmp.count DESC, a.name, d.name;

--- if x axis is anatomy but no group by is selected then join with c2m2.biosample_disease is not needed
SELECT
  b.anatomy AS "Anatomy ID",
  COALESCE(a.name, 'Unspecified') AS "Anatomy name",
  COUNT(*) AS "Biosample Count"
FROM c2m2.biosample b
LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
GROUP BY b.anatomy, a.name
ORDER BY COUNT(*) DESC, a.name;

--- if x axis is anatomy but group by is sample_prep_method or biofluid (already in the c2m2.biosample table) then join with c2m2.biosample_disease is not needed
SELECT
  b.anatomy AS "Anatomy ID",
  COALESCE(a.name, 'Unspecified') AS "Anatomy name",
  b.sample_prep_method AS "Sample Prep Method ID",
  COALESCE(s.name, 'Unspecified') AS "Sample Prep Method name",
  COUNT(*) AS "Biosample Count"
FROM c2m2.biosample b
LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
LEFT JOIN c2m2.sample_prep_method s ON s.id = b.sample_prep_method
GROUP BY b.anatomy, a.name, b.sample_prep_method, s.name
ORDER BY COUNT(*) DESC, a.name, s.name;

--- x axis is anatomy, group by is biofluid
SELECT
  b.anatomy AS "Anatomy ID",
  COALESCE(a.name, 'Unspecified') AS "Anatomy name",
  b.biofluid AS "Biofluid ID",
  COALESCE(f.name, 'Unspecified') AS "Biofluid name",
  COUNT(*) AS "Biosample Count"
FROM c2m2.biosample b
LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
LEFT JOIN c2m2.biofluid f ON f.id = b.biofluid
GROUP BY b.anatomy, b.biofluid, a.name, f.name
ORDER BY COUNT(*) DESC, a.name, f.name;

--- If one of them is dcc, then, a join with c2m2.id_namespace_dcc_id is needed

--- x axis is dcc, group by is not specified
SELECT
  b.id_namespace AS "Biosample ID namespace",
  i.dcc_short_label AS "DCC Short Label",
  COUNT(*) AS "Biosample Count"
FROM c2m2.biosample b
LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = b.id_namespace
GROUP BY b.id_namespace, i.dcc_short_label
ORDER BY COUNT(*) DESC, i.dcc_short_label;

--- x axis is anatomy, group by is dcc
SELECT
  b.anatomy AS "Anatomy ID",
  COALESCE(a.name, 'Unspecified') AS "Anatomy name",
  b.id_namespace AS "Biosample ID namespace",
  i.dcc_short_label AS "DCC Short Label",
  COUNT(*) AS "Biosample Count"
FROM c2m2.biosample b
LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = b.id_namespace
GROUP BY b.anatomy, a.name, b.id_namespace, i.dcc_short_label
ORDER BY COUNT(*) DESC, a.name, i.dcc_short_label;

--- x axis is dcc, group by is disease
SELECT
  tmp.id_namespace AS "Biosample ID namespace",
  i.dcc_short_label AS "DCC Short Label",
  tmp.disease AS "Disease ID",
  COALESCE(d.name, 'Unspecified') AS "Disease name",
  tmp.count AS "Biosample Count"
FROM (
  SELECT
    b.id_namespace,
    bd.disease,
    COUNT(*) AS count
  FROM c2m2.biosample b
  LEFT JOIN c2m2.biosample_disease bd
    ON b.local_id = bd.biosample_local_id
    AND b.id_namespace = bd.biosample_id_namespace
  GROUP BY b.id_namespace, bd.disease
) tmp
LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = tmp.id_namespace
LEFT JOIN c2m2.disease d ON d.id = tmp.disease
ORDER BY tmp.count DESC, i.dcc_short_label, d.name;

*/