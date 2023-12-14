import Link from "next/link";
import { Typography, Button, Divider, Chip } from "@mui/material";
import { Prisma } from "@prisma/client";
import ExportCitation from "./ExportCitation";

type PublicationWithDCC = Prisma.PublicationGetPayload<{
    include: {
        dccs: {
          include: {
            dcc: true
          }
        }
    }
  }>
export default function PublicationComponent({publications}: {publications: PublicationWithDCC[]}) {
    return (
        <>
            {publications.map((pub, i)=>(
                <>
                    <div key={i} className="mb-2 space-x-1">
                        <>
                            <Typography color="secondary" variant="caption">
                                {pub.authors}. {pub.year}. <b>{pub.title}{!pub.title.endsWith(".") && "."}</b> {pub.journal}. {pub.volume}. {pub.page}
                            </Typography>
                            <div className="flex space-x-1 items-center justify-end">
                                { pub.pmid && 
                                    <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}>
                                        <Button color="secondary">PubMed</Button>
                                    </Link>
                                }
                                { pub.pmcid && 
                                    <Link target="_blank" rel="noopener noreferrer" href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pub.pmcid}/`}>
                                        <Button color="secondary">PMC</Button>
                                    </Link>
                                }
                                { pub.doi && 
                                    <Link target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${pub.doi}`}>
                                        <Button color="secondary">DOI</Button>
                                    </Link>
                                }
                                { pub.pmcid && 
                                    <ExportCitation pmcid={`${pub.pmcid}`}/>
                                }
                                { pub.landmark && 
                                    <Chip label={"Landmark"} color="primary" sx={{borderRadius: 2, paddingLeft: 0, paddingRight: 0}}/>
                                }
                                {   (pub.dccs).map(({dcc})=>(
                                        <Chip key={dcc.short_label} label={dcc.short_label} color="primary" sx={{borderRadius: 2, paddingLeft: 0, paddingRight: 0}}/>
                                    ))
                                }
                            </div>
                        </>
                    </div>
                    <Divider/>
                </>
                ))}
            </>
    )
}