'use client'
import React from 'react'
import type { PlotParams } from 'react-plotly.js'
import dynamic from 'next/dynamic'
// Plotly accesses browser globals while its module loads.
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div>Loading...</div> })

export type PlotlyJson = {
  data: PlotParams['data'],
  layout: PlotParams['layout'],
  frames?: PlotParams['frames'],
}

export default function PlotlyPlot(props: {props: PlotlyJson}) {
  return <Plot {...props.props} />
}
