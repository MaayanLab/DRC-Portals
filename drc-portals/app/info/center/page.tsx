import Link from "@/utils/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import {
    Typography,
    Grid,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Button,
    Box,
    Paper
} from '@mui/material';
import MasonryClient from "@/components/misc/MasonryClient";


export default async function CenterLanding() {
    const centerOrder = [
        'The Data Resource Center',
        'The Integration and Coordination Center',
        'The Cloud Workspace Implementation Center',
        'The Training Center',
        'centers',
        'The Knowledge Center',];

    const centers = await prisma.center.findMany({
        where: {
            active: true
        }
    })

    const sortedCenters = centers.sort((a, b) => {
        const indexA = centerOrder.indexOf(a.label);
        const indexB = centerOrder.indexOf(b.label);
        return indexA - indexB;
    });

    return (
        <Grid container spacing={1} sx={{ marginTop: 2, marginX: '0.5rem' }}>
            <Grid item xs={12}>
                <Typography variant="h3" color="secondary">Common Fund Data Ecosystem Centers</Typography>
                <Box sx={{ lineHeight: 0.5, marginY: 1 }}>
                    <Typography variant='caption' color="secondary" >
                        The NIH Common Fund (CF) programs have produced transformative datasets, databases, methods, bioinformatics tools and workflows that are significantly advancing biomedical research in the United States and worldwide. Currently, CF programs are mostly isolated. However, integrating data from across CF programs has the potential for synergistic discoveries. In addition, since CF programs have a time limit of 10 years, sustainability of the widely used CF digital resources after the programs expire is critical. To address these challenges, the NIH established the Common Fund Data Ecosystem (CFDE) program which has been recently approved to continue to its second new phase. For the second phase of the CFDE five centers were established.
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ minHeight: 253 }}>
                    <MasonryClient defaultHeight={1500}>
                        {sortedCenters.map(center => (
                            center.label === 'centers' ? (
                                <Grid sx={{ paddingLeft: 2, paddingRight: 2, height: '365px', display: 'flex', alignItems:'center', justifyContent:'center', backgroundColor:'white'}}>
                                    <Image src='https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/cfde-centers.png' alt ='cfde-centers' width={300} height={300} />
                                </Grid>
                            ) : (
                                <Card sx={{ paddingLeft: 2, paddingRight: 2 , height: '365px'}}>

                                    <CardHeader
                                        sx={{
                                            height: '100px',  // Fixed height for the entire header
                                            paddingTop: '16px',  // Consistent padding
                                            '& .MuiCardHeader-content': {  // Target the content container
                                                minHeight: '70px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }
                                        }}
                                        avatar={
                                            <div className="flex relative" style={{ height: 70, minWidth: 70, maxWidth: 200 }}>
                                                <Image
                                                    alt={center.id}
                                                    src={center.icon || "https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/favicon.png"}
                                                    fill={true}
                                                    style={{ objectFit: "contain" }}
                                                />
                                            </div>
                                        }
                                        title={
                                            <div className=" flex items-center">
                                                <Typography
                                                    variant="body1"
                                                    color="secondary"
                                                    className="overflow-hidden"
                                                    fontWeight={500}
                                                    fontSize="1.15rem"
                                                >
                                                    {center.label} ({center.short_label})
                                                </Typography>
                                            </div>
                                        }
                                    />

                                    <CardContent sx={{ paddingTop: '0', }}>
                                        <div className="h-[60px] flex items-center">
                                            <Typography
                                                className="overflow-hidden"
                                                variant="caption"
                                                color="secondary"
                                                style={{ fontWeight: 600 }}
                                            >
                                                {center.short_description}
                                            </Typography>
                                        </div>
                                        <Typography
                                            variant={'body2'}
                                            color="secondary"
                                            sx={{
                                                marginTop: '1rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: '5',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {center.description}
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ height: '64px' }}>
                                        <div className="flex gap-2 items-center">  {/* Container for buttons */}
                                            <Link href={`/info/center/${center.short_label}`}>
                                                <Button color="secondary">
                                                    <Typography variant="body2">Expand</Typography>
                                                </Button>
                                            </Link>
                                            {center.homepage ? (
                                                <Link href={center.homepage} target="_blank" rel="noopener noreferrer">
                                                    <Button color="secondary">
                                                        <Typography variant="body2">Go to center's website</Typography>
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <div style={{ width: '180px' }} />
                                            )}
                                        </div>
                                    </CardActions>
                                </Card>
                            )))}
                    </MasonryClient>
                </Box>
            </Grid>
        </Grid>
    )
}