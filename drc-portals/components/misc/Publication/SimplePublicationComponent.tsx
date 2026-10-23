import dynamic from "next/dynamic";
import { Stack, Tooltip} from "@mui/material";
import { Publication } from "@prisma/client";
import Typography from '@mui/material/Typography';
const AudioCard = dynamic(()=>import('./AudioCard'))
const Link = dynamic(()=>import('@/utils/link'))
export function addPeriodIfNeeded(text: string | undefined) {
    return text && !text.endsWith(".") ? "." : "";
}
export default function SimplePublicationComponent({publications, variant='caption', podcast=false}: {publications: Publication[], variant?:'caption'|'subtitle2', podcast?:boolean}) {
    return (
        <>
            {publications.map((pub, i)=>(
                    <div key={i} className="mb-5 space-x-1">
                        <Stack direction="row" spacing={1}>
                            {(podcast && pub.audio) &&
                                <Tooltip title={'Listen to an engaging AI-generated podcast about this publication.'}>
                                    <AudioCard audio={pub.audio} img={'/img/axiom_podcast.jpeg'}/>
                                </Tooltip>
                            }
                            <Stack>
                                <Tooltip title={pub.title}>
                                    <Link target="_blank" rel="noopener noreferrer" href={pub.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`: `https://doi.org/${pub.doi}`}>
                                        <Typography color="secondary" variant={variant} sx={{overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "fit-content", display: "block"}}>
                                            <b>{pub.title}</b>
                                        </Typography>
                                    </Link>
                                </Tooltip>
                                <Typography color="secondary" variant={variant} sx={{color: "rgb(99,99,99)"}}>
                                    {pub.authors.split(",")[0]} et al. | {pub.journal} | Published: {pub.year}
                                </Typography>
                            </Stack>
                        </Stack>
                        
                        
                    </div>
                ))}
            </>
    )
}