'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Box, Typography, CircularProgress, Divider, Button } from '@mui/material'
import { getReport } from '../reportStorage'
import C2M2BarChart from '../../c2m2_summary/C2M2BarChart'
import C2M2PieChart from '../../c2m2_summary/C2M2PieChart'
import { SavedChart } from '../../c2m2_summary/CartContext'

const INTRODUCTION = `
Building on the C2M2 framework, this report presents a series of visual summaries that highlight the distribution and relationships among core metadata entities within the NIH Common Fund Data Ecosystem. Specifically, it focuses on counts of key entities—subjects, biosamples, projects, collections, and files—plotted along the y-axis, with various related entities such as anatomical sources, disease states, assay types, and contributing programs displayed along the x-axis. Many plots also incorporate a group-by dimension, allowing for layered comparisons across additional metadata categories. Together, these visualizations offer an intuitive overview of how data is structured, submitted, and distributed across Common Fund programs, providing valuable insights into the scale, scope, and context of the available resources.
`

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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    const charts = getReport(id)
    setReportCharts(charts)
    setLoading(false)
  }, [id])

  const exportHTML = () => {
    if (!containerRef.current) return

    // Clone report container
    const cloned = containerRef.current.cloneNode(true) as HTMLElement

    // Remove export button so it won't appear in exported HTML
    const exportButton = cloned.querySelector('.export-button')
    if (exportButton) {
      exportButton.remove()
    }

    // Serialize all CSS from stylesheets
    let cssText = ''
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (!sheet.cssRules) continue
        for (const rule of Array.from(sheet.cssRules)) {
          cssText += rule.cssText + '\n'
        }
      } catch {
        continue
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
    `

    // Download as .html file
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `C2M2_Report_${id}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  }

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
    <Box sx={{ p: 4, position: 'relative' }} ref={containerRef}>
      <Box className="export-button" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Button variant="contained" onClick={exportHTML}>
          Export HTML
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Saved Report
      </Typography>

      <Typography paragraph sx={{ mb: 4 }}>
        {INTRODUCTION}
      </Typography>

      {reportCharts.map((item) => {
        if (item.chartType === 'bar') {
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

          const colorMap = groupValues.reduce((map, key, i) => {
            map[key] =
              key === 'Unspecified'
                ? '#8e99ab'
                : `hsl(${(i * 360) / groupValues.length}, 60%, 55%)`
            return map
          }, {} as Record<string, string>)

          const minChartWidth = Math.max(groupValues.length * 70, 700)

          return (
            <Box key={item.id} sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {item.yAxis} vs {item.xAxis}
                {item.groupBy && ` (grouped by ${item.groupBy})`}
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
                <Typography>{item.plotDescription || 'No description generated.'}</Typography>
              </Box>
              <Divider sx={{ mt: 4 }} />
            </Box>
          )
        }

        if (item.chartType === 'pie') {
          const allLabels = item.pieData.map(d => d.name)
          const colorMap = allLabels.reduce((map, label, idx) => {
            map[label] =
              label === 'Unspecified'
                ? '#8e99ab'
                : `hsl(${(idx * 360) / allLabels.length}, 60%, 55%)`
            return map
          }, {} as Record<string, string>)

          const pieMinWidth = Math.max(allLabels.length * 50, 450)

          return (
            <Box key={item.id} sx={{ mb: 6 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Pie Chart: {item.groupBy} breakdown for {item.xAxis}: {item.xAxisValue}
              </Typography>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Box sx={{ minWidth: pieMinWidth }}>
                  <C2M2PieChart
                    data={item.pieData}
                    colorMap={colorMap}
                    title={`${item.xAxis}: ${item.xAxisValue}`}
                  />
                </Box>
              </Box>
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
                <Typography>{item.pieDescription || 'No description generated.'}</Typography>
              </Box>
              <Divider sx={{ mt: 4 }} />
            </Box>
          )
        }

        return null
      })}
    </Box>
  )
}
