'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Box, Grid, FormControl, InputLabel, MenuItem, Select, Typography, Button,
  CircularProgress, Alert
} from '@mui/material';
import * as htmlToImage from 'html-to-image';

type YAxisField =
  | 'Subjects count'
  | 'Biosamples count'
  | 'Files count'
  | 'Projects count'
  | 'Collections count';

const axisOptionsMap: Record<YAxisField, string[]> = {
  'Subjects count': ['dcc', 'taxonomy_id', 'ethnicity', 'sex', 'race', 'disease', 'granularity', 'role'],
  'Biosamples count': ['dcc', 'anatomy', 'biofluid', 'sample_prep_method', 'disease'],
  'Files count': ['dcc (id_namespace)', 'file_format', 'assay_type', 'analysis_type', 'data_type', 'compression_format'],
  'Collections count': ['dcc', 'anatomy', 'biofluid', 'disease', 'phenotype'],
  'Projects count': ['dcc'],
};

const SummaryQueryComponent = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Biosamples count');
  const [xAxis, setXAxis] = useState<string>(axisOptionsMap['Biosamples count'][0]);
  const [groupBy, setGroupBy] = useState<string>(axisOptionsMap['Biosamples count'][1] || '');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Update xAxis and groupBy when yAxis changes
  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    setXAxis(axes[0]);
    setGroupBy(axes.length > 1 ? axes[1] : '');
  }, [yAxis]);

  // Update groupBy when xAxis changes
  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    const newGroupOptions = axes.filter((opt) => opt !== xAxis);
    setGroupBy(newGroupOptions[0] || '');
  }, [xAxis, yAxis]);

  const xOptions = axisOptionsMap[yAxis];
  const groupOptions = xOptions.filter((opt) => opt !== xAxis);

  // Fetch data when yAxis, xAxis, or groupBy changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          x_axis: xAxis,
          y_axis: yAxis.toLowerCase().replace(/ /g, ''), // e.g. 'biosamplescount'
          group_by: groupBy
        });
        const url = `/data/c2m2_summary/getBiosampleCounts?${params.toString()}`;
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

  // Extract group keys for chart bars and colors
  const groupValues = groupBy ? Array.from(
    chartData.reduce<Set<string>>((set, item) => {
      Object.keys(item).forEach((key) => {
        if (key !== xAxis) set.add(key);
      });
      return set;
    }, new Set())
  ) : ['value'];

  // Generate distinct colors for groups
  const generateColors = (keys: string[]) => {
    const count = Math.max(keys.length, 1);
    return keys.reduce((map, key, i) => {
      map[key] = `hsl(${(i * 360) / count}, 60%, 55%)`;
      return map;
    }, {} as Record<string, string>);
  };

  const colorMap = generateColors(groupValues);

  // Download chart as PNG or SVG
  const handleDownload = () => {
    if (!chartRef.current) return;
    const fn = downloadFormat === 'svg' ? htmlToImage.toSvg : htmlToImage.toPng;
    fn(chartRef.current).then((url: string) => {
      const link = document.createElement('a');
      link.download = `summary_chart.${downloadFormat}`;
      link.href = url;
      link.click();
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Summary Query Chart</Typography>

      {/* Dropdowns for yAxis, xAxis, groupBy */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
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

        <Grid item xs={4}>
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

        <Grid item xs={4}>
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
      </Grid>

      {/* Loading/Error */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Chart and Legend Side by Side */}
      {!loading && !error && (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
          {/* Chart area with horizontal scroll */}
          <Box
            ref={chartRef}
            sx={{
              flex: 1,
              minWidth: 0,
              overflowX: 'auto',
              overflowY: 'hidden',
              pr: 2,
              // Set a minWidth if you want the chart to always be at least a certain width
            }}
          >
            <Box sx={{ width: Math.max(600, chartData.length * 80) }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 40, bottom: 100, left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={70} />
                  <YAxis
                    label={{
                        value: yAxis,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 5,
                        style: { textAnchor: 'middle' }
                    }}
                    width={80}
                    />

                  <Tooltip />
                  {groupValues.map((g) => (
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
          </Box>

          {/* Custom Scrollable Legend on the right */}
          <Box
            sx={{
              minWidth: 180,
              maxWidth: 240,
              maxHeight: 400,
              overflowY: 'auto',
              overflowX: 'hidden',
              ml: 2,
              border: '1px solid #eee',
              p: 1,
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Legend</Typography>
            {groupValues.map((val) => (
              <Box key={val} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: colorMap[val], mr: 1, flexShrink: 0 }} />
                <Typography variant="body2" noWrap title={val}>{val}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Download controls */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Download Format</InputLabel>
          <Select
            value={downloadFormat}
            onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'svg')}
          >
            <MenuItem value="png">PNG</MenuItem>
            <MenuItem value="svg">SVG</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={chartData.length === 0}
        >
          Download Chart
        </Button>
      </Box>
    </Box>
  );
};

export default SummaryQueryComponent;
