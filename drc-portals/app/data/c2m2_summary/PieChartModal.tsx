'use client';

import React from 'react';
import { Box, Typography, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface PieChartModalProps {
  open: boolean;
  onClose: () => void;
  data: { name: string; value: number }[];
  title: string;
  colorMap: Record<string, string>;
}

// Layout: Pie to the left, legend on the right, horizontal scroll appears if legend is too wide.
// Legend shows label and value, e.g., brain [873]

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 560,              // ensures both pie and at least one legend column are visible
  maxWidth: '95vw',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const PieChartModal: React.FC<PieChartModalProps> = ({
  open, onClose, data, title, colorMap,
}) => {
  // Prepare custom legend: split into columns of ~8 items each.
  const maxPerCol = 8;
  const legendItems = data.map(d => ({
    display: `${d.name} [${d.value}]`,
    color: colorMap[d.name] || '#8884d8',
    id: d.name,
  }));
  const colCount = Math.ceil(legendItems.length / maxPerCol);
  const columns: typeof legendItems[] = [];
  for (let i = 0; i < legendItems.length; i += maxPerCol) {
    columns.push(legendItems.slice(i, i + maxPerCol));
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        {/* Pie and legend side-by-side, scrollable if legend is wide */}
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
          {/* PieChart */}
          <Box sx={{ minWidth: 240, height: 260, flex: '0 0 auto' }}>
            <ResponsiveContainer width={240} height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  label
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
          {/* Custom Legend */}
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
      </Box>
    </Modal>
  );
};

export default PieChartModal;
