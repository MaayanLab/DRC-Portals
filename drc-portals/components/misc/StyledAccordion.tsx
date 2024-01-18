'use client'
import { styled } from '@mui/material/styles';
import { Accordion, AccordionProps, 
  AccordionDetails, AccordionDetailsProps,
  AccordionSummary, AccordionSummaryProps } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export const StyledAccordion = styled((props: AccordionProps) => (
  <Accordion sx={{ml:3, mb:1}} elevation={0} disableGutters {...props} />
)) (({ theme }) => ({
  border:0, 
  '&:before': {
    display: 'none'
  }
}))

export const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary {...props} expandIcon={<PlayArrowIcon sx={{color: "#ffffff"}} />}/>
)) (({ theme }) => ({
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