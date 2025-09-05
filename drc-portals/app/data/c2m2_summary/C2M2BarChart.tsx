'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import {
  Box, Typography, RadioGroup, FormControlLabel, Radio,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import PieChartModal from './PieChartModal';

const CustomTooltip: React.FC<{ active?: boolean }> = ({ active }) => {
  if (active) {
    return (
      <Box
        sx={{
          background: '#fff',
          border: '1px solid #aaa',
          borderRadius: 1,
          p: 1,
          minWidth: 160,
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        <Typography>
          Click the bar to view Pie plot
        </Typography>
      </Box>
    );
  }
  return null;
};

export interface C2M2BarChartProps {
  data: Record<string, number | string | undefined>[];
  xAxis: string;
  groupValues: string[];
  colorMap: Record<string, string>;
  showUnspecified: boolean;
  minBarWidth?: number;
  minChartWidth?: number;
}

const C2M2BarChart: React.FC<C2M2BarChartProps> = ({
  data,
  xAxis,
  groupValues,
  colorMap,
  showUnspecified,
  minBarWidth = 60,
  minChartWidth = 600,
}) => {
  const [view, setView] = useState<'bar' | 'table'>('bar');
  const [pieModalOpen, setPieModalOpen] = useState(false);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [pieTitle, setPieTitle] = useState('');

  // Aggregate total counts per x-axis
  const barChartData = data.map(row => {
    const totalCount = groupValues.reduce(
      (sum, g) => sum + (typeof row[g] === 'number' ? (row[g] as number) : 0),
      0
    );
    return {
      [xAxis]: row[xAxis],
      totalCount,
      _originalRow: row, // Keep for Pie modal
    };
  });

  const chartWidth = Math.max(barChartData.length * minBarWidth, minChartWidth);

  const tableColumns = [
    xAxis,
    ...groupValues.filter(g => showUnspecified || g !== 'Unspecified'),
  ];

  const handleViewPie = (row: Record<string, any>) => {
    const pieBreakdown = groupValues
      .filter(g => (showUnspecified || g !== 'Unspecified'))
      .map(g => ({
        name: g,
        value: typeof row[g] === 'number' ? row[g] as number : 0,
      }))
      .filter(d => d.value > 0);

    setPieData(pieBreakdown);
    setPieTitle(`${xAxis}: ${row[xAxis]}`);
    setPieModalOpen(true);
  };

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
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ width: chartWidth }}>
            <BarChart
              width={chartWidth}
              height={500}
              data={barChartData}
              margin={{ top: 30, right: 40, bottom: 100, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} angle={-40} textAnchor="end" interval={0} height={70} />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,100,255,0.07)' }} />
              <Bar
                dataKey="totalCount"
                fill="#8884d8"
                style={{ cursor: 'pointer' }}
                onClick={(_, index) => handleViewPie(barChartData[index]._originalRow)}
              />
            </BarChart>
          </div>
        </Box>
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

      <PieChartModal
        open={pieModalOpen}
        onClose={() => setPieModalOpen(false)}
        data={pieData}
        title={pieTitle}
        colorMap={colorMap}
      />
    </Box>
  );
};

export default C2M2BarChart;
