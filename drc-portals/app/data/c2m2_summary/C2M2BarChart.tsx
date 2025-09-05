'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Label
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

const axisTitleMap: Record<string, string> = {
  file_format: 'File format',
  assay_type: 'Assay type',
  analysis_type: 'Analysis type',
  data_type: 'Data type',
  compression_format: 'Compression Format',
  taxonomy_id: 'Species',
  ethnicity: 'Ethnicity',
  sex: 'Sex',
  race: 'Race',
  phenotype: 'Phenotype',
  granularity: 'Granularity',
  role: 'Role',
  biofluid: 'Biofluid',
  sample_prep_method: 'Sample Preparation Method',
  disease: 'Disease',
  anatomy: 'Anatomy',
  compound: 'Compound',
  protein: 'Protein',
  dcc: 'Common Fund Program',
};

export interface C2M2BarChartProps {
  data: Record<string, number | string | undefined>[];
  xAxis: string;
  groupValues: string[];
  colorMap: Record<string, string>;
  showUnspecified: boolean;
  minBarWidth?: number;
  minChartWidth?: number;
  xAxisTitle?: string;
  yAxisTitle?: string;
  figureCaption?: string;
}

const C2M2BarChart: React.FC<C2M2BarChartProps> = ({
  data,
  xAxis,
  groupValues,
  colorMap,
  showUnspecified,
  minBarWidth = 60,
  minChartWidth = 600,
  xAxisTitle,
  yAxisTitle,
  figureCaption,
}) => {
  const [view, setView] = useState<'bar' | 'table'>('bar');
  const [pieModalOpen, setPieModalOpen] = useState(false);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [pieTitle, setPieTitle] = useState('');

  // Aggregate total counts and sort descending
  const barChartData = data
    .map(row => {
      const totalCount = groupValues.reduce(
        (sum, g) => sum + (typeof row[g] === 'number' ? (row[g] as number) : 0),
        0
      );
      return {
        [xAxis]: row[xAxis],
        totalCount,
        _originalRow: row,
      };
    })
    .sort((a, b) => (b.totalCount ?? 0) - (a.totalCount ?? 0));

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
    setPieTitle(`${axisTitleMap[xAxis] || xAxis}: ${row[xAxis]}`);
    setPieModalOpen(true);
  };

  // Determine axis titles
  const xTitle = xAxisTitle ?? axisTitleMap[xAxis] ?? xAxis;

  // Compute min and max counts for scale
  const counts = barChartData.map(d => d.totalCount ?? 0);
  const minCount = Math.min(...counts.filter(c => c > 0));
  const maxCount = Math.max(...counts);

  // Use log scale if ratio > 20 and minCount > 0
  const useLogScale = (maxCount / minCount) > 20 && minCount > 0;
  const yTitle = useLogScale ? `log(${yAxisTitle ?? 'Count'})` : (yAxisTitle ?? 'Count');

  // Figure caption
  const captionText = figureCaption ?? `Figure: Bar chart of ${yTitle} by ${xTitle}`;

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
              <XAxis
                dataKey={xAxis}
                angle={-40}
                textAnchor="end"
                interval={0}
                height={70}
                label={{ value: xTitle, position: 'insideBottom', offset: -50 }}
              />
              <YAxis
                scale={useLogScale ? 'log' : 'linear'}
                domain={useLogScale ? [minCount, 'auto'] : [0, 'auto']}
                allowDataOverflow
              >
                <Label
                  value={yTitle}
                  angle={-90}
                  position='left'
                  offset={40}
                  style={{
                    textAnchor: 'middle',
                    fill: '#666',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                />
              </YAxis>
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,100,255,0.07)' }} />
              <Bar
                dataKey="totalCount"
                fill="#8884d8"
                style={{ cursor: 'pointer' }}
                onClick={(_, index) => handleViewPie(barChartData[index]._originalRow)}
              />
            </BarChart>
          </div>
          <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }} variant="caption">
            {captionText}
          </Typography>
        </Box>
      )}

      {view === 'table' && (
        <>
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
                      {axisTitleMap[col] ?? col}
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
          <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }} variant="caption">
            {captionText}
          </Typography>
        </>
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
