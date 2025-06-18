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

type GroupByField = 'Disease' | 'Anatomy';
type YAxisField = 'Subjects count' | 'Biosamples count' | 'Files count' | 'Projects count';

type DataItem = {
  name: string;
  Disease: string;
  Anatomy: string;
  Species: string;
  'Common Fund Program': string;
  'File format': string;
  'Data type': string;
  'Assay type': string;
  'Compression format': string;
  'Subjects count': number;
  'Biosamples count': number;
  'Files count': number;
  'Projects count': number;
};

// Option lists
const speciesOptions = ['Mus musculus', 'Homo sapiens', 'Rattus norvegicus'];
const programOptions = ['MW', 'Glygen', 'LINCS', '4DN'];
const fileFormatOptions = ['CSV', 'TSV', 'Zip'];
const dataTypeOptions = ['Gene expression data', 'Mass spectrometry', 'Matrix', 'Report'];
const assayTypeOptions = ['GCMS', 'LCMS', 'MS'];
const compressionFormatOptions = ['gzip', 'zip', 'bz2'];

const xAxisOptions = [
  'Species',
  'Common Fund Program',
  'File format',
  'Data type',
  'Assay type',
  'Compression format',
];

const yAxisOptions: YAxisField[] = [
  'Subjects count',
  'Biosamples count',
  'Files count',
  'Projects count',
];

const groupByOptions: GroupByField[] = ['Disease', 'Anatomy'];

// Dummy data
const dummyData: DataItem[] = [
  {
    name: 'MW',
    Disease: 'Cancer',
    Anatomy: 'Lung',
    Species: 'Mus musculus',
    'Common Fund Program': 'MW',
    'File format': 'CSV',
    'Data type': 'Gene expression data',
    'Assay type': 'GCMS',
    'Compression format': 'gzip',
    'Subjects count': 100,
    'Biosamples count': 80,
    'Files count': 300,
    'Projects count': 5,
  },
  {
    name: 'Glygen1',
    Disease: 'Diabetes',
    Anatomy: 'Liver',
    Species: 'Homo sapiens',
    'Common Fund Program': 'Glygen',
    'File format': 'TSV',
    'Data type': 'Mass spectrometry',
    'Assay type': 'LCMS',
    'Compression format': 'zip',
    'Subjects count': 200,
    'Biosamples count': 100,
    'Files count': 400,
    'Projects count': 8,
  },
  {
    name: 'LINCS1',
    Disease: 'Cancer',
    Anatomy: 'Heart',
    Species: 'Rattus norvegicus',
    'Common Fund Program': 'LINCS',
    'File format': 'Zip',
    'Data type': 'Matrix',
    'Assay type': 'MS',
    'Compression format': 'bz2',
    'Subjects count': 150,
    'Biosamples count': 90,
    'Files count': 350,
    'Projects count': 6,
  },
  {
    name: '4DN1',
    Disease: 'Diabetes',
    Anatomy: 'Lung',
    Species: 'Homo sapiens',
    'Common Fund Program': '4DN',
    'File format': 'CSV',
    'Data type': 'Report',
    'Assay type': 'GCMS',
    'Compression format': 'gzip',
    'Subjects count': 120,
    'Biosamples count': 70,
    'Files count': 320,
    'Projects count': 7,
  },
];

// Color generator
const generateColors = (keys: string[]): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  const count = keys.length;
  keys.forEach((key, i) => {
    const hue = (i * 360) / count;
    colorMap[key] = `hsl(${hue}, 60%, 55%)`;
  });
  return colorMap;
};

// Grouping logic
const groupAndAggregate = (
  data: DataItem[],
  xAxis: string,
  yAxis: YAxisField,
  groupBy: GroupByField
) => {
  const resultMap: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    const xValue = item[xAxis as keyof DataItem] as string;
    const groupValue = item[groupBy];

    if (!resultMap[xValue]) resultMap[xValue] = {};
    if (!resultMap[xValue][groupValue]) resultMap[xValue][groupValue] = 0;

    resultMap[xValue][groupValue] += item[yAxis];
  });

  return Object.entries(resultMap).map(([xValue, groupCounts]) => ({
    [xAxis]: xValue,
    ...groupCounts,
  }));
};

// Component
export const SummaryQueryComponent: React.FC<PageProps> = ({ searchParams, tab }) => {
  const [xAxis, setXAxis] = useState(xAxisOptions[0]);
  const [yAxis, setYAxis] = useState<YAxisField>('Subjects count');
  const [groupBy, setGroupBy] = useState<GroupByField>('Disease');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg'>('png');

  const chartRef = useRef<HTMLDivElement>(null);

  const groupValues = Array.from(new Set(dummyData.map((d) => d[groupBy])));
  const colorMap = generateColors(groupValues);
  const chartData = groupAndAggregate(dummyData, xAxis, yAxis, groupBy);

  const handleDownload = () => {
    if (!chartRef.current) return;

    const node = chartRef.current;

    const downloadFn = downloadFormat === 'svg' ? htmlToImage.toSvg : htmlToImage.toPng;

    downloadFn(node)
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `summary_chart.${downloadFormat}`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export image', err);
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Summary Query Chart
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={10}>
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 60, left: 0, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={xAxis}
                  label={{ value: xAxis, position: 'bottom', offset: 20 }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis label={{ value: yAxis, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                {groupValues.map((group) => (
                  <Bar
                    key={group}
                    dataKey={group}
                    name={group}
                    fill={colorMap[group]}
                    stackId="a"
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Grid>

        <Grid item xs={2}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Group by</InputLabel>
            <Select
              value={groupBy}
              label="Group by"
              onChange={(e) => setGroupBy(e.target.value as GroupByField)}
            >
              {groupByOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {groupValues.map((group) => (
            <Box key={group} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: colorMap[group], mr: 1 }} />
              <Typography variant="body2">{group}</Typography>
            </Box>
          ))}
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>x-axis</InputLabel>
            <Select
              value={xAxis}
              label="x-axis"
              onChange={(e) => setXAxis(e.target.value)}
            >
              {xAxisOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>y-axis</InputLabel>
            <Select
              value={yAxis}
              label="y-axis"
              onChange={(e) => setYAxis(e.target.value as YAxisField)}
            >
              {yAxisOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Download Format</InputLabel>
            <Select
              value={downloadFormat}
              label="Download Format"
              onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'svg')}
            >
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="svg">SVG</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleDownload}>
            Download Chart
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
