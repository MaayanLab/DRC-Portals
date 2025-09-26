'use client';

import React from 'react';
import Plot from 'react-plotly.js';

interface C2M2HeatmapProps {
  xLabels: string[];
  yLabels: string[];
  z: number[][];
}

const C2M2Heatmap: React.FC<C2M2HeatmapProps> = ({ xLabels, yLabels, z }) => {
  const flatZ = z.flat();
  const nonZeroZ = flatZ.filter(v => v > 0);

  const minCount = nonZeroZ.length > 0 ? Math.min(...nonZeroZ) : 0;
  const maxCount = flatZ.length > 0 ? Math.max(...flatZ) : 0;

  const useLogScale = minCount > 0 && maxCount / minCount > 20;

  const logZ = useLogScale
    ? z.map(row => row.map(v => (v > 0 ? Math.log10(v) : 0)))
    : z;

  const hoverText = z.map((row, i) =>
    row.map((val, j) => {
      const xLabel = xLabels[j];
      const yLabel = yLabels[i];
      const transformedVal = useLogScale
        ? val > 0
          ? Math.log10(val).toFixed(2)
          : '0'
        : val.toFixed(2);
      return `X: ${xLabel}<br>Y: ${yLabel}<br>Raw Count: ${val}<br>${
        useLogScale ? 'Log₁₀(Value)' : 'Value'
      }: ${transformedVal}`;
    })
  );

  // Plain object for the trace
  const trace = {
    z: logZ,
    x: xLabels,
    y: yLabels,
    type: 'heatmap' as const,
    colorscale: 'Viridis',
    hoverinfo: 'text' as const,
    text: hoverText,
    hoverongaps: false,
    zauto: !useLogScale,
    ...(useLogScale
      ? { zmin: Math.log10(minCount), zmax: Math.log10(maxCount), colorbar: { title: 'log₁₀(count)' } }
      : { colorbar: { title: 'count' } }),
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: Math.max(600, xLabels.length * 40) }}>
        <Plot
          data={[trace as any]} // ✅ Only cast at render time
          layout={{
            title: 'C2M2 Heatmap',
            xaxis: { title: '', automargin: true },
            yaxis: { title: '', automargin: true },
            margin: { t: 50, l: 150, r: 50, b: 100 },
            autosize: false,
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
        />
      </div>
    </div>
  );
};

export default C2M2Heatmap;
