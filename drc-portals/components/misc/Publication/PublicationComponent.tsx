import Link from "next/link";
import { Typography, Button, Divider } from "@mui/material";
import { Publication } from "@prisma/client";
export default function PublicationComponent({publications, chipped=false}: {publications: Publication[], chipped?:Boolean}) {
    return (
        <>
            {publications.map((pub, i)=>(
                <>
                    <div key={i} className="mb-2 space-x-1">
                        { chipped ? 
                            <>
                                <Typography color="secondary" variant="caption">
                                    {pub.authors}. {pub.year}. <b>{pub.title}{!pub.title.endsWith(".") && "."}</b> {pub.journal}. {pub.volume}. {pub.page}
                                </Typography>
                                <div className="flex space-x-2 justify-end">
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
                                {/* { pub.pmcid && 
                                    <ExportCitation pmc={`${pub.pmcid}`}/>
                                } */}
                                </div>
                            </>
                        :
                        <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}>
                            <Typography color="secondary" variant="caption">
                                {pub.authors}. {pub.year}. <b>{pub.title}{!pub.title.endsWith(".") && "."}</b> {pub.journal}. {pub.volume}. {pub.page}
                            </Typography>
                        </Link>
                        }
                    </div>
                    {chipped && <Divider/>}
                </>
                ))}
            </>
    )
}