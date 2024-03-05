import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';
import PlaybookButton from '../playbookButton';

const getPlaybookKidsFirstData = async (body: any) => {

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

export default function KidsFirstTumorExpr(props: any) {
    const gene: string = props.geneSymbol || 'ACE2'

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
                "id": "2b24d6a3-492d-23d3-d69d-d28b5943ab87",
                "type": "KFTumorExpressionFromGene",
                "inputs": {
                    "gene": {
                        "id": "83efe773-027b-4f21-688d-b27555938a04"
                    }
                }
            }
        ]
    }

    const { data, isLoading, error } = useSWR([body], () => getPlaybookKidsFirstData(body));
    console.log(data)

    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <>{isLoading}</>
    }

    const tableData = data.data[1].process.output.value;

    return (
        <>
            <TableViewCol rowData={tableData}/>
            <PlaybookButton id={data.id}></PlaybookButton>
        </>)
}