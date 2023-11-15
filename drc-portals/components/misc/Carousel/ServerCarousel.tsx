import Image from "next/image"
import Typography from "@mui/material/Typography"
import Paper from '@mui/material/Paper'
import ClientCarousel from "./ClientCarousel"
import Link from "next/link"

export default function ServerCarousel () {
    const items = [
        {
            name: "Playbook Workflow Builder",
            description: "CFDE Playbook Partnership",
            icon: "/img/Playbook_Gray.png",
            url: "https://playbook-workflow-builder.cloud/graph/extend"
        },
        {
            name: "Reproductive Toxicity Knowledge Graph (ReproTox-KG)",
            description: "CFDE Toxicology Partnership",
            icon: "/img/Reprotox_Gray.png",
            url: "https://maayanlab.cloud/reprotox-kg"
        },
        {
            name: "Standardized RNA-seq Pipeline for Patient Samples",
            description: "Standardized RNA-seq Pipeline for Patient Samples",
            icon: "/img/rna-seq_pipeline_Gray.png",
            url: "https://commonfund.nih.gov/dataecosystem/highlights/building-healthier-ecosystem-cfde-expands-new-data-coordinating-centers"
        },
        {
            name: "Data Distillery Partnership",
            description: "Data Distillery Partnership",
            icon: "/img/DD_Gray.png",
            url: "https://ubkg.docs.xconsortia.org/"
        }
      ]
      
      
    const children = items.map( (item, i) => (
        <div key={i} style={{minHeight: 420, textAlign: "center"}}>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
                <Typography variant="subtitle2">{item.name}</Typography>
                <Image src={item.icon} alt={item.name} width={400} height={400}/>
            </Link>
        </div>
    ))

    return <ClientCarousel>{children}</ClientCarousel>

}


