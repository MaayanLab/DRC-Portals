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
      LIMIT 50;
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
