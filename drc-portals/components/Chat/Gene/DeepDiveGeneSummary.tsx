'use client'

import useSWR from 'swr';
import { MarkdownStatic } from '@/components/misc/MarkdownComponent';
import { Box, Stack, Typography, Container } from '@mui/material';
import GeneSummary from '@/app/data/processed/GeneSummary';
// Construct a workflow Gene => ARCHS4 Tissue => Barplot with the input: ACE2
// import PlaybookButton from '../playbookButton';
// import { Typography, Stack, Box } from '@mui/material';

export const getDeepDiveSummary = async (gene: string) => {


    const res = await fetch(`https://deepdive-dev.maayanlab.cloud/deepdive/api/${gene}/`)

    const data = await res.json()
    return data
};

export default function DeepDiveGeneSummary(props: any) {
    const gene: string = props.geneSymbol || 'ACE2'
    
    if (props.output === undefined) {
        return <>Error</>
    }
    const summary = props.output.result.data
    

    
    return (
    <Container maxWidth="lg">
        <GeneSummary summary={summary}/>
    </Container>
    )
}