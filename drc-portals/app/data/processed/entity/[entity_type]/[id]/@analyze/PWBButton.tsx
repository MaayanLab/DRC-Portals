'use client'

import Button from "@mui/material/Button"
import Image from "next/image"
import PWBIcon from '@/public/img/icons/playbook-workflow-builder.png'
import CardButton from "./CardButton"

export default function PWBButton(props: React.PropsWithChildren<{ title: React.ReactNode, description: React.ReactNode, body: any }>) {
  return <CardButton
    icon={<Image src={PWBIcon} alt="Playbook Workflow Builder" height={64} />}
    title={props.title}
    description={props.description}
  >
    <Button
      color="secondary"
      size="small"
      onClick={async () => {
        const req = await fetch('https://playbook-workflow-builder.cloud/api/db/fpl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(props.body),
        })
        const res = await req.json()
        window.open(`https://playbook-workflow-builder.cloud/graph/${res}`, '_blank')
      }}
    >Submit</Button>
  </CardButton>
}
