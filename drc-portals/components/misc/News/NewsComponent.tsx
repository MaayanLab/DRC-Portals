"use client"

import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Divider, Chip, Grid, List, ListItem, ListItemText } from '@mui/material';
import { Prisma } from "@prisma/client";
import NewsFilter from "./NewsFilters";
import Image from "next/image";
import { filterOptions } from './FilterOptions';
import { JsonArray } from "next-auth/adapters";

type NewsWithDetails = Prisma.NewsGetPayload<{}>;


export default function NewsComponent({ news }: { news: NewsWithDetails[] }) {
    const [selectedPortals, setSelectedPortals] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<{ [key: string]: string[] }>({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const allPortals = filterOptions.portals;
        const allTags = allPortals.reduce((acc, portal) => {
            acc[portal as keyof typeof filterOptions.tags] = filterOptions.tags[portal as keyof typeof filterOptions.tags];
            return acc;
        }, {} as { [key: string]: string[] });

        setSelectedPortals(allPortals);
        setSelectedTags(allTags);
    }, []);

    const filteredNews = news.filter(item => {
        const tags = item.tags as JsonArray
        if (selectedPortals.length === 0) return false; 
        if (!selectedPortals.includes(item.portal)) return false;
        if (selectedTags[item.portal] && selectedTags[item.portal].length > 0) {
            return tags?.some(tag => selectedTags[item.portal].includes(`${tag}`)) || !item.tags || tags.length === 0;
        }
        return true;
    });

    const handleFilterToggle = () => {
        setShowFilters(!showFilters);
    };

    if (!news) {
        return <Typography>No news available.</Typography>;
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
                <Button
                    onClick={handleFilterToggle} // Toggle filter visibility
                    sx={{
                        borderRadius: 1,
                        backgroundColor: '#2D5986',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#122436'
                        }
                    }}
                >
                    {showFilters ? "Hide Filters" : "Use Filters"}
                </Button>
            </Box>
            {showFilters && (
                <Box sx={{ display: 'flex', marginBottom: 2, justifyContent: 'center' }}>
                    <NewsFilter
                        selectedPortals={selectedPortals}
                        setSelectedPortals={setSelectedPortals}
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                    />

                </Box>
            )}
            {filteredNews.map((item, i) => (
                <Grid xs={12} key={i}>
                    <Divider />
                    {item.prod && (
                        <Grid xs={12} >
                            {/* Title and date */}
                            <Grid container alignItems="flex" sx={{ marginTop: 2 }}>
                                <Grid item spacing={1} alignItems="flex-start" justifyContent="flex-start" >
                                    <Grid>
                                        <Typography color="secondary" variant="h6">
                                            {item.title}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item sx={{ marginLeft: 2, display: 'flex', alignItems: 'flex-end' }}>
                                    <Typography color="secondary" variant="caption">
                                        {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {/* Description & image*/}
                            <Grid container spacing={2} alignItems="stretch" sx={{ height: '100%' }}>
                                {/* Description, tags */}
                                <Grid
                                    item
                                    xs={item.img ? 8 : 12}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-start',
                                        height: '100%'
                                    }}
                                >

                                    {/* Version, if exist */}
                                    <Typography color="secondary" variant="subtitle1" sx={{ marginTop: 1, marginLeft: 0.3 }}>
                                        {item.version && `Version ${item.version}`}
                                    </Typography>
                                    {item.description && (
                                        <Box sx={{ marginTop: 1, marginBottom: 4, justifyContent: 'flex-end' }}>
                                            <Typography color="textSecondary">{item.description}</Typography>
                                        </Box>
                                    )}

                                    {/* Descriptions */}
                                    <Grid sx={{ marginTop: 1 }} >
                                        {item.supp_description && (
                                            <List sx={{ paddingLeft: 2 }}>
                                                {(item.supp_description as JsonArray).map((desc, i) => (
                                                    <ListItem key={i} sx={{ display: 'list-item', padding: 0 }}>
                                                        <ListItemText primary={<Typography color="textSecondary">• {`${desc}`}</Typography>} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </Grid>


                                    {/* Learn more */}
                                    {item.link && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Link target="_blank" rel="noopener noreferrer" href={item.link}>
                                                <Button color="secondary">Learn more → </Button>
                                            </Link>
                                        </Box>
                                    )}
                                    <div className="flex mt-2 mb-4 items-end justify-start">
                                        {item.portal && (
                                            <Chip
                                                label={item.portal}
                                                color="primary"
                                                sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0 }}
                                            />
                                        )}
                                        {item.tags && (item.tags as JsonArray).map((tag, idx) => (
                                            <Chip
                                                key={idx}
                                                label={`${tag}`}
                                                color="secondary"
                                                sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0, marginLeft: 1 }}
                                            />
                                        ))}
                                    </div>
                                </Grid>

                                {/* image */}
                                {item.img && (
                                    <Grid item xs={4} sx={{ marginBottom: 2 }}>
                                        <Image alt={item.title} width={400} height={200} src={item.img}
                                            layout="responsive"
                                            objectFit="contain" />
                                    </Grid>
                                )}
                            </Grid>
                            <Divider />
                        </Grid>
                    )}
                </Grid>
            ))}
        </>
    );
};
