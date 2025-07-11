import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Info for each axis: id, label, join (if needed)
const axisInfo: Record<string, { 
  id: string; 
  name: string; 
  join?: string; 
}> = {
  anatomy: {
    id: 'b.anatomy',
    name: 'a.name',
    join: 'LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy',
  },
  biofluid: {
    id: 'b.biofluid',
    name: 'f.name',
    join: 'LEFT JOIN c2m2.biofluid f ON f.id = b.biofluid',
  },
  sample_prep_method: {
    id: 'b.sample_prep_method',
    name: 's.name',
    join: 'LEFT JOIN c2m2.sample_prep_method s ON s.id = b.sample_prep_method',
  },
  dcc: {
    id: 'b.id_namespace',
    name: 'i.dcc_short_label',
    join: 'LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = b.id_namespace',
  },
  disease: {
    id: 'bd.disease',
    name: 'd.name',
    join: 'LEFT JOIN c2m2.disease d ON d.id = bd.disease',
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const x_axis = searchParams.get('x_axis') ?? 'anatomy';
  const group_by: string = searchParams.get('group_by') ?? '';
  const y_axis = searchParams.get('y_axis') || 'biosample';

  try {
    // Validate axes
    if (!axisInfo[x_axis]) {
      return NextResponse.json({ error: `Unsupported x_axis: ${x_axis}` }, { status: 400 });
    }
    if (group_by && !axisInfo[group_by]) {
      return NextResponse.json({ error: `Unsupported group_by: ${group_by}` }, { status: 400 });
    }

    let selectFields = [`COALESCE(${axisInfo[x_axis].name}, 'Unspecified') AS ${x_axis}`];
    let groupFields = [axisInfo[x_axis].id, axisInfo[x_axis].name];
    let joins: string[] = [];
    let from = 'FROM c2m2.biosample b';
    let countField = 'COUNT(*)::int AS count';

    // Always join for x_axis label if needed
    const joinClause = axisInfo[x_axis].join;
    if (typeof joinClause === 'string') joins.push(joinClause);

    // If group_by provided, add its join and fields
    if (group_by) {
      selectFields.push(`COALESCE(${axisInfo[group_by].name}, 'Unspecified') AS ${group_by}`);
      groupFields.push(axisInfo[group_by].id, axisInfo[group_by].name);
      const gJoin = axisInfo[group_by].join;
      if (typeof gJoin === 'string') joins.push(gJoin);
    }

    // If either axis is disease, join biosample_disease
    if ((x_axis === 'disease' || group_by === 'disease')) {
      // Only add this join if not already present
      joins.unshift(
        'LEFT JOIN c2m2.biosample_disease bd ON b.local_id = bd.biosample_local_id AND b.id_namespace = bd.biosample_id_namespace'
      );
    }

    // Remove duplicate joins
    joins = Array.from(new Set(joins));

    // Compose SQL
    const query = `
      SELECT
        ${selectFields.join(', ')},
        ${countField}
      ${from}
      ${joins.length ? joins.join('\n') : ''}
      GROUP BY ${groupFields.join(', ')}
      ORDER BY count DESC, ${selectFields.map(f => f.split(' AS ')[1]).join(', ')}
      ;
    `;

    const result = await pool.query(query);
    const rawRows = result.rows;

    // Convert to chart-friendly format
    const groupedData: Record<string, Record<string, number>> = {};
    for (const row of rawRows) {
      const xValue = row[x_axis] || 'Unspecified';
      const groupValue = group_by ? (row[group_by] || 'Unspecified') : 'value';
      const count = row.count;
      if (!groupedData[xValue]) groupedData[xValue] = {};
      groupedData[xValue][groupValue] = count;
    }
    const chartData = Object.entries(groupedData).map(([xVal, groupCounts]) => ({
      [x_axis]: xVal,
      ...groupCounts,
    }));

    return NextResponse.json({ data: chartData });
  } catch (err) {
    console.error('API /getBiosampleCounts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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