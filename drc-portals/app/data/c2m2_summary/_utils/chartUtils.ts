// src/utils/chartUtils.ts
import { SavedChart } from '../CartContext';

export function generateChartTitle(item: SavedChart): string {
  if ('title' in item && item.title) return item.title;

  if (item.chartType === 'bar') {
    return `${item.yAxis} vs ${item.xAxis}${item.groupBy ? ` (grouped by ${item.groupBy})` : ''}`;
  }

  if (item.chartType === 'pie') {
    return `Pie Chart: ${item.groupBy} breakdown for ${item.xAxis}: ${item.xAxisValue}`;
  }

  if (item.chartType === 'heatmap') {
    return 'Heatmap Chart';
  }

  return 'Untitled Chart';
}
