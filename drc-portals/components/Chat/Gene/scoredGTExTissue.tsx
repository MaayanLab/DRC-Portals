import useSWR from 'swr';

// Construct a workflow Gene => GTEx Tissue => Barplot with the input: ACE2
import PlotlyPlot from "@/components/Chat/vis/plotly";

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
    const gene: string = props.genesymbol || 'ACE2'
    
    const body = {
        workflow: [
        { id: '1', type: 'Input[Gene]', data: { type: 'Term[Gene]', value: gene } },
        { id: '2', type: 'GTExTissueExpressionFromGene', inputs: { gene: { id: '1' } } },
        { id: '3', type: 'BarplotFrom[Scored[Tissue]]', inputs: { terms: { id: '2' } } },
        ],
        metadata: {
        title: 'GTEx Tissue Expression Barplot',
        },
    }
    const {data, isLoading, error} = useSWR([body], () => getPlaybookGTExPlotData(body));
    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <>{isLoading}</>
    }

    const plotData = data[2].process.output.value;
    plotData.layout.title = `${gene} GTEx Gene Expression Z-Scores`
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
    </>)
}