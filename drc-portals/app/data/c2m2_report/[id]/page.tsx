'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import { getReport } from '@/app/data/c2m2_report/reportStorage';
import C2M2BarChart from '@/app/data/c2m2_summary/C2M2BarChart';
import C2M2PieChart from '@/app/data/c2m2_summary/C2M2PieChart';
import { SavedChart } from '@/app/data/c2m2_summary/CartContext';
import { generateChartTitle } from '@/app/data/c2m2_summary/_utils/chartUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const INTRODUCTION = `
Building on the C2M2 framework, this report presents a series of visual summaries ...
`;

// --- Utility: unescape Markdown that Gemini may escape ---
const unescapeMarkdown = (text: string) =>
  text?.replace(/\\([*_~`])/g, '$1') ?? '';

export default function C2M2ReportPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params?.id[0]
        : '';
  const [reportCharts, setReportCharts] = useState<SavedChart[] | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const charts = getReport(id);
    setReportCharts(charts);
    setLoading(false);
  }, [id]);

  const exportHTML = () => {
    if (!containerRef.current) return;

    const cloned = containerRef.current.cloneNode(true) as HTMLElement;
    const exportButton = cloned.querySelector('.export-button');
    if (exportButton) exportButton.remove();

    let cssText = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (!sheet.cssRules) continue;
        for (const rule of Array.from(sheet.cssRules))
          cssText += rule.cssText + '\n';
      } catch {
        continue;
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>C2M2 Report - ${id}</title>
        <style>${cssText}</style>
      </head>
      <body>${cloned.outerHTML}</body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `C2M2_Report_${id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <Box sx={{ p: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (!reportCharts)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Report not found.</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 4, position: 'relative' }} ref={containerRef}>
      {/* Export Button */}
      <Box
        className="export-button"
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
      >
        <Button variant="contained" onClick={exportHTML}>
          Export HTML
        </Button>
      </Box>

      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Saved Report
      </Typography>
      <Typography paragraph sx={{ mb: 4 }}>
        {INTRODUCTION}
      </Typography>

      {/* Charts Loop */}
      {reportCharts.map((item) => {
        if (item.chartType === 'bar') {
          const groupValues = item.groupBy
            ? Array.from(
              item.chartData.reduce<Set<string>>((set, row) => {
                Object.keys(row).forEach((key) => {
                  if (key !== item.xAxis) set.add(key);
                });
                return set;
              }, new Set())
            )
            : ['value'];

          const colorMap = groupValues.reduce((map, key, i) => {
            map[key] =
              key === 'Unspecified'
                ? '#8e99ab'
                : `hsl(${(i * 360) / groupValues.length}, 60%, 55%)`;
            return map;
          }, {} as Record<string, string>);

          const minChartWidth = Math.max(groupValues.length * 70, 700);

          return (
            <Box key={item.id} sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {generateChartTitle(item)}
              </Typography>

              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{ minWidth: minChartWidth }}>
                  <C2M2BarChart
                    data={item.chartData}
                    xAxis={item.xAxis}
                    yAxis={item.yAxis}
                    groupBy={item.groupBy || ''}
                    groupValues={groupValues}
                    colorMap={colorMap}
                    showUnspecified={item.showUnspecified ?? false}
                  />
                </Box>
              </Box>

              {/* Markdown Description */}
              <Paper
                elevation={1}
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Box
                  sx={{
                    '& p': { mb: 1.5, lineHeight: 1.6 },
                    '& ul': { pl: 3, mb: 1.5 },
                    '& ol': { pl: 3, mb: 1.5 },
                    '& strong': { fontWeight: 600 },
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
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {unescapeMarkdown(item.plotDescription || 'No description generated.')}
                  </ReactMarkdown>
                </Box>
              </Paper>

              <Divider sx={{ mt: 4 }} />
            </Box>
          );
        }

        if (item.chartType === 'pie') {
          const allLabels = item.pieData.map((d) => d.name);
          const colorMap = allLabels.reduce((map, label, idx) => {
            map[label] =
              label === 'Unspecified'
                ? '#8e99ab'
                : `hsl(${(idx * 360) / allLabels.length}, 60%, 55%)`;
            return map;
          }, {} as Record<string, string>);

          const pieMinWidth = Math.max(allLabels.length * 50, 450);

          return (
            <Box key={item.id} sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {generateChartTitle(item)}
              </Typography>

              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{ minWidth: pieMinWidth }}>
                  <C2M2PieChart
                    data={item.pieData}
                    colorMap={colorMap}
                    title={generateChartTitle(item)}
                  />
                </Box>
              </Box>

              {/* Markdown Description */}
              <Paper
                elevation={1}
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Box
                  sx={{
                    '& p': { mb: 1.5, lineHeight: 1.6 },
                    '& ul': { pl: 3, mb: 1.5 },
                    '& ol': { pl: 3, mb: 1.5 },
                    '& strong': { fontWeight: 600 },
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {unescapeMarkdown(item.pieDescription || 'No description generated.')}
                  </ReactMarkdown>
                </Box>
              </Paper>

              <Divider sx={{ mt: 4 }} />
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
}
