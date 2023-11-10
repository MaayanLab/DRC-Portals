import Image from "next/image"
import Paper from '@mui/material/Paper'
import ClientCarousel from "./ClientCarousel"

export default function ServerCarousel () {
    const items = [
        {
            name: "Playbook Workflow",
            description: "Playbook Partnership",
            icon: "/img/Playbook_Gray.png"
        },
        {
            name: "Reprotox KG",
            description: "Toxicology Partnership",
            icon: "/img/Reprotox_Gray.png"
        }
      ]
      
      
    const children = items.map( (item, i) => (
        <Paper key={i} sx={{height: 400, width:400}}>
        <Image src={item.icon} alt={item.name} width={400} height={400}/>
        </Paper>
    ))

    return <ClientCarousel>{children}</ClientCarousel>

}


