import Link from "@/utils/link";
import { Stack, Tooltip} from "@mui/material";
import { Publication } from "@prisma/client";
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export function addPeriodIfNeeded(text: string | undefined) {
    return text && !text.endsWith(".") ? "." : "";
}
export default function SimplePublicationComponent({publications, variant='caption', podcast=false}: {publications: Publication[], variant?:'caption'|'subtitle2', podcast?:boolean}) {
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
                            {pub.authors.split(",")[0]} et al. | {pub.journal} | Published: {pub.year}
                        </Typography>
                        {(podcast && pub.audio) && 
                            <Stack>
                            <CardMedia
                                    component="audio"
                                    controls
                                    src={pub.audio}
                                    sx={{ width: '100%', pt: 2, px: 2 }} 
                                />
                            <Typography sx={{color: "rgb(99,99,99)"}} variant={variant}>Listen to Axiom and Trinity as they discuss this paper</Typography>
                            </Stack>
                        }
                    </div>
                ))}
            </>
    )
}