'use client'

import useSWR from 'swr';
import { MarkdownStatic } from '@/components/misc/MarkdownComponent';
import { Box, Stack, Typography, Container } from '@mui/material';
// Construct a workflow Gene => ARCHS4 Tissue => Barplot with the input: ACE2
// import PlaybookButton from '../playbookButton';
// import { Typography, Stack, Box } from '@mui/material';

const getDeepDiveSummary = async (gene: string) => {


    const res = await fetch(`https://deepdive-dev.maayanlab.cloud/deepdive/api/${gene}/`)

    const data = await res.json()
    return data
};

export default function DeepDiveGeneSummary(props: any) {
    const gene: string = props.geneSymbol || 'ACE2'
    
    const {data, isLoading, error} = useSWR([gene], () => getDeepDiveSummary(gene));
    if (error) {
        return <>{error}</>
    } else if (isLoading) {
        return <Box sx={{width: "100%"}}>Loading summary...</Box>
    }
    if (!data) return <>{error}</>
    

    
    return (
    <Container maxWidth="lg">
        <Stack>
            <Typography variant="h3">{gene} Summary Based on Top 50 PubMed Articles</Typography>
            <MarkdownStatic markdown={data.gene_summary}/>
        </Stack>
    </Container>
    )
}