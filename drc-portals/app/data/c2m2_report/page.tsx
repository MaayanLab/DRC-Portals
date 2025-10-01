'use client';

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useCart } from '../c2m2_summary/CartContext';

// Type for SavedChart
type SavedChart = {
  id: string;
  yAxis: string;
  xAxis: string;
  groupBy: string;
  chartData: Record<string, any>[];
  plotDescription: string;
};

const ReportPage: React.FC = () => {
  const { cart } = useCart();

  if (!cart || cart.length === 0) {
    return <Typography variant="h5" sx={{ m: 4 }}>No charts have been added. Go back and add charts!</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Charts Report</Typography>
      {cart.map((item) => 'yAxis' in item && (
        <Box key={item.id} sx={{ mb: 5 }}>
          <Typography variant="h6">{item.yAxis} by {item.xAxis}{item.groupBy && ` (grouped by ${item.groupBy})`}</Typography>
          <BarChart
            width={600}
            height={350}
            data={item.chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={item.xAxis} angle={-40} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            {Object.keys(item.chartData[0] || {})
              .filter(k => k !== item.xAxis)
              .map(k => (
                <Bar key={k} dataKey={k} fill="#8884d8" stackId="a" />
              ))}
          </BarChart>
          <Box sx={{ mt: 2, p: 2, background: "#fafafa", border: "1px solid #eee", borderRadius: 1 }}>
            <Typography>Description:</Typography>
            <Typography>{item.plotDescription || "No description generated."}</Typography>
          </Box>
          <Divider sx={{ mt: 3 }} />
        </Box>
      ))}
    </Box>
  );
};

export default ReportPage;
