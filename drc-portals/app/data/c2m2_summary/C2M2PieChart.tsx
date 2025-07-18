import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface C2M2PieChartProps {
  data: { name: string; value: number }[];
  colorMap: Record<string, string>;
  title?: string;
}

const maxPerCol = 8;

const C2M2PieChart: React.FC<C2M2PieChartProps> = ({ data, colorMap, title }) => {
  // Build legend items
  type LegendItem = {
    display: string;
    color: string;
    id: string;
  };
  const legendItems: LegendItem[] = data.map(d => ({
    display: `${d.name} [${d.value}]`,
    color: colorMap[d.name] || '#8884d8',
    id: String(d.name),
  }));

  // Break legend into columns
  const columns: LegendItem[][] = [];
  for (let i = 0; i < legendItems.length; i += maxPerCol) {
    columns.push(legendItems.slice(i, i + maxPerCol));
  }

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 1 }}>{title}</Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2, pt: 2 }}>
        <Box sx={{ minWidth: 240, height: 260 }}>
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
                {data.map((entry) => (
                  <Cell key={entry.name} fill={colorMap[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        {/* Custom Legend */}
        <Box sx={{ display: 'flex', flexDirection: 'row', minWidth: 140, gap: 2 }}>
          {columns.map((col, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', minWidth: 100 }}>
              {col.map(item => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{
                    width: 16, height: 16, background: item.color,
                    borderRadius: 2, mr: 1, border: '1px solid #ccc', flex: '0 0 16px'
                  }} />
                  <Typography variant="body2" noWrap title={item.display}>{item.display}</Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default C2M2PieChart;
