"use client"
import Link from "next/link";
import React from 'react';
import { Typography, Box, Button, Divider, Grid, List } from '@mui/material';
import { Prisma } from "@prisma/client";
import { ExpandableDescriptionAnimated } from './ExpandableDescription'

type R03WithDetails = Prisma.R03GetPayload<{
    include: {
        publications: {
            include: {
                publication: true
            }
        }
    }
}>;
export default function R03Component({ r03 }: { r03: R03WithDetails[] }) {
    const toCamelCase = (str: String) => {
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };
    return (
        <>
            {r03.map((item, i) => (
                <Grid xs={12} key={i}>
                    <Divider />
                    <Grid xs={12} >
                        <Grid container alignItems="flex" sx={{ marginTop: 2 }}>
                            <Grid item spacing={1} alignItems="flex-start" justifyContent="flex-start" sx={{ marginBottom: 4 }} >
                                {/* Title */}
                                <Grid sx={{ mt: 1, mb: 2, px: 2 }}>
                                    <Typography color="secondary" variant="h5">
                                        {toCamelCase(item.title)}
                                    </Typography>
                                </Grid>
                                <Grid sx={{ my: 2 }}>
                                    {/* Description */}
                                    <ExpandableDescriptionAnimated text={item.description} />
                                    {/* Resource */}
                                    {item.website && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Link target="_blank" rel="noopener noreferrer" href={item.website}>
                                                <Button color="secondary">Available Resources → </Button>
                                            </Link>
                                        </Box>
                                    )}
                                    {/* Grant */}
                                    {item.grant_num && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Link target="_blank" rel="noopener noreferrer" href={`https://reporter.nih.gov/project-details/${item.grant_num}`}>
                                                <Button color="secondary">Go To Grant: {item.grant_num} → </Button>
                                            </Link>
                                        </Box>
                                    )}
                                    {/* Publication(s) */}
                                    <Grid sx={{ my: 1, mx: 2 }}>
                                        {item.publications?.map((pub, index) => (
                                            <List>
                                                <Typography color="secondary" variant="caption">
                                                    <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.publication.pmid}/`}>
                                                        {pub.publication.authors}. {pub.publication.year}. <b>{pub.publication.title}{!pub.publication.title.endsWith(".") && "."}</b> {pub.publication.journal}. {pub.publication.volume}. {pub.publication.page}
                                                    </Link>
                                                </Typography>
                                            </List>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* Video */}
                        {/* <Grid container spacing={2} alignItems="stretch" sx={{ height: '100%' }}>
                            {item.video && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link target="_blank" rel="noopener noreferrer" href={item.video}>
                                        <Button color="secondary">Learn more → </Button>
                                    </Link>
                                </Box>
                            )}
                        </Grid> */}
                    </Grid>
                    <Divider />
                </Grid>
            ))}
        </>
    );
};
