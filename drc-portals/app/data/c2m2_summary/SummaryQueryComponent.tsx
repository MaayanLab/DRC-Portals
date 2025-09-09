'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from "next/dynamic"; 
import {
  Box, Grid, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, CircularProgress, Alert, Switch, FormControlLabel,
  IconButton, Badge
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from './CartContext';
import { CartDrawer } from './CartDrawer';
import C2M2BarChart from './C2M2BarChart';
import PlotDescriptionEditor from './PlotDescriptionEditor';
// dynamically import Plotly heatmap (client only)
const C2M2Heatmap = dynamic(() => import('./C2M2Heatmap'), { ssr: false });

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
  description?: string;
  error?: string;
}

const axisOptionsMap: Record<YAxisField, string[]> = {
  'Subjects count': ['dcc', 'ethnicity', 'sex', 'race', 'disease', 'granularity', 'role', 'taxonomy'],
  'Biosamples count': ['dcc', 'anatomy', 'biofluid', 'sample_prep_method', 'disease'],
  'Files count': ['dcc', 'file_format', 'assay_type', 'analysis_type', 'data_type', 'compression_format'],
  'Collections count': ['dcc', 'anatomy', 'biofluid', 'disease', 'phenotype', 'compound', 'protein'],
  'Projects count': ['dcc'],
};

const minBarWidth = 60;
const minChartWidth = 600;

const SummaryQueryComponent: React.FC = () => {
  const [yAxis, setYAxis] = useState<YAxisField>('Biosamples count');
  const [xAxis, setXAxis] = useState<string>(axisOptionsMap['Biosamples count'][0]);
  const [groupBy, setGroupBy] = useState<string>(axisOptionsMap['Biosamples count'][1] || '');
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnspecified, setShowUnspecified] = useState<boolean>(false);

  const [plotDescription, setPlotDescription] = useState<string>('');
  const [loadingDescription, setLoadingDescription] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  const { addToCart, cart } = useCart();

  const descriptionTimeoutId = useRef<NodeJS.Timeout | null>(null);

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

  const xOptions: string[] = axisOptionsMap[yAxis];
  const groupOptions: string[] = xOptions.filter(opt => opt !== xAxis);

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

      if (!endpoint) {
        setError('Invalid endpoint for selected Y-axis.');
        return;
      }

      try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        const json = await response.json();
        setChartData(json?.data || []);
      } catch {
        setError('Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [yAxis, xAxis, groupBy]);

  useEffect(() => {
    setPlotDescription('');
    setDescriptionError(null);
    setIsEditing(false);
  }, [yAxis, xAxis, groupBy]);

  //--- 0-to-1 value fix ---
  const cleanedChartData = chartData.map(row => {
    const newRow: ChartRow = { ...row };
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

  // --- Heatmap data ---
  const heatmapXLabels = cleanedChartData.map(row => String(row[xAxis] ?? ''));
  const heatmapYLabels = groupValues;
  const heatmapZ = heatmapYLabels.map(groupVal =>
    heatmapXLabels.map((xVal, colIdx) => {
      const row = cleanedChartData[colIdx];
      const value = row ? row[groupVal] : undefined;
      return typeof value === 'number' ? value : 0;
    })
  );

  // Prompt for LLM
  const getChartPrompt = () => {
    let out = `Generate a concise description of a ${showHeatmap ? 'heatmap' : 'bar chart'} with the following parameters:
  - Y-axis: ${yAxis}
  - X-axis: ${xAxis}`;
  
    // Removed the groupBy line
    out += `
  Describe what kind of data this chart shows and what insights it might reveal.`;
  
    if (showUnspecified) {
      out += `
  If there is an "Unspecified Only" sub-chart below, also describe any trends or patterns observed in that sub-chart.`;
    }
  
    return out;
  };
  

  // LLM handle
  const handleGenerateDescription = async () => {
    setLoadingDescription(true);
    setIsEditing(false);
    setDescriptionError(null);
    setPlotDescription('');

    if (descriptionTimeoutId.current) clearTimeout(descriptionTimeoutId.current);

    descriptionTimeoutId.current = setTimeout(() => {
      setLoadingDescription(false);
      setDescriptionError('Description generation took too long. Please fill it in manually.');
      setIsEditing(true);
      setPlotDescription('');
    }, 15000);

    try {
      const prompt = getChartPrompt();

      const res = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data: DescriptionResponse = await res.json();

      if (descriptionTimeoutId.current) clearTimeout(descriptionTimeoutId.current);

      if (data.error) {
        setDescriptionError(data.error);
        setIsEditing(true);
      } else {
        const text = data.description || '';
        setPlotDescription(text);
        setIsEditing(false);
        setDescriptionError(null);
      }
    } catch {
      if (descriptionTimeoutId.current) clearTimeout(descriptionTimeoutId.current);
      setDescriptionError('Failed to generate a description. Please write it manually.');
      setIsEditing(true);
      setPlotDescription('');
    } finally {
      setLoadingDescription(false);
    }
  };

  // --- ADD TO CART with heatmap support ---
  const handleAddToCart = () => {
    if (showHeatmap) {
      addToCart({
        id: uuidv4(),
        chartType: 'heatmap',
        xLabels: heatmapXLabels,
        yLabels: heatmapYLabels,
        z: heatmapZ,
        plotDescription,
      });
    } else {
      addToCart({
        id: uuidv4(),
        chartType: 'bar',
        xAxis,
        yAxis,
        groupBy,
        chartData,
        plotDescription,
        showUnspecified,
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Summary Query Chart</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Y-axis</InputLabel>
            <Select value={yAxis} onChange={e => setYAxis(e.target.value as YAxisField)}>
              {(Object.keys(axisOptionsMap) as YAxisField[]).map(key => (
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

      {/* Heatmap toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={showHeatmap} onChange={() => setShowHeatmap(!showHeatmap)} />}
          label="Show Heatmap"
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={showUnspecified} onChange={() => setShowUnspecified(!showUnspecified)} />}
          label="Show Unspecified"
        />
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleGenerateDescription} disabled={loadingDescription}>
            Generate Description
          </Button>
          <Button
            variant="contained"
            onClick={handleAddToCart}
            disabled={!plotDescription || chartData.length === 0}
          >
            Add to Cart
          </Button>
          <IconButton color="primary" onClick={() => setDrawerOpen(true)}>
            <Badge badgeContent={cart.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {loading && <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        showHeatmap ?
          <C2M2Heatmap xLabels={heatmapXLabels} yLabels={heatmapYLabels} z={heatmapZ} />
          :
          <C2M2BarChart
            data={cleanedChartData}
            xAxis={xAxis}
            yAxis={yAxis}           // add this!
            groupBy={groupBy}       // add this!
            groupValues={groupValues}
            colorMap={colorMap}
            showUnspecified={showUnspecified}
            minBarWidth={minBarWidth}
            minChartWidth={minChartWidth}
          />

      )}

      {loadingDescription && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Generating description... please wait</Typography>
        </Box>
      )}

      {/* Show either the description or the editor */}
      {plotDescription && !isEditing && (
        <Box sx={{ mt: 3, whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle1">Plot Description</Typography>
          <Typography sx={{ mt: 1 }}>{plotDescription}</Typography>
          <Button variant="outlined" onClick={() => setIsEditing(true)}>Edit</Button>
        </Box>
      )}

      {isEditing && (
        <PlotDescriptionEditor
          initialValue={plotDescription}
          onSave={(val) => {
            setPlotDescription(val);
            setIsEditing(false);
            setDescriptionError(null);
          }}
          onCancel={() => {
            setIsEditing(false);
            setDescriptionError(null);
          }}
          error={!!descriptionError}
          helperText={descriptionError || 'Please enter the description manually.'}
        />
      )}

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
};

export default SummaryQueryComponent;
