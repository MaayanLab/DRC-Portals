'use client';

import React from 'react';
import Plot from 'react-plotly.js';

interface C2M2HeatmapProps {
  xLabels: string[];
  yLabels: string[];
  z: number[][];
}

const C2M2Heatmap: React.FC<C2M2HeatmapProps> = ({ xLabels, yLabels, z }) => {
  // Flatten the z matrix to compute min/max
  const flatZ = z.flat();
  const nonZeroZ = flatZ.filter(value => value > 0);

  const minCount = Math.min(...nonZeroZ);
  const maxCount = Math.max(...flatZ);

  const useLogScale = (maxCount / minCount) > 20 && minCount > 0;

  // If using log scale, transform z values
  const logZ = useLogScale
    ? z.map(row => row.map(value => (value > 0 ? Math.log10(value) : 0)))
    : z;

  // Generate custom hover text
  const hoverText = z.map((row, i) =>
    row.map((originalVal, j) => {
      const xLabel = xLabels[j];
      const yLabel = yLabels[i];
      const transformedVal = useLogScale
        ? originalVal > 0
          ? Math.log10(originalVal).toFixed(2)
          : '0'
        : originalVal.toFixed(2);

      return `X: ${xLabel}<br>Y: ${yLabel}<br>Raw Count: ${originalVal}<br>${useLogScale ? 'Log₁₀(Value)' : 'Value'}: ${transformedVal}`;
    })
  );

  const trace = {
    z: logZ,
    x: xLabels,
    y: yLabels,
    type: 'heatmap',
    colorscale: 'Viridis',
    hoverongaps: false,
    zauto: !useLogScale,
    zmin: useLogScale ? Math.log10(minCount) : undefined,
    zmax: useLogScale ? Math.log10(maxCount) : undefined,
    colorbar: useLogScale ? { title: 'log₁₀(count)' } : { title: 'count' },
    hoverinfo: 'text',
    text: hoverText,
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
