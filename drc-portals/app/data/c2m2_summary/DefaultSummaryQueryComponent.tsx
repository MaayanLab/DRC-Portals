// npm install file-saver --save
// npm install @types/file-saver --save-dev
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import C2M2BarChart from './C2M2BarChart';
import { saveAs } from 'file-saver';

type YAxisField =
  | 'Subjects count'
  | 'Biosamples count'
  | 'Files count'
  | 'Projects count'
  | 'Collections count';

interface ChartRow {
  [key: string]: string | number | undefined;
}

interface Combination {
  yAxis: YAxisField;
  xAxis: string;
  groupBy: string;
}

interface ComboResult {
  combination: Combination;
  chartData: ChartRow[];
  description: string;
  error?: string;
}

// Define your default combinations
const defaultCombos: Combination[] = [
  { yAxis: 'Biosamples count', xAxis: 'dcc', groupBy: 'anatomy' },
  { yAxis: 'Biosamples count', xAxis: 'dcc', groupBy: 'disease' }
  // { yAxis: 'Subjects count', xAxis: 'dcc', groupBy: 'sex' },
  // { yAxis: 'Files count', xAxis: 'file_format', groupBy: 'assay_type' },
  // { yAxis: 'Collections count', xAxis: 'anatomy', groupBy: 'disease' }
  // Add or modify as needed
];

const endpointMap: Partial<Record<YAxisField, string>> = {
  'Subjects count': '/data/c2m2_summary/getSubjectCounts',
  'Biosamples count': '/data/c2m2_summary/getBiosampleCounts',
  'Files count': '/data/c2m2_summary/getFileCounts',
  'Collections count': '/data/c2m2_summary/getCollectionCounts',
  'Projects count': '/data/c2m2_summary/getProjectCounts',
};

// Utility to clean 0/neg values
const cleanChartData = (data: ChartRow[], xAxis: string) =>
  data.map(row => {
    const newRow: ChartRow = { ...row };
    Object.keys(newRow).forEach(key => {
      const val = newRow[key];
      if (key !== xAxis && typeof val === 'number' && val <= 0) {
        newRow[key] = 1;
      }
    });
    return newRow;
  });

const getChartPrompt = (combo: Combination) => {
  let out = `Generate a concise description of a bar chart with the following parameters:
- Y-axis: ${combo.yAxis}
- X-axis: ${combo.xAxis}`;
  if (combo.groupBy) out += `\n- Group by: ${combo.groupBy}`;
  out += `
Describe what kind of data this chart shows and what insights it might reveal.`;
  return out;
};

const DefaultSummaryQueryComponent: React.FC = () => {
  const [results, setResults] = useState<ComboResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function generateAll() {
      setLoading(true);
      setGlobalError(null);
      const allResults: ComboResult[] = [];
      for (const combo of defaultCombos) {
        const endpoint = endpointMap[combo.yAxis];
        if (!endpoint) {
          allResults.push({
            combination: combo,
            chartData: [],
            description: '',
            error: 'Invalid endpoint',
          });
          continue;
        }
        try {
          // 1. Fetch chart data
          const params = new URLSearchParams({
            x_axis: combo.xAxis,
            y_axis: combo.yAxis.toLowerCase().replace(/\s/g, ''),
            group_by: combo.groupBy,
          });
          const dataResp = await fetch(`${endpoint}?${params.toString()}`);
          const dataJson = await dataResp.json();
          const rawChartData: ChartRow[] = dataJson?.data || [];
          const cleaned = cleanChartData(rawChartData, combo.xAxis);

          // 2. Generate description
          const prompt = getChartPrompt(combo);
          const descResp = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });
          const descJson = await descResp.json();
          const description = descJson.description || descJson.error || 'No description';

          if (!cancelled) {
            allResults.push({
              combination: combo,
              chartData: cleaned,
              description: description,
              error: descJson.error ? 'Description error' : undefined,
            });
            setResults([...allResults]);
          }
        } catch (e) {
          if (!cancelled) {
            allResults.push({
              combination: combo,
              chartData: [],
              description: '',
              error: (e as any)?.message || 'Error fetching data/desc',
            });
            setResults([...allResults]);
          }
        }
      }
      if (!cancelled) setLoading(false);
    }
    generateAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Export text report
  const exportReport = () => {
    let report = '';
    results.forEach(r => {
      report += `\n=== Chart: Y-axis = ${r.combination.yAxis}, X-axis = ${r.combination.xAxis}, Group by = ${r.combination.groupBy} ===\n`;
      report += r.description + '\n';
    });
    const blob = new Blob([report], { type: 'text/plain' });
    saveAs(blob, 'c2m2_summary_report.txt');
  };

  // Helper to format chart data as table (optional)
  function htmlTableForChartData(data: ChartRow[]) {
    if (data.length === 0) return '';
    const columns = Object.keys(data[0]);
    const thead = columns.map(col => `<th>${col}</th>`).join('');
    const rows = data
      .map(
        row =>
          '<tr>' +
          columns
            .map(col => `<td>${row[col] !== undefined ? row[col] : ''}</td>`)
            .join('') +
          '</tr>'
      )
      .join('');
    return `
      <details>
        <summary>Chart data (table)</summary>
        <table border="1" cellpadding="4" style="margin-top:1em;border-collapse:collapse;">
          <thead><tr>${thead}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </details>
    `;
  }

  // Export HTML report
  const exportHTMLReport = () => {
    let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>C2M2 Summary HTML Report</title>
<style>
  body { font-family: Arial, sans-serif; margin: 2em; background: #fff; }
  h2 { margin-top: 2em; }
  .desc { background: #f5f5f5; padding: 1em; border-radius: 5px; white-space: pre-wrap; }
  .section { margin-bottom: 2em; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  details summary { cursor: pointer; font-weight: bold; margin-bottom: 0.5em; }
</style>
</head>
<body>
<h1>Default Summary Chart Report</h1>
<p>Auto-generated for C2M2 summary charts and descriptions.</p>
`;

    results.forEach((r, idx) => {
      html += `
  <div class="section">
    <h2>Plot ${idx + 1}: Y-axis = ${r.combination.yAxis}, X-axis = ${r.combination.xAxis}, Group by = ${r.combination.groupBy}</h2>
    ${r.error ? `<p style="color: red;">Error: ${r.error}</p>` : ''}
    <div class="desc">
      <strong>Description:</strong>
      <pre>${r.description}</pre>
    </div>
    ${r.chartData && r.chartData.length > 0 ? htmlTableForChartData(r.chartData) : '<em>No data available.</em>'}
  </div>
`;
    });

    html += '</body></html>';

    const blob = new Blob([html], { type: 'text/html' });
    saveAs(blob, 'c2m2_summary_report.html');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Default Summary Chart Report
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Auto-generating multiple summary plots and descriptions for C2M2 key fields.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={exportReport} disabled={results.length === 0}>
          Export Text Report
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={exportHTMLReport}
          disabled={results.length === 0}
        >
          Export HTML Report
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {globalError && <Alert severity="error">{globalError}</Alert>}

      <Box sx={{ mt: 3 }}>
        {results.map((res, i) => (
          <Paper sx={{ p: 2, mb: 3 }} key={i} elevation={2}>
            <Typography variant="h6">
              Plot {i + 1}: {res.combination.yAxis} vs {res.combination.xAxis} (group by {res.combination.groupBy})
            </Typography>
            {res.error && <Alert severity="warning">{res.error}</Alert>}
            {res.chartData && res.chartData.length > 0 ? (
              <C2M2BarChart
                data={res.chartData}
                xAxis={res.combination.xAxis}
                groupValues={Object.keys(res.chartData[0] ?? {}).filter(k => k !== res.combination.xAxis)}
                colorMap={{}}
                showUnspecified={false}
                minBarWidth={60}
                minChartWidth={600}
              />
            ) : (
              <Typography color="textSecondary">No data available.</Typography>
            )}
            <Box sx={{ mt: 2, bg: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1">Plot Description</Typography>
              <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{res.description}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default DefaultSummaryQueryComponent;
