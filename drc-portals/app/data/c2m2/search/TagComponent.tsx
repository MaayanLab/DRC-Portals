'use client'
import React from 'react';
import { Chip } from '@mui/material';
import Link from 'next/link';
import { useSanitizedSearchParams } from "@/app/data/processed/utils"

type PageProps = {
    searchParams: Record<string, string>;
};

const TagComponent = ({ searchParams }: PageProps) => {
    const handleDelete = (key: string, valueToRemove: string) => {
        let url = window.location.href;
        let baseUrl = url.split('?')[0]; // Get the part of the URL before the query parameters

        let updatedParams = new URLSearchParams();

        for (const [paramKey, paramValue] of Object.entries(searchParams)) {
            if (paramKey === 't' && key === 't') {
                const tags = paramValue.split('|').filter(tag => tag !== valueToRemove);
                if (tags.length > 0) {
                    updatedParams.set(paramKey, tags.join('|'));
                }
            } else if (paramKey !== key) {
                updatedParams.set(paramKey, paramValue);
            }
        }

        return `${baseUrl}?${updatedParams.toString()}`;
    };

    const renderTags = () => {
        let tags = [];

        if (searchParams.t) {
            searchParams.t.split('|').forEach(tag => {
                tags.push({ key: 't', value: tag });
            });
        }

        return tags.map(tag => (
            <Chip
                key={`${tag.key}-${tag.value}`}
                label={` ${tag.value} `}
                onDelete={() => window.location.href = handleDelete(tag.key, tag.value)}
                style={{ margin: '4px', fontSize: '1.0rem', color: '#0047AB' }}
            />
        ));
    };

    return <>{renderTags()}</>;
};

export default TagComponent;
