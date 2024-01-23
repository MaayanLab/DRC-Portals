'use client'
import * as React from 'react';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { styled } from '@mui/material/styles';
import {
    Accordion, AccordionProps,
    AccordionDetails,
    AccordionSummary, AccordionSummaryProps,
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export const StyledAccordion = styled((props: AccordionProps) => (
    <Accordion sx={{ ml: 3, mb: 1 }} elevation={0} disableGutters {...props} />
))(({ theme }) => ({
    border: 0,
    '&:before': {
        display: 'none'
    }
}))

export const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
    <AccordionSummary {...props} expandIcon={<PlayArrowIcon sx={{ color: "#ffffff" }} />} />
))(({ theme }) => ({
    backgroundColor: '#b8c4e1',
    flexDirection: 'row-reverse',
    "&.Mui-expanded": {
        minHeight: 0,
        backgroundColor: '#7187C3'
    },
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    }
}))

export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 2
}));


export function StyledAccordionComponent({ heading, content }: { heading: string, content: React.ReactElement }) {
    return (
        <StyledAccordion>
            <StyledAccordionSummary
                expandIcon={<ArrowDownwardIcon />}
            >
                <Typography>{heading}</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                {content}
            </StyledAccordionDetails>
        </StyledAccordion>
    )
}
