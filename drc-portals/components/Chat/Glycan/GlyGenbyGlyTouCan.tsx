import useSWR from 'swr';
import PlaybookButton from '../playbookButton';
import GlyGenVis from '../vis/glyGen/glyGenVis';

const getPlaybookGlycanInfo = async (body: any) => {

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

export default function GlyGenbyGlyTouCan(props: any) {
    const glycan: string = props.glycan || 'G17689DH'

    if (props.id === undefined) {
        return <>Error</>
    }
    const data = {data: props.output, id: props.id}


    const tableData = data.data[1].process.output.value;
    try {
        return (
            <>
                <GlyGenVis data={tableData} />
                <PlaybookButton id={data.id}></PlaybookButton>
            </>
        )
    } catch (error) {
        return (
            <>No data found for {glycan}
                <PlaybookButton id={data.id}></PlaybookButton>
            </>
        )
    }
}