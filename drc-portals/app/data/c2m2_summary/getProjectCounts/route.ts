import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Info for x_axis (only dcc supported here)
const axisInfo: Record<string, { 
  id: string; 
  name: string; 
  join?: string; 
}> = {
  dcc: {
    id: 'i.id_namespace',
    name: 'i.dcc_short_label',
    join: 'LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = p.id_namespace',
  },
};

function sanitizeName(name: string) {
  return name
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const x_axis: string = searchParams.get('x_axis') ?? 'dcc';
  const y_axis: string = searchParams.get('y_axis') ?? 'project';

  try {
    if (!axisInfo[x_axis]) {
      return NextResponse.json({ error: `Unsupported x_axis: ${x_axis}` }, { status: 400 });
    }

    let selectFields = [`${axisInfo[x_axis].name} AS ${x_axis}`];
    let groupFields = [axisInfo[x_axis].name]; // [axisInfo[x_axis].id, axisInfo[x_axis].name];
    let joins: string[] = [];
    let from = 'FROM c2m2.project p';
    let countField = 'COUNT(DISTINCT p.local_id)::int AS count';

    // Always join for x_axis label if needed
    const xJoin = axisInfo[x_axis].join;
    if (typeof xJoin === 'string') joins.push(xJoin);

    // Compose SQL
    const query = `
      SELECT
        ${selectFields.join(', ')},
        ${countField}
      ${from}
      ${joins.length ? joins.join('\n') : ''}
      GROUP BY ${groupFields.join(', ')}
      ORDER BY count DESC, ${x_axis};
    `;

    const tableName = `c2m2.${sanitizeName(y_axis)}_${sanitizeName(x_axis)}`;
    console.log("Table name = ", tableName);
    console.log('-----------------------------------------------------');
    console.log('/* Y-axis: ', y_axis, 'X-axis: ', x_axis, ' */');
    console.log('Executing SQL query:', query);
    console.log('-----------------------------------------------------');

    const result = await pool.query(query);
    const rawRows = result.rows;

    // Convert to chart-friendly format
    const chartData = rawRows.map((row: Record<string, any>) => ({
      [x_axis]: row[x_axis] || 'Unspecified',
      value: row.count,
    }));

    return NextResponse.json({ data: chartData });
  } catch (err) {
    console.error('API /getProjectCounts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
