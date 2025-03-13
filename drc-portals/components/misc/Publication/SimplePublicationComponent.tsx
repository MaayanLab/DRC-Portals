import Link from "@/utils/link";
import { Typography, Button, Divider, Chip } from "@mui/material";
import { Publication } from "@prisma/client";
import ExportCitation from "./ExportCitation";

export function addPeriodIfNeeded(text: string | undefined) {
    return text && !text.endsWith(".") ? "." : "";
}
export default function SimplePublicationComponent({publications, variant='caption'}: {publications: Publication[], variant?:'caption'|'subtitle2'}) {
    
    return (
        <>
            {publications.map((pub, i)=>(
                    <div key={i} className="mb-5 space-x-1">
                        <Link target="_blank" rel="noopener noreferrer" href={pub.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`: `https://${pub.doi}`}>
                            <Typography color="secondary" variant={variant}>
                                {pub.authors}. {pub.year}. <b>{pub.title}{addPeriodIfNeeded(pub.title)}</b> {pub.journal}. {pub.volume}{pub.volume!==null && '.'} {pub.page}
                            </Typography>
                        </Link>
                    </div>
                ))}
            </>
    )
}