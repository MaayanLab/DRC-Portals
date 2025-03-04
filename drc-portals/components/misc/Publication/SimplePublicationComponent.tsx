import Link from "@/utils/link";
import { Typography, Button, Divider, Chip } from "@mui/material";
import { Publication } from "@prisma/client";
import ExportCitation from "./ExportCitation";

export default function SimplePublicationComponent({publications}: {publications: Publication[]}) {
    function addPeriodIfNeeded(text: string | undefined) {
        return text && !text.endsWith(".") ? "." : "";
       }
    return (
        <>
            {publications.map((pub, i)=>(
                    <div key={i} className="mb-5 space-x-1">
                        <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}>
                            <Typography color="secondary" variant="caption">
                                {pub.authors}. {pub.year}. <b>{pub.title}{addPeriodIfNeeded(pub.title)}</b> {pub.journal}. {pub.volume}. {pub.page}
                            </Typography>
                        </Link>
                    </div>
                ))}
            </>
    )
}