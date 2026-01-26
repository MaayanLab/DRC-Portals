import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define axisInfo for supported axes
const axisInfo: Record<string, { 
  id: string; 
  name: string; 
  join?: string; 
}> = {
  dcc: {
    id: 'c.id_namespace',
    name: 'i.dcc_short_label',
    join: 'LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = c.id_namespace',
  },
  anatomy: {
    id: 'ca.anatomy',
    name: "COALESCE(an.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.collection_anatomy ca ON c.local_id = ca.collection_local_id AND c.id_namespace = ca.collection_id_namespace',
      'LEFT JOIN c2m2.anatomy an ON ca.anatomy = an.id',
      'WHERE an.id IS NOT NULL'
    ].join('\n'),
  },
  biofluid: {
    id: 'cb.biofluid',
    name: "COALESCE(bf.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.collection_biofluid cb ON c.local_id = cb.collection_local_id AND c.id_namespace = cb.collection_id_namespace',
      'LEFT JOIN c2m2.biofluid bf ON cb.biofluid = bf.id',
      'WHERE bf.id IS NOT NULL'
    ].join('\n'),
  },
  disease: {
    id: 'cd.disease',
    name: "COALESCE(d.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.collection_disease cd ON c.local_id = cd.collection_local_id AND c.id_namespace = cd.collection_id_namespace',
      'LEFT JOIN c2m2.disease d ON cd.disease = d.id',
      'WHERE d.id IS NOT NULL'
    ].join('\n'),
  },
  protein: {
    id: 'cp.protein',
    name: "COALESCE(p.name, cp.protein, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.collection_protein cp ON c.local_id = cp.collection_local_id AND c.id_namespace = cp.collection_id_namespace',
      'LEFT JOIN c2m2.protein p ON cp.protein = p.id',
      'WHERE p.id IS NOT NULL'
    ].join('\n'),
  },
  compound: {
    id: 'cc.compound',
    name: "COALESCE(cpd.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.collection_compound cc ON c.local_id = cc.collection_local_id AND c.id_namespace = cc.collection_id_namespace',
      'LEFT JOIN c2m2.compound cpd ON cc.compound = cpd.id',
      'WHERE cpd.id IS NOT NULL'
    ].join('\n'),
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const x_axis: string = searchParams.get('x_axis') ?? 'dcc';
  const group_by: string = searchParams.get('group_by') ?? '';
  const y_axis = searchParams.get('y_axis') || 'collection';

  try {
    // Validate axes
    if (!axisInfo[x_axis]) {
      return NextResponse.json({ error: `Unsupported x_axis: ${x_axis}` }, { status: 400 });
    }
    if (group_by && !axisInfo[group_by]) {
      return NextResponse.json({ error: `Unsupported group_by: ${group_by}` }, { status: 400 });
    }

    let selectFields = [`${axisInfo[x_axis].name} AS "${x_axis}"`];
    let groupFields = [axisInfo[x_axis].id, axisInfo[x_axis].name];
    let joins: string[] = [];
    let from = 'FROM c2m2.collection c';
    let countField = 'COUNT(*)::int AS count';

    // Always join for x_axis label if needed
    const xJoin = axisInfo[x_axis].join;
    if (typeof xJoin === 'string') joins.push(xJoin);

    // If group_by provided, add its join and fields
    if (group_by) {
      selectFields.push(`${axisInfo[group_by].name} AS "${group_by}"`);
      groupFields.push(axisInfo[group_by].id, axisInfo[group_by].name);
      const gJoin = axisInfo[group_by].join;
      if (typeof gJoin === 'string') joins.push(gJoin);
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
      ORDER BY count DESC, ${selectFields.map(f => f.split(' AS ')[1].replace(/"/g, '')).join(', ')}
      LIMIT 50;
    `;

    // Log the query for debugging
    console.log('Executing SQL query:', query);

    const result = await pool.query(query);
    const rawRows = result.rows;

    // Convert to chart-friendly format
    const groupedData: Record<string, Record<string, number>> = {};
    for (const row of rawRows) {
      const rowObj = row as Record<string, any>;
      const xValue = rowObj[x_axis] || 'Unspecified';
      const groupValue = group_by ? (rowObj[group_by] || 'Unspecified') : 'value';
      const count = rowObj.count;
      if (!groupedData[xValue]) groupedData[xValue] = {};
      groupedData[xValue][groupValue] = count;
    }
    const chartData = Object.entries(groupedData).map(([xVal, groupCounts]) => ({
      [x_axis]: xVal,
      ...groupCounts,
    }));

    return NextResponse.json({ data: chartData });
  } catch (err) {
    console.error('API /getCollectionCounts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
