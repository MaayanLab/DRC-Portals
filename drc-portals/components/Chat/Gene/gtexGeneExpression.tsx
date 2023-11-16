import useSWR from 'swr';
import dynamic from 'next/dynamic';
import getStandardDeviation from '@/components/Chat/utils/std'
import { PlotParams } from 'react-plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div>Loading...</div> })

interface GeneExpressionData {
  term: string;
  zscore: number;
}

const fetchGenecodeId = async (geneId: string) => {
  const response = await fetch(`https://gtexportal.org/api/v2/reference/gene?geneId=${geneId}&pageSize=1&format=json`);
  const data = await response.json();
  return data.data[0].gencodeId;
};

const fetchGeneExpression = async (geneSymbol: string, datasetId: string = 'gtex_v8') => {
  const gencodeId = await fetchGenecodeId(geneSymbol);
  const response = await fetch(`https://gtexportal.org/api/v2/expression/medianGeneExpression?format=json&gencodeId=${gencodeId}&datasetId=${datasetId}`);
  const data = await response.json();
  return data.data;
};

export default function GtexGeneExpression(props: any) {
  const datasetId = 'gtex_v8'
  const geneSymbol = props.genesymbol
  const { data, error, isLoading } = useSWR([geneSymbol, datasetId], () => fetchGeneExpression(geneSymbol, datasetId));

  if (error) {
    return <div>No information for gene with identifier ${geneSymbol} found in GTEx</div>;
  } else if (isLoading) {
    return <div>Loading...</div>;
  }
  const medians = data.map((item: any) => item.median)
  const mediansMean = medians.reduce((total: number, current: number) => total + current) / medians.length
  const mediansStd = getStandardDeviation(medians)
  const result: GeneExpressionData[] = data.map((item: any) => ({
    term: item.tissueSiteDetailId,
    zscore: (item.median - mediansMean) / mediansStd,
  }));

  result.sort((a, b) =>  a.zscore - b.zscore);
  const termLabels = result.map((item) => item.term.replaceAll('_', ' '));
  const zscores = result.map((item) => item.zscore);

  const plotData: PlotParams['data'] = [{
    x: zscores,
    y:termLabels,
    type: 'bar',
    orientation: 'h',
  }]

  const layout: PlotParams['layout'] = {
    title: `${geneSymbol} GTEx Gene Expression Z-Scores`,
    autosize: true,
    height: termLabels.length * 18,
    margin: {
      pad: 4
    },
    xaxis: { title: 'Z-Score', automargin: true },
    yaxis: { automargin: true, tickmode: 'linear' },
    plot_bgcolor:"transparent",
    paper_bgcolor:"transparent",
    font: {
      color: "white",

    }
  };

  return (
    <div>
        <> 
          <Plot
          data={plotData}
          layout={layout}
          />
        </>
    </div>
  );
};
