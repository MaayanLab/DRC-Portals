import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const axisInfo: Record<string, { 
  id: string; 
  name: string; 
  join?: string; 
}> = {
  'dcc': {
    id: 'f.id_namespace',
    name: 'i.dcc_short_label',
    join: 'LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = f.id_namespace',
  },
  file_format: {
    id: 'f.file_format',
    name: "COALESCE(ff.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.file_format ff ON f.file_format = ff.id WHERE ff.id IS NOT NULL',
  },
  compression_format: {
    id: 'f.compression_format',
    name: "COALESCE(ff2.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.file_format ff2 ON f.compression_format = ff2.id WHERE ff2.id IS NOT NULL',
  },
  data_type: {
    id: 'f.data_type',
    name: "COALESCE(dt.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.data_type dt ON f.data_type = dt.id WHERE dt.id IS NOT NULL',
  },
  assay_type: {
    id: 'f.assay_type',
    name: "COALESCE(at.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.assay_type at ON f.assay_type = at.id WHERE at.id IS NOT NULL',
  },
  analysis_type: {
    id: 'f.analysis_type',
    name: "COALESCE(an.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.analysis_type an ON f.analysis_type = an.id WHERE an.id IS NOT NULL',
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const x_axis: string = searchParams.get('x_axis') ?? 'dcc (id_namespace)';
  const group_by: string = searchParams.get('group_by') ?? '';
  const y_axis = searchParams.get('y_axis') || 'file';

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
    let from = 'FROM c2m2.file f';
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
    console.log('chartData:', chartData);

    return NextResponse.json({ data: chartData });
  } catch (err) {
    console.error('API /getFileCounts error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
