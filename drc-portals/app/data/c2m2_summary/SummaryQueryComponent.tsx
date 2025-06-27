'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Box, Grid, FormControl, InputLabel, MenuItem, Select, Typography, Button,
  CircularProgress, Alert
} from '@mui/material';
import * as htmlToImage from 'html-to-image';

export type PageProps = {
  searchParams: Record<string, string>;
  tab?: boolean;
};

type YAxisField =
  | 'Subjects count'
  | 'Biosamples count'
  | 'Files count'
  | 'Projects count'
  | 'Collections count';

const axisOptionsMap: Record<YAxisField, string[]> = {
  'Subjects count': ['dcc', 'species', 'ethnicity', 'sex', 'race', 'disease', 'granularity', 'role'],
  'Biosamples count': ['dcc', 'anatomy', 'biofluid', 'sample_prep_method', 'disease'],
  'Files count': ['dcc (id_namespace)', 'file_format', 'assay_type', 'analysis_type', 'data_type', 'compression_format'],
  'Collections count': ['dcc', 'anatomy', 'biofluid', 'disease', 'phenotype'],
  'Projects count': ['dcc'],
};

const generateColors = (keys: string[]): Record<string, string> => {
  const count = Math.max(keys.length, 1);
  return keys.reduce((map, key, i) => {
    map[key] = `hsl(${(i * 360) / count}, 60%, 55%)`;
    return map;
  }, {} as Record<string, string>);
};

export const SummaryQueryComponent: React.FC<PageProps> = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Subjects count');
  const [xAxis, setXAxis] = useState(axisOptionsMap['Subjects count'][0]);
  const [groupBy, setGroupBy] = useState(axisOptionsMap['Subjects count'][1] || '');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const xOptions = axisOptionsMap[yAxis];
  const showGroup = yAxis !== 'Projects count';
  const groupOptions = xOptions.filter((x) => x !== xAxis);

  // Extract group values from data
  const groupValues = showGroup
    ? Array.from(
      chartData.reduce((set, item) => {
        Object.keys(item).forEach((key) => {
          if (key !== xAxis) set.add(key);
        });
        return set;
      }, new Set<string>())
    ) as string[]
    : ['value'];


  const colorMap = generateColors(groupValues);

  const endpointMap: Record<YAxisField, string> = {
    'Subjects count': '/data/c2m2_summary/getSubjectCounts',
    'Biosamples count': '/data/c2m2_summary/getBiosampleCounts',
    'Files count': '/data/c2m2_summary/getFileCounts',
    'Projects count': '/data/c2m2_summary/getProjectCounts',
    'Collections count': '/data/c2m2_summary/getCollectionCounts',
  };

  const yMap: Record<YAxisField, string> = {
    'Subjects count': 'subject',
    'Biosamples count': 'biosample',
    'Files count': 'file',
    'Projects count': 'project',
    'Collections count': 'collection',
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpointMap[yAxis]}?x_axis=${encodeURIComponent(xAxis)}&group_by=${encodeURIComponent(groupBy)}&y_axis=${yMap[yAxis]}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        setChartData(json.data || []);
      } catch (error) {
        console.error('Failed to fetch summary data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [xAxis, groupBy, yAxis]);

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

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <div ref={chartRef}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 120, bottom: 100, left: 60 }} // increase right margin for legend
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={70} />
                    <YAxis label={{ value: yAxis, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
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
              </div>
            </Grid>

            {showGroup && (
              <Grid item xs={2}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Group by</InputLabel>
                  <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                    {groupOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {groupValues.map((val) => (
                  <Box key={val} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: colorMap[val], mr: 1 }} />
                    <Typography variant="body2">{val}</Typography>
                  </Box>
                ))}
              </Grid>
            )}
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>x-axis</InputLabel>
                <Select
                  value={xAxis}
                  onChange={(e) => {
                    const newX = e.target.value;
                    setXAxis(newX);
                    const nextGroup = axisOptionsMap[yAxis].find((f) => f !== newX);
                    setGroupBy(nextGroup || '');
                  }}
                >
                  {xOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>y-axis</InputLabel>
                <Select
                  value={yAxis}
                  onChange={(e) => {
                    const val = e.target.value as YAxisField;
                    setYAxis(val);
                    const xOpts = axisOptionsMap[val];
                    setXAxis(xOpts[0]);
                    setGroupBy(xOpts[1] || '');
                  }}
                >
                  {Object.keys(axisOptionsMap).map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Download Format</InputLabel>
                <Select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'svg')}
                >
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="svg">SVG</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="contained" onClick={handleDownload} disabled={chartData.length === 0}>
                Download Chart
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
