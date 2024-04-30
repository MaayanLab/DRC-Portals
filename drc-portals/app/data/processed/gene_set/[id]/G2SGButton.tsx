'use client'

import Button from "@mui/material/Button"
import Image from "next/image"
import G2SGIcon from '@/public/img/icons/g2sg-logo.png'
import CardButton from "./CardButton"

export default function G2SGButton(props: React.PropsWithChildren<{ title: React.ReactNode, description: React.ReactNode, body: any }>) {
    return <CardButton
        icon={<Image src={G2SGIcon} alt="Get-Gene-Set-Go" height={64} />}
        title={props.title}
        description={props.description}
    >
        <Button
            color="secondary"
            size="small"
            onClick={async () => {
                const req = await fetch('https://g2sg.cfde.cloud/api/addGeneset', {
                    // mode: 'cors',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(props.body),
                })
                const { session_id } = await req.json()
                window.open(`https://g2sg.cfde.cloud/analyze/${session_id}`, '_blank')
            }}
        >Submit</Button>
    </CardButton>
}


// export async function GET(request: Request, { params }: { params: { id: string } }) {
//     const geneSet = await getItem(params.id)
//     if (!geneSet.data.geneSet) return new Response(JSON.stringify({error: 'Not Found'}), { status: 404 })
//     const req = await fetch('https://g2sg.cfde.cloud/api/addGeneset', {
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//       },
//       method: 'POST',
//       body: JSON.stringify({
//         term: geneSet.data.geneSet.term,
//         genes: geneSet.data.geneSet.genes.nodes.map(gene => gene.symbol),
//         description: `Rummagene ${geneSet.data.geneSet.description}`,
//       }),
//     })
//     const { session_id } = await req.json()
//     if (!session_id) return new Response(JSON.stringify({error: 'Failed to Register Gene Set'}), { status: 500 })
//     redirect(`https://g2sg.cfde.cloud/analyze/${session_id}`)
//   }