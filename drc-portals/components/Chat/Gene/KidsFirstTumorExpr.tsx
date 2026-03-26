import useSWR from 'swr';
import TableViewCol from '../vis/tableViewCol';
import PlaybookButton from '../playbookButton';
import { Container, Typography } from '@mui/material';

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

    if (props.id === undefined) {
        return <>Error</>
    }
    const data = {data: props.output, id: props.id}

    const tableData = data.data[1].process.output.value;

    return (
        <Container maxWidth="lg">
            <Typography variant={"h3"}>Pediatric Tumors Associated With {gene}</Typography>
            <TableViewCol rowData={tableData}/>
            <PlaybookButton id={data.id}></PlaybookButton>
        </Container>)
}