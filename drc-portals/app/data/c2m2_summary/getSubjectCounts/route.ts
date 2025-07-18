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
  dcc: {
    id: 's.id_namespace',
    name: 'i.dcc_short_label',
    join: 'LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = s.id_namespace',
  },
  ethnicity: {
    id: 's.ethnicity',
    name: "COALESCE(se.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.subject_ethnicity se ON s.ethnicity = se.id',
  },
  sex: {
    id: 's.sex',
    name: "COALESCE(ss.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.subject_sex ss ON s.sex = ss.id',
  },
  race: {
    id: 'sr.race',
    name: "COALESCE(srcv.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.subject_race sr ON s.local_id = sr.subject_local_id AND s.id_namespace = sr.subject_id_namespace',
      'LEFT JOIN c2m2.subject_race_cv srcv ON sr.race = srcv.id'
    ].join('\n'),
  },
  
  
  disease: {
    id: 'sd.disease',
    name: "COALESCE(d.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.subject_disease sd ON s.local_id = sd.subject_local_id AND s.id_namespace = sd.subject_id_namespace',
      'LEFT JOIN c2m2.disease d ON d.id = sd.disease'
    ].join('\n'),
  },
  granularity: {
    id: 's.granularity',
    name: "COALESCE(sg.name, 'Unspecified')",
    join: 'LEFT JOIN c2m2.subject_granularity sg ON s.granularity = sg.id',
  },
  role: {
    id: 'srt.role_id',
    name: "COALESCE(sr2.name, 'Unspecified')",
    join: [
      'LEFT JOIN c2m2.subject_role_taxonomy srt ON s.local_id = srt.subject_local_id AND s.id_namespace = srt.subject_id_namespace',
      'LEFT JOIN c2m2.subject_role sr2 ON srt.role_id = sr2.id'
    ].join('\n'),
  },
  
  
};


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const x_axis: string = searchParams.get('x_axis') ?? 'dcc';
  const group_by: string = searchParams.get('group_by') ?? '';
  const y_axis = searchParams.get('y_axis') || 'subject';

  try {
    // Validate axes
    if (!axisInfo[x_axis]) {
      return NextResponse.json({ error: `Unsupported x_axis: ${x_axis}` }, { status: 400 });
    }
    if (group_by && !axisInfo[group_by]) {
      return NextResponse.json({ error: `Unsupported group_by: ${group_by}` }, { status: 400 });
    }

    let selectFields = [`${axisInfo[x_axis].name} AS ${x_axis}`];
    let groupFields = [axisInfo[x_axis].id, axisInfo[x_axis].name];
    let joins: string[] = [];
    let from = 'FROM c2m2.subject s';
    let countField = 'COUNT(*)::int AS count';

    // Always join for x_axis label if needed
    const xJoin = axisInfo[x_axis].join;
    if (typeof xJoin === 'string') joins.push(xJoin);

    // If group_by provided, add its join and fields
    if (group_by) {
      selectFields.push(`${axisInfo[group_by].name} AS ${group_by}`);
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
      ORDER BY count DESC, ${selectFields.map(f => f.split(' AS ')[1]).join(', ')}
      ;
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
    console.error('API /getSubjectCount error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
