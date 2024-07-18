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
  <AccordionSummary {...props} expandIcon={<PlayArrowIcon sx={{
    color: "secondary.main",
  }} />}/>
)) (({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  flexDirection: 'row-reverse',
  color: theme.palette.secondary.main,
  "&.Mui-expanded": {
    minHeight: 0,
    backgroundColor: theme.palette.secondary.main,
    color: '#FFF'
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
    '& .MuiSvgIcon-root': {
      color: "#FFF"
    }
  },
  
}))

export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: 2
}));