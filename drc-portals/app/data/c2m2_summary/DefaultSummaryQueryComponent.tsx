'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { saveAs } from 'file-saver';
import C2M2BarChart from './C2M2BarChart';
import C2M2PieChart from './C2M2PieChart';

// install html2canvas: npm i html2canvas

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
  pieForAxis?: string;
}

interface ComboResult {
  combination: Combination;
  chartData: ChartRow[];
  error?: string;
  colorMap?: Record<string, string>;
}

// Default combinations
const defaultCombos: Combination[] = [
  { yAxis: 'Biosamples count', xAxis: 'dcc', groupBy: 'anatomy'  },
  { yAxis: 'Biosamples count', xAxis: 'dcc', groupBy: 'disease'  },
  { yAxis: 'Subjects count', xAxis: 'dcc', groupBy: 'disease', pieForAxis: 'KidsFirst' },
  { yAxis: 'Files count', xAxis: 'dcc', groupBy: 'assay_type', pieForAxis: 'KidsFirst' },
  { yAxis: 'Files count', xAxis: 'dcc', groupBy: 'data_type' },
  { yAxis: 'Collections count', xAxis: 'dcc', groupBy: 'protein' }
];

// Endpoint map
const endpointMap: Partial<Record<YAxisField, string>> = {
  'Subjects count': '/data/c2m2_summary/getSubjectCounts',
  'Biosamples count': '/data/c2m2_summary/getBiosampleCounts',
  'Files count': '/data/c2m2_summary/getFileCounts',
  'Collections count': '/data/c2m2_summary/getCollectionCounts',
  'Projects count': '/data/c2m2_summary/getProjectCounts',
};

// Utility functions
const cleanChartData = (data: ChartRow[], xAxis: string) =>
  data.map(row => {
    const newRow: ChartRow = { ...row };
    Object.keys(newRow).forEach(key => {
      const val = newRow[key];
      if (key !== xAxis && key !== 'Unspecified' && typeof val === 'number' && val <= 0) {
        newRow[key] = 1;
      }
    });
    return newRow;
  });

const generateColorMap = (row: ChartRow, xAxis: string) => {
  const keys = Object.keys(row).filter(k => k !== xAxis && k !== 'Unspecified');
  const colors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
  ];
  const colorMap: Record<string, string> = {};
  keys.forEach((k, i) => colorMap[k] = colors[i % colors.length]);
  return colorMap;
};

const generatePieData = (row: ChartRow, xAxis: string) =>
  Object.keys(row)
    .filter(k => k !== xAxis && k !== 'Unspecified')
    .map(k => ({ name: k, value: typeof row[k] === 'number' ? row[k] as number : 0 }))
    .filter(d => d.value > 0);

const dispXAxis = (x: string) => (x === 'dcc' ? 'NIH Common Fund program' : x || '[none]');

const getCombinedPrompt = (combos: Combination[]) => {
  const plots = combos.map((combo, idx) =>
    `Figure ${idx + 1}: Bar chart of "${combo.yAxis}" by "${dispXAxis(combo.xAxis)}"` +
    (combo.groupBy ? `, grouped by "${combo.groupBy}"` : '') +
    (combo.xAxis === 'dcc' ? ' (treat x-axis as NIH Common Fund program)' : '')
  );
  return `Describe the key trends and insights across the following charts, referencing 'NIH Common Fund program' for dcc on the x-axis:\n\n${plots.join('\n')}\n\nGenerate an integrated, concise and informative summary for the entire report.`;
};

// Main component
const DefaultSummaryQueryComponent: React.FC = () => {
  const [results, setResults] = useState<ComboResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [combinedDescription, setCombinedDescription] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function generateAll() {
      setLoading(true);
      setGlobalError(null);
      const allResults: ComboResult[] = [];

      for (const combo of defaultCombos) {
        const endpoint = endpointMap[combo.yAxis];
        if (!endpoint) {
          allResults.push({ combination: combo, chartData: [], error: 'Invalid endpoint' });
          continue;
        }

        try {
          const params = new URLSearchParams({
            x_axis: combo.xAxis,
            y_axis: combo.yAxis.toLowerCase().replace(/\s/g, ''),
            group_by: combo.groupBy,
          });
          const dataResp = await fetch(`${endpoint}?${params.toString()}`);
          const dataJson = await dataResp.json();
          const rawChartData: ChartRow[] = dataJson?.data || [];
          console.log(rawChartData);
          const cleaned = cleanChartData(rawChartData, combo.xAxis);
          const colorMap = generateColorMap(cleaned[0] || {}, combo.xAxis);

          allResults.push({
            combination: combo,
            chartData: cleaned,
            error: undefined,
            colorMap,
          });
        } catch (e) {
          allResults.push({
            combination: combo,
            chartData: [],
            error: (e as any)?.message || 'Error fetching data/desc',
          });
        }
      }

      // Unified description
      let unifiedDescription = '';
      try {
        const prompt = getCombinedPrompt(defaultCombos);
        const descResp = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const descJson = await descResp.json();
        unifiedDescription = descJson.description || descJson.descriptions?.join('\n') || '';
      } catch (e) {
        unifiedDescription = 'Failed to generate summary.';
      }

      if (!cancelled) {
        setResults(allResults);
        setCombinedDescription(unifiedDescription);
        setLoading(false);
      }
    }

    generateAll();
    return () => { cancelled = true; };
  }, []);

  // Export HTML report with embedded images
  const exportHtmlReport = async () => {
    if (results.length === 0) return;
    setLoading(true);
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = (html2canvasModule as any).default ?? html2canvasModule;
      const capturedImages: string[] = [];

      for (let i = 0; i < results.length; i++) {
        const node = document.getElementById(`chart-container-${i}`);
        if (!node) {
          capturedImages.push('');
          continue;
        }
        const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' });
        const dataUrl = canvas.toDataURL('image/png');
        capturedImages.push(dataUrl);
      }

      const safeTitle = 'C2M2 Summary Report';
      const style = `
        body{font-family: Arial, Helvetica, sans-serif; margin:20px; color:#111}
        .header{margin-bottom:24px}
        .chart{margin: 20px 0; border:1px solid #ddd; padding:12px; border-radius:6px}
        .chart img{max-width:100%; height:auto; display:block; margin-bottom:8px}
        pre{background:#f7f7f7; padding:12px; overflow:auto}
        h2,h3{margin:8px 0}
      `;

      let bodyHtml = `<div class="header"><h1>${safeTitle}</h1>`;
      bodyHtml += `<p>Building on the C2M2 framework, this report presents a series of visual summaries that highlight the distribution and relationships among core metadata entities within the NIH Common Fund Data Ecosystem.</p>`;
      bodyHtml += `</div>`;

      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        bodyHtml += `<div class="chart">`;
        bodyHtml += `<h2>Plot ${i + 1}: ${r.combination.yAxis} vs ${dispXAxis(r.combination.xAxis)}</h2>`;
        bodyHtml += `<h3>Group by: ${r.combination.groupBy || '[none]'}</h3>`;
        if (capturedImages[i]) {
          bodyHtml += `<img alt="chart-${i}" src="${capturedImages[i]}"/>`;
        } else {
          bodyHtml += `<p><em>Chart image not available</em></p>`;
        }
        bodyHtml += `<details><summary>Chart data (JSON)</summary><pre>${escapeHtml(JSON.stringify(r.chartData || [], null, 2))}</pre></details>`;
        bodyHtml += `</div>`;
      }

      if (combinedDescription) {
        bodyHtml += `<section><h2>Combined Figure Description</h2><pre>${escapeHtml(combinedDescription)}</pre></section>`;
      }

      const finalHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>${style}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

      const blob = new Blob([finalHtml], { type: 'text/html' });
      saveAs(blob, 'c2m2_summary_report.html');
    } catch (err) {
      console.error('Failed to export HTML report', err);
      setGlobalError('Failed to export HTML report: ' + ((err as any)?.message || 'unknown error'));
    } finally {
      setLoading(false);
    }
  };

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with sticky button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10, pt: 1, pb: 1 }}>
        <Typography variant="h5">
          C2M2 Default Summary Chart Report
        </Typography>
        <Button
          variant="contained"
          onClick={exportHtmlReport}
          disabled={results.length === 0 || loading}
        >
          Export HTML Report
        </Button>
      </Box>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Building on the C2M2 framework, this report presents a series of visual summaries that highlight the distribution and relationships among core metadata entities within the NIH Common Fund Data Ecosystem. Specifically, it focuses on counts of key entities—subjects, biosamples, projects, collections, and files—plotted along the y-axis, with various related entities such as anatomical sources, disease states, assay types, and contributing programs displayed along the x-axis. Many plots also incorporate a group-by dimension, allowing for layered comparisons across additional metadata categories. Together, these visualizations offer an intuitive overview of how data is structured, submitted, and distributed across Common Fund programs, providing valuable insights into the scale, scope, and context of the available resources.
      </Typography>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {globalError && <Alert severity="error">{globalError}</Alert>}

      <Box sx={{ mt: 3 }}>
        {results.map((res, i) => (
          <Paper sx={{ p: 2, mb: 3 }} key={i} elevation={2} id={`chart-container-${i}`}>
            <Typography variant="h6">
              Plot {i + 1}: {res.combination.yAxis} vs {dispXAxis(res.combination.xAxis)} (group by {res.combination.groupBy})
            </Typography>
            {res.error && <Alert severity="warning">{res.error}</Alert>}

            {res.chartData && res.chartData.length > 0 ? (
              <>
                <C2M2BarChart
                  data={res.chartData}
                  xAxis={res.combination.xAxis}
                  groupValues={Object.keys(res.chartData[0]).filter(k => k !== res.combination.xAxis && k !== 'Unspecified')}
                  colorMap={res.colorMap || {}}
                  showUnspecified={false}
                  minBarWidth={60}
                  minChartWidth={600}
                />
                {res.combination.pieForAxis && (
                  <Box sx={{ mt: 2 }}>
                    <C2M2PieChart
                      data={generatePieData(res.chartData[0], res.combination.pieForAxis)}
                      colorMap={res.colorMap || {}}
                      title={`Breakdown by ${res.combination.pieForAxis}`}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Typography color="textSecondary">No data available.</Typography>
            )}
          </Paper>
        ))}
      </Box>

      {combinedDescription && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Combined Figure Description
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{combinedDescription}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DefaultSummaryQueryComponent;