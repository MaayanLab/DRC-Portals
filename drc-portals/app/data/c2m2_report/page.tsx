'use client';

import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useCart } from '../c2m2_summary/CartContext';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const C2M2Heatmap = dynamic(() => import('../c2m2_summary/C2M2Heatmap'), { ssr: false });
// Utility to clean up escape characters and HTML entities from Markdown
function cleanMarkdown(text?: string): string {
  console.log("In cleanup mardown");
  if (!text) return '';

  let cleaned = text;

  // Remove backslash escapes before Markdown syntax like \*, \_, \`
  cleaned = cleaned.replace(/\\([*_`])/g, '$1');

  // Decode common HTML entities (&lt; &gt; &amp;)
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  // Trim extra whitespace or quotes
  cleaned = cleaned.trim().replace(/^"(.*)"$/, '$1');

  return cleaned;
}

// Custom MUI components for ReactMarkdown
const markdownComponents = {
  p: (props: any) => <Typography variant="body1" paragraph {...props} />,
  strong: (props: any) => <Typography component="span" fontWeight="bold" {...props} />,
  em: (props: any) => <Typography component="span" fontStyle="italic" {...props} />,
  code: (props: any) => (
    <Box component="code" sx={{ bgcolor: '#eee', borderRadius: 1, px: 0.5, fontFamily: 'monospace' }} {...props} />
  ),
  a: (props: any) => <Typography component="a" color="primary" sx={{ textDecoration: 'underline' }} {...props} />,
  ul: (props: any) => <Box component="ul" sx={{ pl: 3, mb: 1.5 }} {...props} />,
  ol: (props: any) => <Box component="ol" sx={{ pl: 3, mb: 1.5 }} {...props} />,
  li: (props: any) => <li {...props} />,
  pre: (props: any) => (
    <Box component="pre" sx={{ bgcolor: '#f0f0f0', p: 2, borderRadius: 1, overflowX: 'auto' }} {...props} />
  ),
};

const ReportPage: React.FC = () => {
  const { cart } = useCart();

  if (!cart || cart.length === 0) {
    return (
      <Typography variant="h5" sx={{ m: 4 }}>
        No charts have been added. Go back and add charts!
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Charts Report
      </Typography>

      {cart.map((item) => {
        // Handle Bar Charts
        if (item.chartType === 'bar') {
          const barItem = item;
          const keys = Object.keys(barItem.chartData[0] || {}).filter(k => k !== barItem.xAxis);

          return (
            <Box key={barItem.id} sx={{ mb: 5 }}>
              <Typography variant="h6">
                {barItem.yAxis} by {barItem.xAxis}
                {barItem.groupBy && ` (grouped by ${barItem.groupBy})`}
              </Typography>

              <BarChart
                width={600}
                height={350}
                data={barItem.chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={barItem.xAxis} angle={-40} textAnchor="end" interval={0} height={60} />
                <YAxis />
                <Tooltip />
                {keys.map((k, i) => (
                  <Bar
                    key={k}
                    dataKey={k}
                    fill={`hsl(${(i * 360) / keys.length}, 60%, 55%)`}
                    stackId="a"
                  />
                ))}
              </BarChart>

              {barItem.plotDescription && (
                <Paper elevation={1} sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: '#fafafa' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Plot Description
                  </Typography>

                  <Box
                    sx={{
                      '& p': { mb: 1.5, lineHeight: 1.6 },
                      '& ul': { pl: 3, mb: 1.5 },
                      '& ol': { pl: 3, mb: 1.5 },
                      '& code': {
                        backgroundColor: '#eee',
                        borderRadius: '4px',
                        px: 0.5,
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        backgroundColor: '#f0f0f0',
                        p: 1.5,
                        borderRadius: 1,
                        overflowX: 'auto',
                      },
                      '& a': {
                        color: '#1976d2',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {cleanMarkdown(barItem.plotDescription)}
                    </ReactMarkdown>
                  </Box>
                </Paper>
            )}


              <Divider sx={{ mt: 3 }} />
            </Box>
          );
        }

        // Handle Heatmap Charts
        if (item.chartType === 'heatmap') {
          const heatItem = item;
          return (
            <Box key={heatItem.id} sx={{ mb: 5 }}>
              <Typography variant="h6">Heatmap: {heatItem.id}</Typography>
              <C2M2Heatmap xLabels={heatItem.xLabels} yLabels={heatItem.yLabels} z={heatItem.z} />

              <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: '#fafafa' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Box>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {heatItem.plotDescription}
                  </ReactMarkdown>
                </Box>
              </Paper>

              <Divider sx={{ mt: 3 }} />
            </Box>
          );
        }

        // Handle Pie Charts
        if (item.chartType === 'pie') {
          const pieItem = item;
          return (
            <Box key={pieItem.id} sx={{ mb: 5 }}>
              <Typography variant="h6">{pieItem.title || `Pie Chart: ${pieItem.id}`}</Typography>
              {/* Add Pie chart here if desired */}

              <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: '#fafafa' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Box>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {pieItem.pieDescription}
                  </ReactMarkdown>
                </Box>
              </Paper>

              <Divider sx={{ mt: 3 }} />
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
};

export default ReportPage;
