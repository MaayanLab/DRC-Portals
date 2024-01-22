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

    const body = {
        "data": {
            "80ca332c-4217-2216-055e-888b992453f4": {
                "type": "Input[glycan]",
                "value": glycan
            }
        },
        "workflow": [
            {
                "id": "c8e46e25-17f7-b6d8-fd98-9447e7bc3542",
                "type": "Input[glycan]",
                "data": {
                    "id": "80ca332c-4217-2216-055e-888b992453f4"
                }
            },
            {
                "id": "f5412429-c51f-5cbc-2201-ceaf153d1afd",
                "type": "GlycanInformation",
                "inputs": {
                    "glycan": {
                        "id": "c8e46e25-17f7-b6d8-fd98-9447e7bc3542"
                    }
                }
            }
        ]
    }

    const { data, isLoading, error } = useSWR([body], () => getPlaybookGlycanInfo(body));

    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <>{isLoading}</>
    }

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