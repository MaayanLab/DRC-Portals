'use client'
import { Box } from "@mui/material";
import { styled } from '@mui/material/styles';

export const StyledBox = styled(Box)(({ theme }) => ({
	minHeight: 300, 
	width: 640,
	textAlign: "center", 
	border: 1,
	borderRadius: 5,
	borderColor: "rgba(81, 123, 154, 0.5)", 
	padding: 2,
	[theme.breakpoints.down('sm')]: {
		minHeight: 200,
		width: 350,
	}
  }));
  