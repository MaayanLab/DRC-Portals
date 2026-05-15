import useSWR from 'swr';
import PlaybookButton from '../playbookButton';
import TableView from '../vis/tableView';
import TableViewCol from '../vis/tableViewCol';

const getPlaybookInfo = async (body: any) => {

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

export default function PhenotypeSmallMolecules(props: any) {
    const phenotype: string = props.phenotype || 'Autophagy'

    if (props.id === undefined) {
        return <>Error</>
    }
    const data = {data: props.output, id: props.id}


    try {
        const tableData = data.data[18].process.output.value;
        return (
            <>
                <TableViewCol rowData={tableData} />
                <PlaybookButton id={data.id}></PlaybookButton>
            </>
        )
    } catch (error) {
        return (
            <>No small molecules found for {phenotype}
                <PlaybookButton id={data.id}></PlaybookButton>
            </>
        )
    }
}