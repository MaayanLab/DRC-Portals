import Image from "next/image"
import Typography from "@mui/material/Typography"
import Box from '@mui/material/Box'
import ClientCarousel from "./ClientCarousel"
import Link from "next/link"

export default function ServerCarousel () {
    const items = [
        {
            name: "Playbook Workflow Builder",
            description: "CFDE Playbook Partnership",
            icon: "/img/Playbook.png",
            url: "https://playbook-workflow-builder.cloud/graph/extend"
        },
        {
            name: "Reproductive Toxicity Knowledge Graph (ReproTox-KG)",
            description: "CFDE Toxicology Partnership",
            icon: "/img/updated_assets/Reprotox.png",
            url: "https://maayanlab.cloud/reprotox-kg"
        },
        {
            name: "Standardized RNA-seq Pipeline for Patient Samples",
            description: "Standardized RNA-seq Pipeline for Patient Samples",
            icon: "/img/rna-seq_pipeline.png",
            url: "https://commonfund.nih.gov/dataecosystem/highlights/building-healthier-ecosystem-cfde-expands-new-data-coordinating-centers"
        },
        {
            name: "Data Distillery Partnership",
            description: "Data Distillery Partnership",
            icon: "/img/DD.png",
            url: "https://ubkg.docs.xconsortia.org/"
        }
      ]
      
      
    const children = items.map( (item, i) => (
        <Box key={i} sx={{
            minHeight: 300, 
            width: 640,
            textAlign: "center", 
            border: 1,
            borderRadius: 5,
            borderColor: "rgba(81, 123, 154, 0.5)", 
            padding: 2
        }}>
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
                <Box className="flex flex-col" sx={{minHeight: 300}}>
                    <div><Typography variant="subtitle2" color="secondary">{item.name}</Typography></div>
                    <div className="flex grow items-center justify-center relative">
                        <Image src={item.icon} alt={item.name} fill={true} style={{objectFit: "contain"}}/>
                    </div>
                </Box>
            </Link>
        </Box>
    ))

    return <ClientCarousel>{children}</ClientCarousel>

}


