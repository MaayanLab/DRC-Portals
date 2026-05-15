'use client'

import useSWR from 'swr';

// Construct a workflow Gene => ARCHS4 Tissue => Barplot with the input: ACE2
import PlotlyPlot from "@/components/Chat/vis/plotly";
import PlaybookButton from '../playbookButton';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
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
    if (props.id === undefined) {
        return <>Error</>
    }
    const data = {data: props.output, id: props.id}
    const plotData = (data || {}).data[2].process.output.value;
    const table_value = (data || {}).data[1].process.output.value
    const sorted = table_value.filter((a:any)=>a.zscore !== null).sort((a:any,b:any)=>(b.zscore-a.zscore))
    plotData.data[0].x = sorted.map((a:any)=>a.term)   
    plotData.data[0].y = sorted.map((a:any)=>a.zscore)
    // plotData.data[0].x.push(plotData.data[0].x[sorted.length - 1])
    // plotData.data[0].y.push(plotData.data[0].y[sorted.length - 1])
    plotData.layout.title = `${gene} ARCHS4 Gene Expression Z-Scores`
    plotData.layout.autosize = true
    plotData.layout.margin = {
      pad: 4
    }
    plotData.layout.plot_bgcolor = "transparent"
    plotData.layout.paper_bgcolor = "transparent"
    // plotData.layout.font = {
    //   color: "white"
    // }
    plotData.layout.xaxis["dtick"] = 1
    plotData.layout.xaxis["tickfont"] = {size: 8}
    // plotData.layout.xaxis["automargin"] = true
    // plotData.layout.xaxis['range']= [0, sorted.length ]
    return (
    <Container maxWidth="lg">
        <Typography variant={"h3"}>Expression of {gene} on ARCHS4 Tissues</Typography>
        <PlotlyPlot props={plotData}></PlotlyPlot>
        <PlaybookButton id={(data || {}).id}></PlaybookButton>
    </Container>)
}