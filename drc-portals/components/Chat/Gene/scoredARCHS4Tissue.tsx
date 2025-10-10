'use client'

import useSWR from 'swr';

// Construct a workflow Gene => ARCHS4 Tissue => Barplot with the input: ACE2
import PlotlyPlot from "@/components/Chat/vis/plotly";
import PlaybookButton from '../playbookButton';

const getPlaybookARCHS4PlotData = async (body: any) => {


    const res = await fetch('https://playbook-workflow-builder.cloud/api/db/fpl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    const id = await res.json()
    const resOutput = await fetch('https://playbook-workflow-builder.cloud/api/db/fpl/' + id + '/output')

    const data = await resOutput.json()
    return {id, data}
};

export default function ScoredARCHS4Tissue(props: any) {
    const gene: string = props.geneSymbol || 'ACE2'
    
    const body = {
        workflow: [
        { id: '1', type: 'Input[Gene]', data: { type: 'Term[Gene]', value: gene } },
        { id: '2', type: 'ARCHS4TissueExpression', inputs: { gene: { id: '1' } } },
        { id: '3', type: 'BarplotFrom[Scored[Tissue]]', inputs: { terms: { id: '2' } } },
        ],
        metadata: {
        title: 'ARCHS4 Median Tissue Expression',
        },
    }
    const {data, isLoading, error} = useSWR([body], () => getPlaybookARCHS4PlotData(body));
    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <>{isLoading}</>
    }
    const plotData = (data || {}).data[2].process.output.value;
    const table_value = (data || {}).data[1].process.output.value
    const sorted = table_value.sort((a:any,b:any)=>(b.zscore-a.zscore))
    plotData.data[0].x = sorted.map((a:any)=>a.term)
    plotData.data[0].y = sorted.map((a:any)=>a.zscore)
    plotData.layout.title = `${gene} ARCHS4 Gene Expression Z-Scores`
    plotData.layout.autosize = true
    plotData.layout.margin = {
      pad: 4
    }
    plotData.layout.plot_bgcolor = "transparent"
    plotData.layout.paper_bgcolor = "transparent"
    plotData.layout.font = {
      color: "white"
    }
    return (
    <>
        <PlotlyPlot props={plotData}></PlotlyPlot>
        <PlaybookButton id={(data || {}).id}></PlaybookButton>
    </>)
}