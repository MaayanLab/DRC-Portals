'use client'
import React from 'react';
import { Chip } from '@mui/material';

const TagComponent = ({
    q,
    t,
}: {
    q: string;
    t: { type: string; entity_type: string | null; }[] | undefined;
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

    const renderQueryChip = () => {
        if (!q) return null;
        return (
            <Chip
                key="q"
                label={`Query: ${q}`}
                //onDelete={() => handleDelete({ type: 'q', entity_type: null })}
                style={{ margin: '4px', fontSize: '1.0rem', color: '#0047AB' }}
            />
        );
    };

    const renderTags = () => {
        return t ? t.map((tag, index) => (
            <Chip
                key={`tag-${index}`}
                label={`${tag.type}: ${tag.entity_type || 'N/A'}`}
                onDelete={() => handleDelete(tag)}
                style={{ margin: '4px', fontSize: '1.0rem', color: '#0047AB' }}
            />
        )) : null;
    };

    return (
        <>
            {renderQueryChip()}
            {renderTags()}
        </>
    );
};

export default TagComponent;
