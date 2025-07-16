'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
  Box, Typography, RadioGroup, FormControlLabel, Radio,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper
} from '@mui/material';

export interface C2M2BarChartProps {
  data: Record<string, number | string | undefined>[];
  xAxis: string;
  groupValues: string[];
  colorMap: Record<string, string>;
  showUnspecified: boolean;
  minBarWidth?: number;
  minChartWidth?: number;
}

export const C2M2BarChart: React.FC<C2M2BarChartProps> = ({
  data,
  xAxis,
  groupValues,
  colorMap,
  showUnspecified,
  minBarWidth = 60,
  minChartWidth = 600,
}) => {
  const [view, setView] = useState<'bar' | 'table'>('bar');

  const topPlotGroups = groupValues.filter(g => g !== 'Unspecified');
  const bottomPlotGroups = groupValues.includes('Unspecified') ? ['Unspecified'] : [];
  const topPlotData = data.map(row => {
    const newRow = { ...row };
    if ('Unspecified' in newRow) delete newRow['Unspecified'];
    return newRow;
  });
  const bottomPlotData = data.map(row => ({
    [xAxis]: row[xAxis],
    Unspecified: row['Unspecified'],
  }));

  const topChartWidth = Math.max(topPlotData.length * minBarWidth, minChartWidth);
  const bottomChartWidth = Math.max(bottomPlotData.length * minBarWidth, minChartWidth);
  const hasUnspecified = showUnspecified && bottomPlotGroups.length > 0;
  const topPlotHeight = hasUnspecified ? 300 : 500;

  // Table columns: xAxis + groupValues (hide "Unspecified" if not shown)
  const tableColumns = [
    xAxis,
    ...groupValues.filter(g => showUnspecified || g !== 'Unspecified'),
  ];

  return (
    <Box>
      {/* View Toggle */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ mr: 2 }}>View as:</Typography>
        <RadioGroup
          row
          value={view}
          onChange={e => setView(e.target.value as 'bar' | 'table')}
        >
          <FormControlLabel value="bar" control={<Radio />} label="Bar Chart" />
          <FormControlLabel value="table" control={<Radio />} label="Table" />
        </RadioGroup>
      </Box>

      {view === 'bar' && (
        <>
          {/* Main Stacked Chart (unchanged) */}
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
          {/* Unspecified Only */}
          {hasUnspecified && (
            <Box sx={{ width: '100%', overflowX: 'auto', mt: 2 }}>
              <Typography align="center" variant="subtitle2" sx={{ mb: 1 }}>
                Unspecified Only
              </Typography>
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
                  <Bar dataKey="Unspecified" fill={colorMap['Unspecified'] || '#8884d8'} stackId="a" />
                </BarChart>
              </div>
            </Box>
          )}
        </>
      )}

      {view === 'table' && (
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 400,
            width: '100%',
            overflow: 'auto',
            border: '1px solid #ccc',
            borderRadius: 1,
            mt: 2,
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {tableColumns.map(col => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIdx) => (
                <TableRow key={rowIdx} hover>
                  {tableColumns.map(col => {
                    const cell = row[col];
                    return (
                      <TableCell key={col}>
                        {typeof cell === 'number'
                          ? cell.toLocaleString()
                          : cell ?? ''}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
