'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { saveAs } from 'file-saver';
import C2M2BarChart from './C2M2BarChart';
import C2M2PieChart from './C2M2PieChart';

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
  pieForAxis?: string; // Optional: custom x-axis label for Pie chart
}

interface ComboResult {
  combination: Combination;
  chartData: ChartRow[];
  error?: string;
  colorMap?: Record<string, string>;
}

// Default combinations with optional pieForAxis
const defaultCombos: Combination[] = [
  { yAxis: 'Biosamples count', xAxis: 'dcc', groupBy: 'anatomy' },
  // { yAxis: 'Biosamples count', xAxis: 'dcc', groupBy: 'disease' },
  // { yAxis: 'Subjects count', xAxis: 'dcc', groupBy: 'taxonomy_id', pieForAxis: 'MoTrPAC' },
  { yAxis: 'Subjects count', xAxis: 'dcc', groupBy: 'disease', pieForAxis: 'KidsFirst' },
  { yAxis: 'Files count', xAxis: 'dcc', groupBy: 'assay_type', pieForAxis: 'KidsFirst' },
  { yAxis: 'Files count', xAxis: 'dcc', groupBy: 'data_type' },
  { yAxis: 'Collections count', xAxis: 'dcc', groupBy: 'protein' }
];

const endpointMap: Partial<Record<YAxisField, string>> = {
  'Subjects count': '/data/c2m2_summary/getSubjectCounts',
  'Biosamples count': '/data/c2m2_summary/getBiosampleCounts',
  'Files count': '/data/c2m2_summary/getFileCounts',
  'Collections count': '/data/c2m2_summary/getCollectionCounts',
  'Projects count': '/data/c2m2_summary/getProjectCounts',
};

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

// Used for x_axis display and prompt
const dispXAxis = (x: string) => (x === 'dcc' ? 'NIH Common Fund program' : x || '[none]');

// Generate prompt with X and Y axis summary for ALL plots
const getCombinedPrompt = (combos: Combination[]) => {
  const plots = combos.map((combo, idx) =>
    `Figure ${idx + 1}: Bar chart of "${combo.yAxis}" by "${dispXAxis(combo.xAxis)}"` +
    (combo.groupBy ? `, grouped by "${combo.groupBy}"` : '') +
    (combo.xAxis === 'dcc' ? ' (treat x-axis as NIH Common Fund program)' : '')
  );
  return `Describe the key trends and insights across the following charts, referencing 'NIH Common Fund program' for dcc on the x-axis:\n\n${plots.join('\n')}\n\nGenerate an integrated, concise and informative summary for the entire report.`;
};

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

      // Send one prompt to LLM for all charts
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

  // Export (keeps only table data, not the unified plot description)
  const exportReport = () => {
    let report = '';
    results.forEach(r => {
      report += `\n=== Plot: Y-axis = ${r.combination.yAxis}, X-axis = ${r.combination.xAxis}, Group by = ${r.combination.groupBy} ===\n`;
      if (r.chartData && r.chartData.length > 0) {
        report += JSON.stringify(r.chartData, null, 2) + '\n';
      }
    });
    report += '\n=== Report Summary ===\n' + combinedDescription;
    const blob = new Blob([report], { type: 'text/plain' });
    saveAs(blob, 'c2m2_summary_report.txt');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        C2M2 Default Summary Chart Report
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This report auto-generates key summary plots for C2M2 datasets, including bar and pie charts, along with a unified summary at the bottom.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={exportReport} disabled={results.length === 0}>
          Export Text Report
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {globalError && <Alert severity="error">{globalError}</Alert>}

      <Box sx={{ mt: 3 }}>
        {results.map((res, i) => (
          <Paper sx={{ p: 2, mb: 3 }} key={i} elevation={2}>
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
