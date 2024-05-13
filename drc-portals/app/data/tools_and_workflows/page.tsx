import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/CardActions'
import Avatar from "@mui/material/Avatar";
import { Prisma } from "@prisma/client";
import MasonryClient from "@/components/misc/MasonryClient";

type ToolsWithPublications = Prisma.ToolGetPayload<{
    include: {
        publications: true
    }
  }>

export default async function ToolsPage() {
    const tools = await prisma.tool.findMany({
        include: {
            publications: true
        },
        orderBy: [{publications: {_count: 'desc'}}, {label: 'asc'}, {id: 'asc'}],
    })

    return (
        <MasonryClient defaultHeight={1500}>
            {tools.map(tool=>(
                <Card sx={{paddingLeft: 2, paddingRight: 2}}>
                    <CardHeader
                        avatar={tool.icon ? 
                                    <Image alt={tool.id} width={80} height={80} src={tool.icon} />:
                                    <Avatar>{tool.label[0]}</Avatar>
                                }
                        title={<Typography variant="h3" color="secondary">{tool.label}</Typography>}
                    />
                    <CardContent>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Typography variant={'body2'} color="secondary">
                                    {tool.description}
                                </Typography>
                            </Grid>
                            { tool.publications.length > 0 && 
                                <Grid item xs={12} className="flex items-center">
                                    <Typography variant="body2" color="secondary"><b>Publication{tool.publications.length > 1 && 's'}:</b></Typography>
                                    {tool.publications.map((publication)=>(
                                        <Link key={publication.id} target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${publication.doi}`}>
                                            <Button color="secondary"><Typography variant="body2" color="secondary">{publication.doi}</Typography></Button>
                                        </Link>
                                    ))}
                                </Grid>
                            }
                            {tool.url &&
                                <Grid item xs={12}>
                                    <Link href={tool.url}>
                                        <Button color="secondary" sx={{marginLeft: -1}}>
                                            <Typography variant="body2" color="secondary">GO TO {tool.label.toUpperCase()}</Typography>
                                        </Button>
                                    </Link>
                                </Grid>
                            }
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </MasonryClient>
    )
}