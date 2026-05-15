'use client'
import useSWR from 'swr';

// Construct a workflow Gene => GTEx Tissue => Barplot with the input: ACE2
import PlotlyPlot from "@/components/Chat/vis/plotly";
import PlaybookButton from '../playbookButton';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
const getPlaybookGTExPlotData = async (body: any) => {

    const options: any = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)

    }
    const res = await fetch(`/chat/fetchPlaybook`, options)
    const data = await res.json()
    return data
};

export default function ScoredGTExTissue(props: any) {
    const gene: string = props.geneSymbol || 'ACE2'
    if (props.id === undefined) {
        return <>Error</>
    }
    const data = {data: props.output, id: props.id}
    

    const plotData = data.data[2].process.output.value;
    const table_value = (data || {}).data[1].process.output.value
    const sorted = table_value.sort((a:any,b:any)=>(b.zscore-a.zscore))
    plotData.data[0].x = sorted.map((a:any)=>a.term)
    plotData.data[0].y = sorted.map((a:any)=>a.zscore)
    
    plotData.layout.title = `${gene} GTEx Gene Expression Z-Scores`
    plotData.layout.autosize = true
    plotData.layout.margin = {
      pad: 4
    }
    plotData.layout.plot_bgcolor = "transparent"
    plotData.layout.paper_bgcolor = "transparent"
    // plotData.layout.font = {
    //   color: "white"
    // }

    return (
    <Container maxWidth="lg">
        <Typography variant={"h3"}>Expression of {gene} on GTEx Tissues</Typography>
        <PlotlyPlot props={plotData}></PlotlyPlot>
        <PlaybookButton id={data.id}></PlaybookButton>
    </Container>)
}