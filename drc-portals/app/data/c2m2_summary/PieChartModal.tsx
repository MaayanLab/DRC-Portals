'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Modal, IconButton, Button, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { useCart } from './CartContext';

export interface PieChartModalProps {
  open: boolean;
  onClose: () => void;
  data: { name: string; value: number }[];
  title: string;
  colorMap: Record<string, string>;
  xAxis?: string;
  groupBy?: string;
  xAxisValue?: string;
  // parentBarChartId?: string; // Optional, can be passed if you want to reference parent
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  maxWidth: '100vw',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

type LegendItem = {
  display: string;
  color: string;
  id: string;
};

const PieChartModal: React.FC<PieChartModalProps> = ({
  open,
  onClose,
  data,
  title,
  colorMap,
  xAxis,
  groupBy,
  xAxisValue,
  // parentBarChartId
}) => {
  // LLM state
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const { addToCart, cart } = useCart();

  // Legend logic
  const maxPerCol = 8;
  const legendItems: LegendItem[] = data.map(d => ({
    display: `${d.name} [${d.value}]`,
    color: colorMap[d.name] || '#8884d8',
    id: String(d.name),
  }));
  const columns: LegendItem[][] = [];
  for (let i = 0; i < legendItems.length; i += maxPerCol) {
    columns.push(legendItems.slice(i, i + maxPerCol));
  }

  // Figure out xAxis, groupBy, xAxisValue for the add-to-cart (from props or title)
  let xAxisField = xAxis;
  let groupByField = groupBy;
  let xAxisVal = xAxisValue;

  // If not provided, try to extract xAxisField and value from title, e.g. "anatomy: brain"
  if ((!xAxisField || !xAxisVal) && title.includes(':')) {
    const [axis, ...rest] = title.split(':');
    xAxisField = xAxisField ?? axis.trim();
    xAxisVal = xAxisVal ?? rest.join(':').replace(/\(.*Unspecified.*\)$/, '').trim();
  }
  if (!groupByField && data.length) {
    // Use first data key that's not Unspecified, if not supplied
    groupByField = data[0].name !== 'Unspecified' ? data[0].name : undefined;
  }

  // Compose a prompt for the LLM to describe this pie chart
  const piePrompt =
    `Generate a concise description of a pie chart visualizing the category distribution for "${title}".
Each segment represents a category (label and count). Summarize the largest, smallest, and any notable patterns. The breakdown is: ${data
      .map(d => `${d.name} [${d.value}]`)
      .join(', ')}.`;

  const handleGenerateDescription = async () => {
    setError(null);
    setDesc('');
    setLoading(true);
    setAddSuccess(false);
    try {
      const response = await fetch('/data/c2m2_summary/getPlotDescFromLLM', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: piePrompt }),
      });
      const json = await response.json();
      if (json.error) {
        setError(json.error);
        setDesc('');
      } else {
        setDesc(json.description || '');
        setError(null);
      }
    } catch {
      setError('Failed to fetch description.');
      setDesc('');
    } finally {
      setLoading(false);
    }
  };

  // Memoize the unique-ness check for current pie chart in the cart
  const pieKey = useMemo(() =>
    `${xAxisField || ''}::${xAxisVal || ''}::${groupByField || ''}::${JSON.stringify(data.map(d => [d.name, d.value]))}`,
    [xAxisField, xAxisVal, groupByField, data]
  );
  const alreadyInCart = cart.some(
    item =>
      item.chartType === 'pie' &&
      (item as any).xAxis === xAxisField &&
      (item as any).xAxisValue === xAxisVal &&
      (item as any).groupBy === groupByField &&
      JSON.stringify((item as any).pieData) === JSON.stringify(data)
  );

  const handleAddToCart = () => {
    if (!xAxisField || !xAxisVal || !groupByField) {
      setError('Missing key chart fields. Please contact support.');
      return;
    }
    addToCart({
      id: uuidv4(),
      chartType: 'pie',
      xAxis: xAxisField,
      xAxisValue: xAxisVal,
      groupBy: groupByField,
      pieData: data,
      pieDescription: desc,
      // parentBarChartId // optional if you want to relate to the bar chart
    });
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 1200);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        {/* Pie and legend */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            width: '100%',
            minWidth: 480,
            py: 2,
            gap: 3,
          }}
        >
          <Box sx={{ minWidth: 240, height: 260, flex: '0 0 auto' }}>
            <ResponsiveContainer width={240} height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                >
                  {data.map(entry => (
                    <Cell key={entry.name} fill={colorMap[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              minWidth: 160,
              height: 260,
              overflowX: 'auto',
              gap: 2,
              alignItems: 'flex-start',
              pr: 2,
              flex: '1 0 auto',
            }}
          >
            {columns.map((col, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', minWidth: 140, mr: 1 }}>
                {col.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{
                      width: 16, height: 16, background: item.color,
                      borderRadius: 2, mr: 1, border: '1px solid #ccc',
                      flex: '0 0 16px'
                    }} />
                    <Typography variant="body2" noWrap title={item.display}>
                      {item.display}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
        {/* LLM Description Button & Output */}
        <Box sx={{ mt: 3, mb: 1, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleGenerateDescription} disabled={loading}>
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Generate Description
          </Button>
          <Button
            variant="contained"
            sx={{ ml: 1 }}
            color={addSuccess ? 'success' : alreadyInCart ? 'secondary' : 'primary'}
            disabled={alreadyInCart}
            onClick={handleAddToCart}
          >
            {alreadyInCart ? "In Cart" : addSuccess ? "Added!" : "Add to Cart"}
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        )}
        {desc && (
          <Box sx={{ mt: 2, background: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1">Pie Chart Description</Typography>
            <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{desc}</Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default PieChartModal;
