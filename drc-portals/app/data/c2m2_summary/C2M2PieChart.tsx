import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { hcl } from 'd3-color';

export interface C2M2PieChartProps {
  data: { name: string; value: number }[];
  colorMap?: Record<string, string>; // optional, will generate if missing
  title?: string;
}

// Maximum items per legend column
const maxPerCol = 8;

// Generate vivid colors using golden angle and high chroma
const generateGoldenAngleColors = (n: number) => {
  const goldenAngle = 137.508;
  return Array.from({ length: n }, (_, i) => {
    const hue = (i * goldenAngle) % 360;
    const chroma = n <= 20 ? 100 : 80;              // maximum saturation for vividness
    const luminance = n <= 20 ? 50 + (i % 2) * 5 : 55; // slight alternation for contrast
    return hcl(hue, chroma, luminance).formatHex();
  });
};

// Perfect shuffle to avoid adjacent similar hues
const perfectShuffleOrder = (n: number): number[] => {
  const result: number[] = [];
  let increment = Math.floor(n / 2);
  increment = increment > 0 ? increment : 1; // fallback if n=1
  for (let i = 0; i < n; i++) {
    result.push((i * increment) % n);
  }
  return result;
};

// Generate colors mapped to names with max separation
const generateDistinctColors = (names: string[]) => {
  const n = names.length;
  const baseColors = generateGoldenAngleColors(n);
  const order = perfectShuffleOrder(n);
  return Object.fromEntries(names.map((name, i) => [name, baseColors[order[i]]] ));
};

const C2M2PieChart: React.FC<C2M2PieChartProps> = ({ data, colorMap, title }) => {
  const names = data.map(d => d.name);
  const effectiveColorMap = colorMap || generateDistinctColors(names);

  // Build legend items with counts
  type LegendItem = { display: string; color: string; id: string; };
  const legendItems: LegendItem[] = data.map(d => ({
    display: `${d.name} [${d.value}]`,
    color: effectiveColorMap[d.name],
    id: String(d.name),
  }));

  // Split legend into columns
  const columns: LegendItem[][] = [];
  for (let i = 0; i < legendItems.length; i += maxPerCol) {
    columns.push(legendItems.slice(i, i + maxPerCol));
  }

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2 }}>
        {/* Pie Chart */}
        <Box sx={{ minWidth: 260, height: 280 }}>
          <ResponsiveContainer width={260} height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={false} // legend handles counts
              >
                {data.map(entry => (
                  <Cell key={entry.name} fill={effectiveColorMap[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Custom Legend */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
          {columns.map((col, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
              {col.map(item => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      background: item.color,
                      borderRadius: 2,
                      mr: 1,
                      border: '1px solid #ccc',
                      flex: '0 0 16px',
                    }}
                  />
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
  );
};

export default C2M2PieChart;
