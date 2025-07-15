'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Box, Typography, CircularProgress, Divider } from '@mui/material'
import { getReport } from '../reportStorage'
import { C2M2BarChart } from '../../c2m2_summary/C2M2BarChart'

interface SavedChart {
  id: string
  xAxis: string
  yAxis: string
  groupBy: string
  chartData: Record<string, any>[]
  plotDescription: string
  showUnspecified?: boolean
}
const INTRODUCTION = `
Building on the C2M2 framework, this report presents a series of visual summaries that highlight the distribution and relationships among core metadata entities within the NIH Common Fund Data Ecosystem. Specifically, it focuses on counts of key entities—subjects, biosamples, projects, collections, and files—plotted along the y-axis, with various related entities such as anatomical sources, disease states, assay types, and contributing programs displayed along the x-axis. Many plots also incorporate a group-by dimension, allowing for layered comparisons across additional metadata categories. Together, these visualizations offer an intuitive overview of how data is structured, submitted, and distributed across Common Fund programs, providing valuable insights into the scale, scope, and context of the available resources.
`;
export default function C2M2ReportPage() {
  const params = useParams()
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params?.id[0]
        : ''
  const [reportCharts, setReportCharts] = useState<SavedChart[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const charts = getReport(id)
    setReportCharts(charts)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!reportCharts) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Report not found.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Saved Report
      </Typography>
      {reportCharts.map((item) => {
        // Group logic like SummaryQueryComponent
        const groupValues = item.groupBy
          ? Array.from(
              item.chartData.reduce<Set<string>>((set, row) => {
                Object.keys(row).forEach((key) => {
                  if (key !== item.xAxis) set.add(key)
                })
                return set
              }, new Set())
            )
          : ['value']

        // Color mapping (same as summary component)
        const colorMap = groupValues.reduce((map, key, i) => {
          map[key] =
            key === 'Unspecified'
              ? '#8e99ab'
              : `hsl(${(i * 360) / groupValues.length}, 60%, 55%)`
          return map
        }, {} as Record<string, string>)

        return (
          <Box key={item.id} sx={{ mb: 6 }}>
            <Typography paragraph sx={{ mb: 4 }}>
              {INTRODUCTION}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {item.yAxis} vs {item.xAxis}
              {item.groupBy && ` (grouped by ${item.groupBy})`}
            </Typography>
            
            <C2M2BarChart
              data={item.chartData}
              xAxis={item.xAxis}
              groupValues={groupValues}
              colorMap={colorMap}
              showUnspecified={item.showUnspecified ?? false}
            />
            <Box
              sx={{
                mt: 2,
                p: 2,
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: 1,
              }}
            >
              <Typography>Description:</Typography>
              <Typography>
                {item.plotDescription || 'No description generated.'}
              </Typography>
            </Box>
            <Divider sx={{ mt: 4 }} />
          </Box>
        )
      })}
    </Box>
  )
}
