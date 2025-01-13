"use client"
import { useMemo, useState } from "react";
import Link from "@/utils/link";
import { Button, Divider, Chip, Stack, Grid } from "@mui/material";
import { Prisma } from "@prisma/client";
import ExportCitation from "./ExportCitation";
import Filters from "./Filters";
import PublicationSearch from "./PublicationSearch";
import PublicationCitation from "./PublicationCitation";

type PublicationWithDCC = Prisma.PublicationGetPayload<{
    include: {
        dccs: {
            include: {
                dcc: true
            }
        }
        r03s: {
            include: {
                r03: true
            }
        }
        centers: {
            include: {
                center: true
            }
        }
    }

}>
export default function PublicationComponent({ publications }: { publications: PublicationWithDCC[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDccSelected, setIsDccSelected] = useState(true);
    const [isR03Selected, setIsR03Selected] = useState(true);
    const [isCenterSelected, setIsCenterSelected] = useState(true);
    const [isLandmarkSelected, setIsLandmarkSelected] = useState(true);

    const toCamelCase = (str: String) => {
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };
    const filteredPublications = useMemo(() => {
        // No filter selected
        if (!isDccSelected && !isR03Selected && !isLandmarkSelected && !isCenterSelected) {
            return [];
        }
        return publications?.filter(pub => {
            const term = searchTerm.toLowerCase().trim();
            // Search across title, authors, jounal, dccs, and centers
            const matchesSearch = !term ||
                pub.title?.toLowerCase().includes(term) ||
                pub.authors?.toLowerCase().includes(term) ||
                pub.journal?.toLowerCase().includes(term) ||
                pub.dccs?.some(dcc => dcc.dcc.short_label?.toLowerCase().includes(term)) ||
                pub.centers?.some(center => center.center.short_label?.toLowerCase().includes(term)) ||
                (Array.isArray(pub.keywords) && pub.keywords.some(keyword => 
                    typeof keyword === 'string' && keyword.toLowerCase().includes(term)
                ));

            // DCC, R03, and Landmark filters
            const matchesFilters =
                (!isDccSelected && !isR03Selected && !isLandmarkSelected && !isCenterSelected) || // Show all if none selected
                (isDccSelected && pub.dccs?.length > 0) ||
                (isR03Selected && pub.r03s?.length > 0) ||
                (isLandmarkSelected && pub.landmark) ||
                (isCenterSelected && pub.centers?.length > 0);
            return matchesSearch && matchesFilters;
        });
    }, [publications, searchTerm, isCenterSelected, isDccSelected, isR03Selected, isLandmarkSelected]);


    return (
        <>
            {/* Filters */}
            <Grid container sx={{ mb: 2 }}>
                {/* Search box */}
                <Grid item sm={6}>
                    <PublicationSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </Grid>
                {/* Checkbox */}
                <Grid item sm={1}></Grid>
                <Grid sx={{ flex: 1 }} sm={5}>
                    <Filters
                        isDccSelected={isDccSelected}
                        setIsDccSelected={setIsDccSelected}
                        isR03Selected={isR03Selected}
                        setIsR03Selected={setIsR03Selected}
                        isCenterSelected={isCenterSelected}
                        setIsCenterSelected={setIsCenterSelected}
                        isLandmarkSelected={isLandmarkSelected}
                        setIsLandmarkSelected={setIsLandmarkSelected}
                    />
                </Grid>
            </Grid>
            {/* Publications */}
            {filteredPublications.map((pub, i) => (
                <>
                    <div key={i} className="mb-2 space-x-1">
                        <>
                            <PublicationCitation publication={pub} searchTerm={searchTerm} />
                            <div className="flex space-x-1 items-center justify-end">
                                { pub.pmid && 
                                    <Link target="_blank" rel="noopener noreferrer" href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`}>
                                        <Button color="secondary">PubMed</Button>
                                    </Link>
                                }
                                { pub.pmcid && 
                                    <Link target="_blank" rel="noopener noreferrer" href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pub.pmcid}/`}>
                                        <Button color="secondary">PMC</Button>
                                    </Link>
                                }
                                { pub.doi && 
                                    <Link target="_blank" rel="noopener noreferrer" href={`https://www.doi.org/${pub.doi}`}>
                                        <Button color="secondary">DOI</Button>
                                    </Link>
                                }
                                { pub.pmcid && 
                                    <ExportCitation pmcid={`${pub.pmcid}`}/>
                                }
                                {pub.landmark &&
                                    <Chip label={"Landmark"} color="secondary" sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0 }} />
                                }
                                {pub.centers && pub.centers.length > 0 &&
                                    <>
                                        <Chip label="Center" color="secondary" sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0 }} onClick={() => window.open('/info/centers', '_blank')} clickable />
                                        {pub.centers.map((c) => (
                                            <Chip
                                                key={c.center.id}
                                                label={c.center.short_label}
                                                color="secondary"
                                                sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0 }}
                                                onClick={() => window.open(`/info/centers/${c.center.short_label}`, '_blank')} clickable
                                            />
                                        ))}
                                    </>
                                }
                                {(pub.dccs).map(({ dcc }) => (
                                    <Chip key={dcc.short_label} label={dcc.short_label} color="secondary" sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0 }} onClick={() => window.open(`/info/dcc/${dcc.short_label}`, '_blank')} clickable />
                                ))
                                }
                                {pub.r03s && pub.r03s.length > 0 && (
                                    pub.r03s.map((r03, index) => (
                                        <Chip key={index} label={'R03'} color="secondary" sx={{ borderRadius: 2, paddingLeft: 0, paddingRight: 0 }} onClick={() => window.open('/info/r03', '_blank')} clickable />
                                    ))
                                )}

                            </div>
                            {/* Keywords */}
                            <Stack
                                direction="row"
                                className="flex flex-wrap gap-1 max-w-full mt-2"
                                sx={{
                                    flexWrap: 'wrap',
                                    gap: '4px',
                                    maxWidth: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start'
                                }}
                            >
                                {pub.keywords && (
                                    (pub.keywords as string[]).map((keyword, idx) => (
                                        <Chip
                                            key={idx}
                                            label={toCamelCase(keyword)}
                                            color="primary"
                                            size="small"
                                            sx={{
                                                borderRadius: 2,
                                                fontSize: '0.75rem',
                                                height: '24px',
                                                '& .MuiChip-label': {
                                                    padding: '0 4px'
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </Stack>
                        </>
                    </div>
                    <Divider/>
                </>
            ))}
        </>
    )
}