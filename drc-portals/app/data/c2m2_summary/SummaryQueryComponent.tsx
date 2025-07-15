'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, Select, MenuItem, FormControl, InputLabel,
  Button, CircularProgress, Alert, Switch, FormControlLabel
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import * as htmlToImage from 'html-to-image';

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

const patternId = 'dottedUnspecified';
const minBarWidth = 60;
const minChartWidth = 600;

const SummaryQueryComponent: React.FC = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Biosamples count');
  const [xAxis, setXAxis] = useState<string>(axisOptionsMap['Biosamples count'][0]);
  const [groupBy, setGroupBy] = useState<string>(axisOptionsMap['Biosamples count'][1] || '');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'svg' | 'csv' | 'json'>('png');
  const [chartData, setChartData] = useState<Record<string, number | string | undefined>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnspecified, setShowUnspecified] = useState<boolean>(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Description state
  const [plotDescription, setPlotDescription] = useState('');
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Update xAxis and groupBy when yAxis changes
  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    setXAxis(axes[0]);
    setGroupBy(axes.length > 1 ? axes[1] : '');
  }, [yAxis]);

  // Update groupBy when xAxis changes
  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    const newGroupOptions = axes.filter(opt => opt !== xAxis);
    setGroupBy(newGroupOptions[0] || '');
  }, [xAxis, yAxis]);

  const xOptions = axisOptionsMap[yAxis];
  const groupOptions = xOptions.filter(opt => opt !== xAxis);

  // Fetch chart data
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
        switch (yAxis) {
          case 'Subjects count':
            endpoint = '/data/c2m2_summary/getSubjectCounts';
            break;
          case 'Biosamples count':
            endpoint = '/data/c2m2_summary/getBiosampleCounts';
            break;
          case 'Files count':
            endpoint = '/data/c2m2_summary/getFileCounts';
            break;
          case 'Collections count':
            endpoint = '/data/c2m2_summary/getCollectionCounts';
            break;
          default:
            setError('Unsupported Y-axis type');
            setChartData([]);
            setLoading(false);
            return;
        }

        const res = await fetch(`${endpoint}?${params.toString()}`);
        const text = await res.text();
        const json = JSON.parse(text);

        if (!json.data) throw new Error('No data in response');
        setChartData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [yAxis, xAxis, groupBy]);

  // Generate plot description
  const handleGenerateDescription = async () => {
    setLoadingDescription(true);
    setDescriptionError(null);
    setPlotDescription('');

    try {
      const response = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yAxis, xAxis, groupBy }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch description');
      }

      const data = await response.json();
      setPlotDescription(data.description || 'No description returned.');
    } catch (err: unknown) {
      setDescriptionError(err instanceof Error ? err.message : 'Failed to fetch description');
    } finally {
      setLoadingDescription(false);
    }
  };

  const groupValues = groupBy
    ? Array.from(
        chartData.reduce<Set<string>>((set, item) => {
          Object.keys(item).forEach(key => {
            if (key !== xAxis) set.add(key);
          });
          return set;
        }, new Set())
      )
    : ['value'];

  const generateColors = (keys: string[]) => {
    const count = Math.max(keys.length, 1);
    return keys.reduce((map, key, i) => {
      map[key] = `hsl(${(i * 360) / count}, 60%, 55%)`;
      return map;
    }, {} as Record<string, string>);
  };

  const colorMap = generateColors(groupValues);

  const cleanedChartData = chartData.map(row => {
    const newRow = { ...row };
    Object.keys(newRow).forEach(key => {
      const val = newRow[key];
      if (key !== xAxis && typeof val === 'number' && val <= 0) {
        newRow[key] = 1;
      }
    });
    return newRow;
  });

  const topPlotData = cleanedChartData.map(row => {
    const newRow = { ...row };
    if ('Unspecified' in newRow) delete newRow['Unspecified'];
    return newRow;
  });

  const bottomPlotData = cleanedChartData.map(row => ({
    [xAxis]: row[xAxis],
    Unspecified: row['Unspecified']
  }));

  const topPlotGroups = groupValues.filter(g => g !== 'Unspecified');
  const bottomPlotGroups = groupValues.includes('Unspecified') ? ['Unspecified'] : [];

  const topChartWidth = Math.max(topPlotData.length * minBarWidth, minChartWidth);
  const bottomChartWidth = Math.max(bottomPlotData.length * minBarWidth, minChartWidth);
  const hasUnspecified = showUnspecified && bottomPlotGroups.length > 0;
  const topPlotHeight = hasUnspecified ? 300 : 500;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Summary Query Chart</Typography>

      {/* Dropdowns */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Y-axis</InputLabel>
            <Select value={yAxis} onChange={e => setYAxis(e.target.value as YAxisField)}>
              {Object.keys(axisOptionsMap).map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>X-axis</InputLabel>
            <Select value={xAxis} onChange={e => setXAxis(e.target.value)}>
              {xOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Group by</InputLabel>
            <Select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              {groupOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Chart Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
      {error && <Alert severity="error">{error}</Alert>}

      {/* Chart */}
      {!loading && !error && (
        <Box ref={chartContainerRef}>
          {/* Top Plot */}
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ width: topChartWidth }}>
              <BarChart
                width={topChartWidth}
                height={topPlotHeight}
                data={topPlotData}
                margin={{ top: 30, right: 40, bottom: 100, left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={70} />
                <YAxis scale="log" domain={[1, 'auto']} allowDataOverflow />
                <Tooltip />
                {topPlotGroups.map(g => (
                  <Bar key={g} dataKey={g} fill={colorMap[g]} stackId="a" />
                ))}
              </BarChart>
            </div>
          </Box>

          {/* Bottom Plot */}
          {hasUnspecified && (
            <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
              <Typography align="center" variant="subtitle2" sx={{ mb: 1 }}>Unspecified Only</Typography>
              <div style={{ width: bottomChartWidth }}>
                <BarChart
                  width={bottomChartWidth}
                  height={200}
                  data={bottomPlotData}
                  margin={{ top: 10, right: 40, bottom: 40, left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={50} />
                  <YAxis scale="log" domain={[1, 'auto']} allowDataOverflow />
                  <Tooltip />
                  <Bar dataKey="Unspecified" fill="#8884d8" stackId="a" />
                </BarChart>
              </div>
            </Box>
          )}

          {/* Generate Description Button */}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleGenerateDescription} disabled={loadingDescription}>
              Generate Description
            </Button>
          </Box>

          {/* Description Output */}
          {(loadingDescription || descriptionError || plotDescription) && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: '1px solid #ccc',
                borderRadius: 1,
                maxHeight: 150,
                overflowY: 'auto',
                backgroundColor: '#fafafa',
                fontSize: 14,
                whiteSpace: 'pre-wrap',
              }}
            >
              {loadingDescription && <Typography>Loading description...</Typography>}
              {descriptionError && <Typography color="error">{descriptionError}</Typography>}
              {!loadingDescription && !descriptionError && plotDescription}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SummaryQueryComponent;
