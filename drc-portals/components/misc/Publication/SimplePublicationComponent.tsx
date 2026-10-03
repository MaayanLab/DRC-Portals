import Link from "@/utils/link";
import { Card, CardActions, CardContent, Grid, Tooltip} from "@mui/material";
import { Publication } from "@prisma/client";
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Image from "@/utils/image";
import { grey } from "@mui/material/colors";
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
                            <Card sx={{width: 350}}>
                                <CardContent>
                                    <Grid container spacing={1}>
                                        <Grid item xs={7}>
                                            <Typography variant={'body1'}>Listen to an engaging AI-generated podcast about this publication.</Typography>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Image src="/img/axiom.png" alt="axiom" width={150} height={150}/>
                                        </Grid>
                                    </Grid>
                                    
                                </CardContent>
                                <CardActions>
                                    <CardMedia
                                        component="audio"
                                        controls
                                        src={pub.audio}
                                        sx={{ width: '100%', 
                                            '&::-webkit-media-controls-panel': {
                                                backgroundColor: grey[100],
                                            },
                                        }} 
                                    />
                                </CardActions>
                            </Card> 
                        }
                    </div>
                ))}
            </>
    )
}