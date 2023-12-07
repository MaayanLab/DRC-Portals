import Link from "next/link";
import { Typography, Chip } from "@mui/material";
import { Publication } from "@prisma/client";

export default function PublicationComponent({publications, chipped=false}: {publications: Publication[], chipped?:Boolean}) {
    return (
        <>
            {publications.map((pub, i)=>(
                <div key={i} className="mb-2 space-x-1">
                    { chipped ? 
                        <>
                            <Typography color="secondary" variant="caption">
                                {pub.authors}. {pub.year}. <b>{pub.title}{!pub.title.endsWith(".") && "."}</b> {pub.journal}. {pub.volume}. {pub.page}
                            </Typography>
                            <div className="flex space-x-2">
                            { pub.pmid && 
                                <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}>
                                <Chip color="secondary" variant="outlined" label={"PubMed"} sx={{minWidth: 100}}/>
                                </Link>
                            }
                            { pub.pmcid && 
                                <Link target="_blank" rel="noopener noreferrer" href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pub.pmcid}/`}>
                                <Chip color="secondary" variant="outlined"  label={"PMC"} sx={{minWidth: 100}}/>
                                </Link>
                            }
                            { pub.doi && 
                                <Link target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${pub.doi}`}>
                                <Chip color="secondary" variant="outlined" label={"DOI"} sx={{minWidth: 100}}/>
                                </Link>
                            }
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
                ))}
            </>
    )
}