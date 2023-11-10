import Image from "next/image"
import Typography from "@mui/material/Typography"
import Paper from '@mui/material/Paper'
import ClientCarousel from "./ClientCarousel"
import Link from "next/link"

export default function ServerCarousel () {
    const items = [
        {
            name: "Playbook Workflow",
            description: "CFDE Playbook Partnership",
            icon: "/img/Playbook_Gray.png",
            url: "https://playbook-workflow-builder.cloud/graph/extend"
        },
        {
            name: "Reprotox KG",
            description: "CFDE Toxicology Partnership",
            icon: "/img/Reprotox_Gray.png",
            url: "https://maayanlab.cloud/reprotox-kg"
        }
      ]
      
      
    const children = items.map( (item, i) => (
        <Paper key={i} sx={{height: 500, width:400, textAlign: "center"}}>
            <Link href={item.url}>
                <Typography variant="subtitle2">{item.name}</Typography>
                <Image src={item.icon} alt={item.name} width={400} height={400}/>
            </Link>
        </Paper>
    ))

    return <ClientCarousel>{children}</ClientCarousel>

}


