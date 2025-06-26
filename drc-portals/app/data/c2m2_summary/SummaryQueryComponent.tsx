'use client';

import React, { useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Box, Grid, FormControl, InputLabel, MenuItem, Select, Typography, Button,
} from '@mui/material';
import * as htmlToImage from 'html-to-image';

// Types
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

type DataItem = {
  [key: string]: string | number;
};

// Axis definitions per Y-axis
const axisOptionsMap: Record<YAxisField, string[]> = {
  'Subjects count': ['dcc', 'species', 'ethnicity', 'sex', 'race', 'disease', 'granularity', 'role'],
  'Biosamples count': ['dcc', 'anatomy', 'biofluid', 'sample_prep_method', 'disease'],
  'Files count': ['dcc (id_namespace)', 'file_format', 'assay_type', 'analysis_type', 'data_type', 'compression_format'],
  'Collections count': ['dcc', 'anatomy', 'biofluid', 'disease', 'phenotype'],
  'Projects count': ['dcc'],
};

// Dummy data (make sure each has every possible field)
const dummyData: DataItem[] = [
  {
    dcc: 'MW',
    species: 'Mus musculus',
    ethnicity: 'Asian',
    sex: 'Male',
    race: 'White',
    disease: 'Cancer',
    granularity: 'Tissue',
    role: 'Patient',
    anatomy: 'Lung',
    biofluid: 'Plasma',
    sample_prep_method: 'Prep A',
    'dcc (id_namespace)': 'MW001',
    file_format: 'CSV',
    assay_type: 'GCMS',
    analysis_type: 'Primary',
    data_type: 'Gene expression',
    compression_format: 'gzip',
    phenotype: 'Diabetic',
    'Subjects count': 100,
    'Biosamples count': 80,
    'Files count': 300,
    'Projects count': 5,
    'Collections count': 12,
  },
  {
    dcc: 'Glygen',
    species: 'Homo sapiens',
    ethnicity: 'Hispanic',
    sex: 'Female',
    race: 'Black',
    disease: 'Diabetes',
    granularity: 'Cell',
    role: 'Control',
    anatomy: 'Liver',
    biofluid: 'Serum',
    sample_prep_method: 'Prep B',
    'dcc (id_namespace)': 'GLY001',
    file_format: 'TSV',
    assay_type: 'LCMS',
    analysis_type: 'Secondary',
    data_type: 'Mass spectrometry',
    compression_format: 'zip',
    phenotype: 'Obese',
    'Subjects count': 200,
    'Biosamples count': 100,
    'Files count': 400,
    'Projects count': 8,
    'Collections count': 22,
  },
];

// Color utility
const generateColors = (keys: string[]): Record<string, string> => {
  const count = keys.length;
  return keys.reduce((map, key, i) => {
    map[key] = `hsl(${(i * 360) / count}, 60%, 55%)`;
    return map;
  }, {} as Record<string, string>);
};

// Aggregation logic
const groupAndAggregate = (
  data: DataItem[],
  xAxis: string,
  yAxis: YAxisField,
  groupBy?: string
) => {
  const map: Record<string, Record<string, number>> = {};
  data.forEach((item) => {
    const xVal = item[xAxis] ?? 'Unknown';
    const groupVal = groupBy ? item[groupBy] ?? 'Other' : 'value';
    map[xVal] ??= {};
    map[xVal][groupVal] = (map[xVal][groupVal] || 0) + (item[yAxis] as number);
  });
  return Object.entries(map).map(([x, groups]) => ({ [xAxis]: x, ...groups }));
};

// Component
export const SummaryQueryComponent: React.FC<PageProps> = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Subjects count');
  const [xAxis, setXAxis] = useState(axisOptionsMap[yAxis][0]);
  const [groupBy, setGroupBy] = useState(axisOptionsMap[yAxis][1] || '');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');

  const chartRef = useRef<HTMLDivElement>(null);
  const xOptions = axisOptionsMap[yAxis];
  const showGroup = yAxis !== 'Projects count';
  const groupOptions = xOptions.filter((x) => x !== xAxis);
  const groupValues = showGroup ? Array.from(new Set(dummyData.map((d) => d[groupBy] ?? 'Other'))) : ['value'];
  const colorMap = generateColors(groupValues);
  const chartData = groupAndAggregate(dummyData, xAxis, yAxis, showGroup ? groupBy : undefined);

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

      <Grid container spacing={2}>
        <Grid item xs={10}>
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 60, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} />
                <YAxis label={{ value: yAxis, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend verticalAlign="top" />
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
          <Button variant="contained" onClick={handleDownload}>
            Download Chart
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
