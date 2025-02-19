import Image from "@/utils/image"
import Typography from "@mui/material/Typography"
import Box from '@mui/material/Box'
import ClientCarousel from "./ClientCarousel"
import Link from "@/utils/link"
import prisma from "@/lib/prisma"
import ReactMarkdown from 'react-markdown'
import remarkGfm from "remark-gfm"

const SmartLink = ({href, children}: {href: string, children: React.ReactNode}) => {
  if (href.startsWith("http")) {
    return <Link href={href} target="_blank" rel="noopener noreferrer">{children}</Link>
  } else return <Link href={href}>{children}</Link>
}

export default async function ServerCarousel () {
    const now = new Date()
    const outreach = await prisma.outreach.findMany({
        where: {
          active: true,
          carousel: true,
          title: {
            not: "CFDE Centers"
          },
          AND: [
            // date filters
            {
              OR: [
                {
                  end_date: {
                    gte: now
                  }
                },
                {
                  end_date: null,
                  start_date: {
                    gte: now
                  }
                },
                {
                  application_start: {
                    gte: now
                  },
                  end_date: null,
                  start_date: null,
                },
              ]
            },
          ]
        },
        orderBy: {
          start_date: { sort: 'asc', nulls: 'first' },
        }
      })
    const outreach_items = outreach.map(o=>({
        name: o.title,
        description: o.carousel_description || o.short_description,
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
            description: "Learn how to construct workflows that span multiple Common Fund Programs dynamically with the **Playbook Workflow Builder**",
            icon: "/img/Playbook.png",
            url: "https://playbook-workflow-builder.cloud/graph/extend"
        },
        {
          name: "GeneSetCart",
          description: "You can now assemble, combine, analyze, and visualize all your gene sets in one place with the CFDE platform **Gene-Set-Cart**",
          url: "https://genesetcart.cfde.cloud/",
          icon: "https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/GeneSetCart-tutorial.png"
        },
        {
          name: "CFDE-GSE",
          description: "Query your gene sets against 10 gene set libraries created from 8 Common Fund programs with **CFDE-GSE**",
          icon: "https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/GSE-screenshot.png",
          url: "https://gse.cfde.cloud/"
        },
        // {
        //     name: "Reproductive Toxicity Knowledge Graph (ReproTox-KG)",
        //     description: "CFDE Toxicology Partnership",
        //     icon: "/img/Reprotox.png",
        //     url: "https://maayanlab.cloud/reprotox-kg"
        // },
        // {
        //     name: "Standardized RNA-seq Pipeline for Patient Samples",
        //     description: "Standardized RNA-seq Pipeline for Patient Samples",
        //     icon: "/img/rna-seq_pipeline.png",
        //     url: "https://commonfund.nih.gov/dataecosystem/highlights/building-healthier-ecosystem-cfde-expands-new-data-coordinating-centers"
        // },
        // {
        //     name: "Data Distillery Partnership",
        //     description: "Data Distillery Partnership",
        //     icon: "/img/DD.png",
        //     url: "https://ubkg.docs.xconsortia.org/"
        // },
        // {
        //     name: "CFDE Cross Cut Metadata Model (C2M2)",
        //     description: "CFDE Cross Cut Metadata Model (C2M2)",
        //     icon: "/img/C2M2.png",
        //     url: "https://pubmed.ncbi.nlm.nih.gov/36409836/"
        // }
      ]
    const center = [
      {
        name: 'CFDE Centers',
        description: 'Explore the five newly established **CFDE centers**: Data, Knowledge, Cloud, Training, and Admin centers',
        icon: 'https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/cfde-centers.png',
        url: '/info/centers'
      }
    ]
    const children = [...center, ...outreach_items, ...items, ...publication_items].map( (item, i) => (
        <div key={i}>
            <Box key={i} sx={{
                minHeight: {xs: 200, sm: 200, md: 300, lg: 450, xl: 450}, 
                width: {xs: 300, sm: 300, md: 450, lg: 790, xl: 790}, 
                textAlign: "center", 
                border: 1,
                borderRadius: 5,
                borderColor: "rgba(81, 123, 154, 0.5)", 
                padding: 2
            }}>
                <SmartLink href={item.url}>
                    <Box className="flex flex-col" sx={{
                            minHeight: {xs: 200, sm: 200, md: 300, lg: 450, xl: 450}, 
                            boxShadow: "none", 
                            background: "#FFF"
                        }}>
                        
                        <div><Typography variant="subtitle1" sx={{textTransform: "uppercase", marginBottom: 1, color: "#FFF", backgroundColor: "tertiary.main", pl: 4, pr: 4}}>
                          <ReactMarkdown 
                            skipHtml
                            remarkPlugins={[remarkGfm]}
                          >
                            {item.description || item.name}
                          </ReactMarkdown>
                          </Typography>
                        </div>
                        <div className="flex grow items-center justify-center relative">
                            <Image src={item.icon} alt={item.name} fill={true} style={{objectFit: "contain"}}/>
                        </div>
                    </Box>
                </SmartLink>
            </Box>
        </div>
    ))

    return <ClientCarousel title="">{children}</ClientCarousel>

}


