'use client'
import React from 'react';
import { Chip, Typography, Button } from '@mui/material';

const TagComponent = ({
    q,
    t,
    onReset,
}: {
    q: string;
    t: { type: string; entity_type: string | null; }[] | undefined;
    onReset: () => void;
}) => {
    const handleDelete = (tagToDelete: { type: string; entity_type: string | null }) => {
        let baseUrl = window.location.origin + window.location.pathname;
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

        window.location.href = `${baseUrl}?${updatedParams.toString()}`;
    };

    const handleReset = () => {
        let baseUrl = window.location.origin + window.location.pathname;
        let updatedParams = new URLSearchParams(window.location.search);

        // Clear all tags from the URL
        updatedParams.delete('t');
        // Redirect to the updated URL
        window.location.href = `${baseUrl}?${updatedParams.toString()}`;
    };

    const renderQueryChip = () => {
        if (!q) return null;
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" style={{ marginRight: '8px', fontWeight: 700 }}>
                    Query
                </Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Chip
                        key="q"
                        label={q}
                        variant="outlined"
                        style={{ margin: '4px', fontSize: '1.0rem', color: '#0047AB' }}
                    />
                </div>
            </div>
            <div>
                <Button onClick={handleReset} variant="outlined" color="secondary">
                        Reset all filters
                    </Button>
            </div>
            </div>
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

        const typeDisplayNames = {
            'dcc': 'Common Fund Program',
            'taxonomy': 'Species',
            'anatomy': 'Anatomy',
            'disease': 'Disease',
            'gene': 'Gene',
            'data_type': 'Data Type'
            // Add more mappings as needed
        };


        // Render tags grouped by type
        return Object.keys(tagGroups).map((type, index) => (
            <div key={`tag-group-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" style={{ marginRight: '8px', fontWeight: 700 }}>
                    {typeDisplayNames[type.toLowerCase()] || type}
                </Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {tagGroups[type].map((tag, tagIndex) => (
                        <Chip
                            key={`tag-${index}-${tagIndex}`}
                            label={`${tag.entity_type || 'N/A'}`}
                            onDelete={() => handleDelete(tag)}
                            style={{ margin: '4px', fontSize: '1.0rem', color: '#0047AB' }}
                        />
                    ))}
                </div>
            </div>

        ));
    };

    return (
        <>
            {renderQueryChip()}
            {renderTagsByType()}
        </>
    );
};

export default TagComponent;
