'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, CircularProgress, Alert, Switch, FormControlLabel,
  IconButton, Badge
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from './CartContext';
import { CartDrawer } from './CartDrawer';
import { C2M2BarChart } from './C2M2BarChart';

type YAxisField =
  | 'Subjects count'
  | 'Biosamples count'
  | 'Files count'
  | 'Projects count'
  | 'Collections count';

interface ChartRow {
  [key: string]: string | number | undefined;
}

interface DescriptionResponse {
  description: string;
}

const axisOptionsMap: Record<YAxisField, string[]> = {
  'Subjects count': ['dcc', 'ethnicity', 'sex', 'race', 'disease', 'granularity', 'role'],
  'Biosamples count': ['dcc', 'anatomy', 'biofluid', 'sample_prep_method', 'disease'],
  'Files count': ['dcc', 'file_format', 'assay_type', 'analysis_type', 'data_type', 'compression_format'],
  'Collections count': ['dcc', 'anatomy', 'biofluid', 'disease', 'phenotype', 'compound', 'protein'],
  'Projects count': ['dcc'],
};

const minBarWidth = 60;
const minChartWidth = 600;

const SummaryQueryComponent: React.FC = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Biosamples count');
  const [xAxis, setXAxis] = useState(axisOptionsMap['Biosamples count'][0]);
  const [groupBy, setGroupBy] = useState(axisOptionsMap['Biosamples count'][1] || '');
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnspecified, setShowUnspecified] = useState(true);

  const [plotDescription, setPlotDescription] = useState('');
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    setXAxis(axes[0]);
    setGroupBy(axes[1] || '');
  }, [yAxis]);

  useEffect(() => {
    const axes = axisOptionsMap[yAxis];
    const groupOptions = axes.filter(opt => opt !== xAxis);
    setGroupBy(groupOptions[0] || '');
  }, [xAxis, yAxis]);

  const xOptions = axisOptionsMap[yAxis];
  const groupOptions = xOptions.filter(opt => opt !== xAxis);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        x_axis: xAxis,
        y_axis: yAxis.toLowerCase().replace(/\s/g, ''),
        group_by: groupBy
      });
      const endpointMap: Partial<Record<YAxisField, string>> = {
        'Subjects count': '/data/c2m2_summary/getSubjectCounts',
        'Biosamples count': '/data/c2m2_summary/getBiosampleCounts',
        'Files count': '/data/c2m2_summary/getFileCounts',
        'Collections count': '/data/c2m2_summary/getCollectionCounts',
        'Projects count': '/data/c2m2_summary/getProjectCounts'
      };
      const endpoint = endpointMap[yAxis];
      try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const json = await response.json();
        setChartData(json?.data || []);
      } catch (err) {
        setError('Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [yAxis, xAxis, groupBy]);

  // Data cleaning (like your original)
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

  const groupValues = groupBy
    ? Array.from(
        cleanedChartData.reduce<Set<string>>((set, item) => {
          Object.keys(item).forEach(key => {
            if (key !== xAxis) set.add(key);
          });
          return set;
        }, new Set())
      )
    : ['value'];

  const colorMap = groupValues.reduce((map, key, i) => {
    map[key] = key === 'Unspecified'
      ? '#8e99ab'
      : `hsl(${(i * 360) / groupValues.length}, 60%, 55%)`;
    return map;
  }, {} as Record<string, string>);

  // Button & Description logic
  const plotDescriptionPrompt = `Describe the main findings of the chart${
    showUnspecified
      ? ', and also describe any visible trends in the "Unspecified Only" sub-chart shown below (which displays the "Unspecified" category for each X-axis value).'
      : '.'
  }`;

  const handleGenerateDescription = async () => {
    setLoadingDescription(true);
    setDescriptionError(null);
    try {
      const res = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yAxis, xAxis, groupBy, prompt: plotDescriptionPrompt })
      });
      const data: DescriptionResponse = await res.json();
      setPlotDescription(data.description);
    } catch (err: any) {
      setDescriptionError(err.message || 'Failed to fetch description');
    } finally {
      setLoadingDescription(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: uuidv4(),
      yAxis,
      xAxis,
      groupBy,
      chartData,
      plotDescription,
      showUnspecified
    });
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Typography variant="h5" gutterBottom>Summary Query Chart</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Y-axis</InputLabel>
            <Select value={yAxis} onChange={e => setYAxis(e.target.value as YAxisField)}>
              {Object.keys(axisOptionsMap).map(key => (
                <MenuItem key={key} value={key}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>X-axis</InputLabel>
            <Select value={xAxis} onChange={e => setXAxis(e.target.value)}>
              {xOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Group By</InputLabel>
            <Select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              {groupOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Control row */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={showUnspecified} onChange={() => setShowUnspecified(!showUnspecified)} />}
          label="Show Unspecified"
        />
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleGenerateDescription}
            disabled={loadingDescription}
          >
            Generate Description
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleAddToCart}
            disabled={chartData.length === 0 || !plotDescription}
          >
            Add to Cart
          </Button>
          <IconButton color="primary" aria-label="cart" onClick={() => setDrawerOpen(true)} sx={{ ml: 1 }}>
            <Badge badgeContent={cart.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Main charts */}
      {loading && <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Box sx={{ mb: 2 }}>
          <C2M2BarChart
            data={cleanedChartData}
            xAxis={xAxis}
            groupValues={groupValues}
            colorMap={colorMap}
            showUnspecified={showUnspecified}
            minBarWidth={minBarWidth}
            minChartWidth={minChartWidth}
          />
        </Box>
      )}

      {(plotDescription || loadingDescription || descriptionError) && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            maxHeight: 150,
            overflowY: 'auto',
            backgroundColor: '#fafafa',
            whiteSpace: 'pre-wrap',
            fontSize: 14
          }}
        >
          {loadingDescription && <Typography>Loading plot description...</Typography>}
          {descriptionError && <Typography color="error">{descriptionError}</Typography>}
          {!loadingDescription && !descriptionError && plotDescription}
        </Box>
      )}

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

export default SummaryQueryComponent;
