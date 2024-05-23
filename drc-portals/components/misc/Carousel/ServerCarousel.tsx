import Image from "next/image"
import Typography from "@mui/material/Typography"
import Box from '@mui/material/Box'
import ClientCarousel from "./ClientCarousel"
import Link from "next/link"
import prisma from "@/lib/prisma"
export default async function ServerCarousel () {
    const outreach = await prisma.outreach.findMany({
        where: {
          active: true,
          carousel: true
        },
        orderBy: {
          start_date: { sort: 'asc', nulls: 'last' },
        }
      })
    const outreach_items = outreach.map(o=>({
        name: o.title,
        description: o.short_description,
        icon: o.image || '',
        url: o.link || '',
    }))
    const publications = await prisma.publication.findMany({
        where: {
          carousel: true
        },
        orderBy: {
          year: { sort: 'desc', nulls: 'last' },
        }
      })
    
    const publication_items = publications.map(o=>({
        name: o.carousel_title || o.title,
        description: o.carousel_description,
        icon: o.image || '',
        url: o.carousel_link || `https://www.doi.org/${o.doi}` || '',
    }))
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
            icon: "/img/Reprotox.png",
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
        },
        {
            name: "CFDE Cross Cut Metadata Model (C2M2)",
            description: "CFDE Cross Cut Metadata Model (C2M2)",
            icon: "/img/C2M2.png",
            url: "https://pubmed.ncbi.nlm.nih.gov/36409836/"
        }
      ]
    
    
    const children = [...outreach_items, ...publication_items, ...items].map( (item, i) => (
        <div key={i}>
            <Box key={i} sx={{
                minHeight: {xs: 200, sm: 200, md: 300, lg: 300, xl: 300}, 
                width: {xs: 300, sm: 300, md: 450, lg: 600, xl: 600}, 
                textAlign: "center", 
                border: 1,
                borderRadius: 5,
                borderColor: "rgba(81, 123, 154, 0.5)", 
                padding: 2
            }}>
                <Link href={item.url} target="_blank" rel="noopener noreferrer">
                    <Box className="flex flex-col" sx={{
                            minHeight: {xs: 200, sm: 200, md: 300, lg: 300, xl: 300}, 
                            boxShadow: "none", 
                            background: "#FFF"
                        }}>
                        <div><Typography variant="subtitle2" color="secondary">{item.name}</Typography></div>
                        <div className="flex grow items-center justify-center relative">
                            <Image src={item.icon} alt={item.name} fill={true} style={{objectFit: "contain"}}/>
                        </div>
                    </Box>
                </Link>
            </Box>
        </div>
    ))

    return <ClientCarousel title="PRODUCTS, PARTNERSHIPS, & EVENTS">{children}</ClientCarousel>

}


