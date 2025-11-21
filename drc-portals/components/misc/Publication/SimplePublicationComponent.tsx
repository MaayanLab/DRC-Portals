import Link from "@/utils/link";
import { Typography, Button, Divider, Chip, Tooltip } from "@mui/material";
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
                        <Tooltip title={pub.title}>
                            <Link target="_blank" rel="noopener noreferrer" href={pub.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`: `https://doi.org/${pub.doi}`}>
                                <Typography color="secondary" variant={variant} sx={{overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "fit-content", display: "block"}}>
                                    <b>{pub.title}</b>
                                </Typography>
                            </Link>
                        </Tooltip>
                        <Typography variant={variant} sx={{color: "rgb(99,99,99)"}}>
                            {pub.authors.split(",")[0]} | {pub.journal} | Published: {pub.year}
                        </Typography>
                    </div>
                ))}
            </>
    )
}