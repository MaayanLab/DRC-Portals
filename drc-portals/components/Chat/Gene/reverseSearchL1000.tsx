import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { PlotParams } from 'react-plotly.js';
import TableView from '@/components/Chat/vis/tableView';
import PlaybookButton from '../playbookButton';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div>Loading...</div> })

const getPlaybookL1000= async (body: any) => {

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


const getL100Sigs = async (gene: string, dir: string, perturb: string) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            gene: gene,
            dir: dir,
            perturb: perturb
        })
    }

    const res = await fetch(`/chat/l1000sigs`, options)
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    return data
};

export default function ReverseSearchL1000(props: any) {
    const gene = props.geneSymbol
    const dir = props.dir
    const perturb = props.perturb

    const dirup = "up"
    const dirdown = "down"
    const upres = useSWR([gene, dirup, perturb], () => getL100Sigs(gene, dirup, perturb));
    const downres = useSWR([gene, dirdown, perturb], () => getL100Sigs(gene, dirdown, perturb));

    const body = {
        "data": {
            "12c02bd3-f2ec-c719-533f-b1bb3b0170b7": {
                "type": "Input[Gene]",
                "value": gene
            }
        },
        "workflow": [
            {
                "id": "83efe773-027b-4f21-688d-b27555938a04",
                "type": "Input[Gene]",
                "data": {
                    "id": "12c02bd3-f2ec-c719-533f-b1bb3b0170b7"
                }
            },
            {
                "id": "ee9c0c69-347e-8eec-ea68-d2eb0e7925cd",
                "type": "LINCSL1000ReverseSearch",
                "inputs": {
                    "gene": {
                        "id": "83efe773-027b-4f21-688d-b27555938a04"
                    }
                }
            }
        ]
    }
    const {data, isLoading, error} = useSWR([body], () => getPlaybookL1000(body));


    if (!gene && !dir) {
        return <>No data provided</>
    }

    const layout: PlotParams['layout'] = {
        title: `${gene} Scatter Plot`,
        autosize: true,
        margin: {
            pad: 4
        },
        xaxis: { title: 'Abs(CD-Coefficeint)', automargin: true },
        yaxis: { title: 'Log2(Fold Change)', automargin: true },
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        font: {
            color: "white",

        }
    };

    if (dir == "both") {

        if (upres.error || downres.error) {
            return <div>Error retrieving data.</div>
        }

        if (upres.isLoading || downres.isLoading) {
            return <div>Loading..</div>
        }
        const dataUp = upres.data
        const dataDown = downres.data

        const perturbagenNamesUp = Object.keys(dataUp['CD Coefficient'])
        const perturbagenNamesDown = Object.keys(dataDown['CD Coefficient'])
        const columnNames = Object.keys(dataUp)

        const coefficentsUp = perturbagenNamesUp.map((perturbagenName) => (Math.abs(dataUp['CD Coefficient'][perturbagenName])))
        const lfcUp = perturbagenNamesUp.map((perturbagenName) => (dataUp['Log2(Fold Change)'][perturbagenName]))

        const coefficentsDown = perturbagenNamesDown.map((perturbagenName) => (Math.abs(dataDown['CD Coefficient'][perturbagenName])))
        const lfcDown = perturbagenNamesDown.map((perturbagenName) => (dataDown['Log2(Fold Change)'][perturbagenName]))

        const scatterPlotData: PlotParams['data'] = [{
            x: lfcUp,
            y: coefficentsUp,
            text: perturbagenNamesUp,
            mode: 'markers',
            type: 'scatter',
            marker: { color: "red" },
            name: `${perturb} up`

        },
        {
            x: lfcDown,
            y: coefficentsDown,
            text: perturbagenNamesDown,
            mode: 'markers',
            type: 'scatter',
            marker: { color: "lightblue" },
            name: `${perturb} down`
        }]

        const rowData: any = {}

        columnNames.map((cn: any) => {
            rowData[cn] = { ...dataUp[cn], ...dataDown[cn] }
            return
        })

        return (
            <div>
                <div className='text-center'>
                    <Plot
                        data={scatterPlotData}
                        layout={layout}
                    />
                </div>
                <TableView rowData={rowData} />
                {data.id ? <PlaybookButton id={data.id}></PlaybookButton> : <></>}
            </div>
        )

    } else {
        var res: any;
        if (dir == 'up') {
            res = upres
        } else {
            res = downres
        }

        if (res.error) {
            return <div>Error retrieving data.</div>
        }

        if (res.isLoading) {
            return <div>Loading..</div>
        }

        const perturbagenNames = Object.keys(res.data['CD Coefficient'])

        const coefficents = perturbagenNames.map((perturbagenName) => (Math.abs(res.data['CD Coefficient'][perturbagenName])))
        const lfc = perturbagenNames.map((perturbagenName) => (res.data['Log2(Fold Change)'][perturbagenName]))
        var color: string
        if (dir == "up") {
            color = "red"
        } else {
            color = "lightblue"
        }

        const scatterPlotData: PlotParams['data'] = [{
            x: coefficents,
            y: lfc,
            text: perturbagenNames,
            mode: 'markers',
            type: 'scatter',
            marker: { color: color }
        }]

        console.log(data)

        return (
            <div>
                <div className='text-center'>
                    <Plot
                        data={scatterPlotData}
                        layout={layout}
                    />
                </div>
                <TableView rowData={res.data} />
                {data.id ? <PlaybookButton id={data.id}></PlaybookButton> : <></>}
            </div>
        )
    }
}



