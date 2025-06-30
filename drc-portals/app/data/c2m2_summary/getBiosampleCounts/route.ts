import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const x_axis = searchParams.get('x_axis') || 'anatomy';
  const group_by = searchParams.get('group_by') || 'disease';
  const y_axis = searchParams.get('y_axis') || 'biosample';

  try {
    let query = '';
    const values: any[] = [];

    // anatomy + disease
    if (x_axis === 'anatomy' && group_by === 'disease') {
      query = `
        SELECT
          COALESCE(a.name, 'Unspecified') AS anatomy,
          COALESCE(d.name, 'Unspecified') AS disease,
          tmp.count::int AS count
        FROM (
          SELECT b.anatomy, bd.disease, COUNT(*) AS count
          FROM c2m2.biosample b
          LEFT JOIN c2m2.biosample_disease bd
            ON b.local_id = bd.biosample_local_id
            AND b.id_namespace = bd.biosample_id_namespace
          GROUP BY b.anatomy, bd.disease
        ) tmp
        LEFT JOIN c2m2.anatomy a ON a.id = tmp.anatomy
        LEFT JOIN c2m2.disease d ON d.id = tmp.disease
        ORDER BY tmp.count DESC, a.name, d.name
        LIMIT 50;
      `;
    }
    // anatomy + sample_prep_method
    else if (x_axis === 'anatomy' && group_by === 'sample_prep_method') {
      query = `
        SELECT
          COALESCE(a.name, 'Unspecified') AS anatomy,
          COALESCE(s.name, 'Unspecified') AS sample_prep_method,
          COUNT(*)::int AS count
        FROM c2m2.biosample b
        LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
        LEFT JOIN c2m2.sample_prep_method s ON s.id = b.sample_prep_method
        GROUP BY b.anatomy, a.name, b.sample_prep_method, s.name
        ORDER BY COUNT(*) DESC, a.name, s.name
        LIMIT 50;
      `;
    }
    // anatomy + biofluid
    else if (x_axis === 'anatomy' && group_by === 'biofluid') {
      query = `
        SELECT
          COALESCE(a.name, 'Unspecified') AS anatomy,
          COALESCE(f.name, 'Unspecified') AS biofluid,
          COUNT(*)::int AS count
        FROM c2m2.biosample b
        LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
        LEFT JOIN c2m2.biofluid f ON f.id = b.biofluid
        GROUP BY b.anatomy, b.biofluid, a.name, f.name
        ORDER BY COUNT(*) DESC, a.name, f.name
        LIMIT 50;
      `;
    }
    // anatomy + dcc
    else if (x_axis === 'anatomy' && group_by === 'dcc') {
      query = `
        SELECT
          COALESCE(a.name, 'Unspecified') AS anatomy,
          COALESCE(i.dcc_short_label, 'Unspecified') AS dcc,
          COUNT(*)::int AS count
        FROM c2m2.biosample b
        LEFT JOIN c2m2.anatomy a ON a.id = b.anatomy
        LEFT JOIN c2m2.id_namespace_dcc_id i ON i.id_namespace_id = b.id_namespace
        GROUP BY b.anatomy, a.name, b.id_namespace, i.dcc_short_label
        ORDER BY COUNT(*) DESC, a.name, i.dcc_short_label
        LIMIT 50;
      `;
    }
    // unsupported
    else {
      return NextResponse.json(
        { error: `Unsupported combination: x_axis=${x_axis}, group_by=${group_by}` },
        { status: 400 }
      );
    }

    const result = await pool.query(query, values);
    const rawRows = result.rows;

    // Convert to chart-friendly format
    const groupedData: Record<string, Record<string, number>> = {};

    for (const row of rawRows) {
      const xValue = row[x_axis] || 'Unspecified';
      const groupValue = row[group_by] || 'Unspecified';
      const count = row.count;

      if (!groupedData[xValue]) {
        groupedData[xValue] = {};
      }
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
