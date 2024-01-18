import useSWR from 'swr';
import TableView from "@/components/Chat/vis/tableView";
import PlaybookButton from '../playbookButton';

const getPlaybookRegElementInfo = async (body: any) => {

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

export default function RegElementSetInfo(props: any) {
    const gene: string = props.genesymbol || 'ACE2'

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
                "id": "e6ed0549-fd80-0766-7e31-6193a5f16ecb",
                "type": "GetRegulatoryElementsForGeneInfoFromGene",
                "inputs": {
                    "gene": {
                        "id": "83efe773-027b-4f21-688d-b27555938a04"
                    }
                }
            },
            {
                "id": "bf5c1482-67e0-e8c9-be8a-84ff8941ace1",
                "type": "RegElementSetInfoFromRegElementTerm",
                "inputs": {
                    "regulatoryElementSet": {
                        "id": "e6ed0549-fd80-0766-7e31-6193a5f16ecb"
                    }
                }
            }
        ]
    }
    const { data, isLoading, error } = useSWR([body], () => getPlaybookRegElementInfo(body));

    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <>{isLoading}</>
    }

    const tableData = data.data[2].process.output.value;
    const formattedTableData:  {
        ID: string[];
        chromosome: string[];
        start: number[];
        end: number[];
    } = {ID: [], chromosome: [], start: [], end: []}

    try {


    tableData.forEach((elt: any) => {
        formattedTableData.ID.push(elt.ldhId)
        formattedTableData.chromosome.push(elt.entContent.coordinates.chromosome)
        formattedTableData.start.push(elt.entContent.coordinates.start)
        formattedTableData.end.push(elt.entContent.coordinates.end)
    });
    return (
        <>
            <TableView rowData={formattedTableData}></TableView>
            <PlaybookButton id={data.id}></PlaybookButton>
        </>)
    } catch {
        return (
            <>
                <TableView rowData={{}}></TableView>
                <PlaybookButton id={data.id}></PlaybookButton>
            </>)
    }
}