'use client'
import { Paper } from "@mui/material";
import { styled } from '@mui/material/styles';

export const MarginPaper = styled(Paper)(({ theme }) => ({
	background: "#FFF",
	padding: 5, 
	borderRadius: 0, 
	width: "100vw", 
	// minHeight: "100vh",
	color: "#FFF",
	marginLeft: "calc((-100vw + 100%) / 2)", 
	marginRight: "calc((-100vw + 100%) / 2)",
	overflow: "hidden",
	[theme.breakpoints.down('sm')]: {
		marginLeft: 0, 
		marginRight: 0,
		padding: 1
	}
  }));
  