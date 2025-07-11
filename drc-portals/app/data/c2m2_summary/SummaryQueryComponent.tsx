'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Box, Grid, FormControl, InputLabel, MenuItem, Select, Typography, Button,
  CircularProgress, Alert, Switch, FormControlLabel
} from '@mui/material';
import * as htmlToImage from 'html-to-image';

// Utility: Convert JSON array to CSV string (handles commas/quotes)
function jsonToCsv(data: any[]): string {
  if (!data.length) return '';
  const keys = Object.keys(data[0]);
  const escape = (val: any) =>
    typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))
      ? `"${val.replace(/"/g, '""')}"`
      : val ?? '';
  const header = keys.join(',');
  const rows = data.map(row => keys.map(k => escape(row[k])).join(','));
  return [header, ...rows].join('\n');
}

// Custom scrollable tooltip for Recharts
const CustomScrollableTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: 10,
        maxHeight: 200,
        overflowY: 'auto',
        minWidth: 150,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ color: entry.color, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span>{entry.name}</span>
            <span style={{ marginLeft: 12 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

type YAxisField =
  | 'Subjects count'
  | 'Biosamples count'
  | 'Files count'
  | 'Projects count'
  | 'Collections count';

const axisOptionsMap: Record<YAxisField, string[]> = {
  'Subjects count': ['dcc', 'ethnicity', 'sex', 'race', 'disease', 'granularity', 'role'],
  'Biosamples count': ['dcc', 'anatomy', 'biofluid', 'sample_prep_method', 'disease'],
  'Files count': ['dcc', 'file_format', 'assay_type', 'analysis_type', 'data_type', 'compression_format'],
  'Collections count': ['dcc', 'anatomy', 'biofluid', 'disease', 'phenotype', 'compound', 'protein'],
  'Projects count': ['dcc'],
};

const patternId = "dottedUnspecified";

const SummaryQueryComponent = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Biosamples count');
  const [xAxis, setXAxis] = useState<string>(axisOptionsMap['Biosamples count'][0]);
  const [groupBy, setGroupBy] = useState<string>(axisOptionsMap['Biosamples count'][1] || '');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'csv' | 'json'>('png');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnspecified, setShowUnspecified] = useState<boolean>(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Dropdown logic
  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    setXAxis(axes[0]);
    setGroupBy(axes.length > 1 ? axes[1] : '');
  }, [yAxis]);

  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    const newGroupOptions = axes.filter((opt) => opt !== xAxis);
    setGroupBy(newGroupOptions[0] || '');
  }, [xAxis, yAxis]);

  const xOptions = axisOptionsMap[yAxis];
  const groupOptions = xOptions.filter((opt) => opt !== xAxis);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          x_axis: xAxis,
          y_axis: yAxis.toLowerCase().replace(/ /g, ''),
          group_by: groupBy
        });

        let endpoint = '';
        if (yAxis === 'Subjects count') {
          endpoint = '/data/c2m2_summary/getSubjectCounts';
        } else if (yAxis === 'Biosamples count') {
          endpoint = '/data/c2m2_summary/getBiosampleCounts';
        } else if (yAxis === 'Files count') {
          endpoint = '/data/c2m2_summary/getFileCounts';
        } else if (yAxis === 'Collections count') {
          endpoint = '/data/c2m2_summary/getCollectionCounts';
        } else {
          setError('Endpoint not implemented for this count type.');
          setChartData([]);
          setLoading(false);
          return;
        }

        const url = `${endpoint}?${params.toString()}`;
        const res = await fetch(url);
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (!json.data) throw new Error('No data in response');
          setChartData(json.data);
        } catch (e) {
          setError('Failed to parse JSON response: ' + e);
          setChartData([]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [yAxis, xAxis, groupBy]);

  // Group keys
  const groupValues = groupBy ? Array.from(
    chartData.reduce<Set<string>>((set, item) => {
      Object.keys(item).forEach((key) => {
        if (key !== xAxis) set.add(key);
      });
      return set;
    }, new Set())
  ) : ['value'];

  // Color map
  const generateColors = (keys: string[]) => {
    const count = Math.max(keys.length, 1);
    return keys.reduce((map, key, i) => {
      map[key] = `hsl(${(i * 360) / count}, 60%, 55%)`;
      return map;
    }, {} as Record<string, string>);
  };
  const colorMap = generateColors(groupValues);

  // Clean data for log scale (all bar values > 0)
  const cleanedChartData = chartData.map(row => {
    const newRow: any = { ...row };
    Object.keys(newRow).forEach(key => {
      if (key !== xAxis && (newRow[key] == null || newRow[key] <= 0)) {
        newRow[key] = 1;
      }
    });
    return newRow;
  });

  // Split data for two plots
  const topPlotData = cleanedChartData.map(row => {
    const newRow = { ...row };
    Object.keys(newRow).forEach(key => {
      if (key !== xAxis && key === 'Unspecified') delete newRow[key];
    });
    return newRow;
  });
  const bottomPlotData = cleanedChartData.map(row => {
    const onlyUnspecified = { [xAxis]: row[xAxis], Unspecified: row['Unspecified'] };
    return onlyUnspecified;
  });

  // Bar keys for each plot
  const topPlotGroups = groupValues.filter(g => g !== 'Unspecified');
  const bottomPlotGroups = groupValues.includes('Unspecified') ? ['Unspecified'] : [];

  // Download logic (PNG/SVG for both plots together)
  const handleDownload = () => {
    if (downloadFormat === 'csv') {
      if (!chartData.length) return;
      const csvContent = jsonToCsv(chartData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.download = 'summary_chart.csv';
      link.href = URL.createObjectURL(blob);
      link.click();
      return;
    }
    if (downloadFormat === 'json') {
      if (!chartData.length) return;
      const jsonContent = JSON.stringify(chartData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = 'summary_chart.json';
      link.href = URL.createObjectURL(blob);
      link.click();
      return;
    }
    if (!chartContainerRef.current) return;
    const fn = downloadFormat === 'svg' ? htmlToImage.toSvg : htmlToImage.toPng;
    fn(chartContainerRef.current).then((url: string) => {
      const link = document.createElement('a');
      link.download = `summary_chart.${downloadFormat}`;
      link.href = url;
      link.click();
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Summary Query Chart</Typography>

      {/* Dropdowns */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Y-axis (Count Type)</InputLabel>
            <Select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value as YAxisField)}
            >
              {Object.keys(axisOptionsMap).map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>X-axis</InputLabel>
            <Select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
            >
              {xOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Group by</InputLabel>
            <Select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              {groupOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Download Format</InputLabel>
            <Select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'svg' | 'csv' | 'json')}
            >
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="svg">SVG</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Download and toggle controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={chartData.length === 0}
        >
          Download Chart
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={showUnspecified}
              onChange={() => setShowUnspecified(v => !v)}
              color="primary"
            />
          }
          label="Show Unspecified Plot"
        />
      </Box>

      {/* Loading/Error */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Both plots in a single container for download */}
      {!loading && !error && (
        <Box ref={chartContainerRef}>
          {/* Top Plot */}
          <Box sx={{ height: showUnspecified ? 300 : 500, transition: 'height 0.3s' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topPlotData}
                margin={{ top: 30, right: 40, bottom: 100, left: 60 }}
              >
                <defs>
                  <pattern id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
                    <circle cx={3} cy={3} r={1.5} fill="#8884d8" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={70} />
                <YAxis
                  scale="log"
                  domain={[1, 'auto']}
                  allowDataOverflow
                  label={{
                    value: yAxis,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 5,
                    style: { textAnchor: 'middle' }
                  }}
                  width={80}
                />
                <Tooltip content={<CustomScrollableTooltip />} wrapperStyle={{ pointerEvents: 'auto' }} />
                {topPlotGroups.map((g) => (
                  <Bar
                    key={g}
                    dataKey={g}
                    name={g}
                    fill={colorMap[g]}
                    stackId="a"
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {/* Bottom Plot: Only Unspecified */}
          {showUnspecified && bottomPlotGroups.length > 0 && (
            <Box sx={{ height: 200, mt: 2 }}>
              <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>Unspecified Only</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bottomPlotData}
                  margin={{ top: 10, right: 40, bottom: 40, left: 60 }}
                >
                  <defs>
                    <pattern id={patternId} patternUnits="userSpaceOnUse" width={6} height={6}>
                      <circle cx={3} cy={3} r={1.5} fill="#8884d8" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={50} />
                  <YAxis
                    scale="log"
                    domain={[1, 'auto']}
                    allowDataOverflow
                    label={{
                      value: yAxis,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
                      style: { textAnchor: 'middle' }
                    }}
                    width={80}
                  />
                  <Tooltip content={<CustomScrollableTooltip />} wrapperStyle={{ pointerEvents: 'auto' }} />
                  <Bar
                    dataKey="Unspecified"
                    name="Unspecified"
                    fill={`url(#${patternId})`}
                    stackId="a"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SummaryQueryComponent;
