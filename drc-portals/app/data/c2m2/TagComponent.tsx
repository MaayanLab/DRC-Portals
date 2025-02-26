'use client';
import React from 'react';
import { Typography, Button, Accordion, AccordionSummary, AccordionDetails, Grid, Chip, styled } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from '@/utils/navigation';

// Common style for text and buttons
const commonTextStyle = {
    fontSize: '1.0rem',
    fontWeight: 700,
    color: '#0047AB',
};

// Styled components to remove shadow and apply border styles
const CustomAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
}));

const CustomButton = styled(Button)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    color: '#0047AB',
    fontWeight: 700,
    fontSize: '1.0rem',
}));

const TagComponent = ({
    q,
    t,
    onReset,
}: {
    q?: string;
    t?: { type: string; entity_type: string | null; }[] | undefined;
    onReset?: () => void;
}) => {
    const router = useRouter();

    const handleDelete = (tagToDelete: { type: string; entity_type: string | null }) => {
        let baseUrl = window.location.pathname;
        let updatedParams = new URLSearchParams(window.location.search);

        if (q && tagToDelete.type === 'q') {
            updatedParams.delete('q');
        } else if (t) {
            const updatedTags = t
                .filter(tag => !(tag.type === tagToDelete.type && tag.entity_type === tagToDelete.entity_type))
                .map(tag => `${tag.type}:${tag.entity_type || ''}`)
                .join('|');

            if (updatedTags) {
                updatedParams.set('t', updatedTags);
            } else {
                updatedParams.delete('t');
            }
        }

        router.push(`${baseUrl}?${updatedParams.toString()}`);
    };

    const handleReset = () => {
        let baseUrl = window.location.pathname;
        let updatedParams = new URLSearchParams(window.location.search);

        // Clear all tags from the URL
        updatedParams.delete('t');
        // Redirect to the updated URL
        router.push(`${baseUrl}?${updatedParams.toString()}`);
    };

    const renderQueryText = () => {
        if (!q) return null;
        return (
            <Typography variant="body1" style={{ margin: '4px', ...commonTextStyle }}>
                Query: {q}
            </Typography>
        );
    };

    const renderTagsByType = () => {
        if (!t) return null;

        // Group tags by their type
        const tagGroups: { [key: string]: { type: string; entity_type: string | null }[] } = {};
        t.forEach(tag => {
            if (!tagGroups[tag.type]) {
                tagGroups[tag.type] = [];
            }
            tagGroups[tag.type].push(tag);
        });

        const typeDisplayNames: Record<string, string> = {
            'dcc': 'Program',
            'ncbi_taxonomy': 'Species',
            'anatomy': 'Anatomy',
            'disease': 'Disease',
            'gene': 'Gene',
            'data_type': 'Data Type',
            'compound': 'Compound',
            'protein': 'Protein',
            'assay_type': 'Assay Type'
            // Add more mappings as needed
        };

        // Render tags grouped by type within accordions
        return (
            <CustomAccordion defaultExpanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography variant="subtitle1" style={commonTextStyle}>
                        Manage Filters
                    </Typography>
                </AccordionSummary>
                <AccordionDetails style={{ flexDirection: 'column', padding: 0 }}>
                    {Object.keys(tagGroups).map((type, index) => (
                        <Accordion key={`tag-group-${index}`} style={{ width: '100%', marginBottom: '8px' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel-${index}-content`}
                                id={`panel-${index}-header`}
                            >
                                <Typography variant="subtitle2" style={{ ...commonTextStyle, fontSize: '0.875rem' }}>
                                    {typeDisplayNames[type.toLowerCase()] || type}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ display: 'flex', flexWrap: 'wrap', padding: '8px 0' }}>
                                {tagGroups[type].map((tag, tagIndex) => (
                                    <Chip
                                        key={`tag-${index}-${tagIndex}`}
                                        label={`${tag.entity_type || 'N/A'}`}
                                        onDelete={() => handleDelete(tag)}
                                        style={{ margin: '4px', fontSize: '0.875rem', color: '#0047AB' }}
                                    />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </AccordionDetails>
            </CustomAccordion>
        );
    };

    return (
        <Grid container spacing={2} alignItems="center" justifyContent="center" style={{ flexWrap: 'nowrap' }}>
            <Grid item>
                {renderQueryText()}
            </Grid>
            <Grid item>
                {renderTagsByType()}
            </Grid>
            {t && t.length > 0 && (
                <Grid item>
                    <CustomButton 
                        onClick={handleReset} 
                        variant="outlined" 
                        color="secondary"
                    >
                        Reset Filters
                    </CustomButton>
                </Grid>
            )}
        </Grid>
    );
};

export default TagComponent;
