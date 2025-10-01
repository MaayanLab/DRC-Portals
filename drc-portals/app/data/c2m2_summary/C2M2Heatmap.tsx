'use client';

import React from 'react';
import Plot from 'react-plotly.js';

interface C2M2HeatmapProps {
  xLabels: string[];
  yLabels: string[];
  z: number[][];
}

const C2M2Heatmap: React.FC<C2M2HeatmapProps> = ({ xLabels, yLabels, z }) => {
  const trace = {
    z: z,
    x: xLabels,
    y: yLabels,
    type: 'heatmap',
    colorscale: 'Viridis',
    hoverongaps: false, // bypass typing issue
  } as Partial<Plotly.Data> & { hoverongaps: boolean };

  return (
    <Plot
      data={[trace]}
      layout={{
        title: 'C2M2 Heatmap',
        xaxis: { title: 'X Axis' },
        yaxis: { title: 'Y Axis' },
        margin: { t: 50, l: 80 },
        autosize: true,
      }}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
    />
  );
};

export default C2M2Heatmap;
