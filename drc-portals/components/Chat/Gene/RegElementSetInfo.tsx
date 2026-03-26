import useSWR from 'swr';
import TableView from "@/components/Chat/vis/tableView";
import PlaybookButton from '../playbookButton';
import { Typography } from '@mui/material';
import { Container } from '@mui/material';

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
    const gene: string = props.geneSymbol || 'ACE2'

    if (props.id === undefined) {
        return <>Error</>
    }
    const data = {data: props.output, id: props.id}

    const tableData = data.data[2].process.output.value;
    console.log(tableData)
    const formattedTableData:  {
        ID: string[];
        chromosome: string[];
        start: number[];
        end: number[];
    } = {ID: [], chromosome: [], start: [], end: []}

    try {


    tableData.forEach((elt: any) => {
        formattedTableData.ID.push(elt.entId)
        formattedTableData.chromosome.push(elt.coordinates.chromosome)
        formattedTableData.start.push(elt.coordinates.start)
        formattedTableData.end.push(elt.coordinates.end)
    });
    return (
        <Container maxWidth="lg">
            <Typography variant={"h3"}>Regulatory Elements in the Vicinity of {gene}</Typography>
            <TableView rowData={formattedTableData}></TableView>
            <PlaybookButton id={data.id}></PlaybookButton>
        </Container>)
    } catch {
        return (
            <Container maxWidth="lg">
                <TableView rowData={{}}></TableView>
                <br></br>
                <PlaybookButton id={data.id}></PlaybookButton>
            </Container>)
    }
}