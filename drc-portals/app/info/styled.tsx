import { Paper, PaperProps } from "@mui/material";
export const ResponsivePaper = (props: PaperProps) => {
	return (
		<Paper
			elevation={0}
			sx={{
				background: "#FFF",
				padding: {xs: 2, sm: 2, md: 5, lg: 5, xl: 5},
				borderRadius: 0, 
				width: "100vw", 
				// minHeight: "100vh",
				color: "#FFF",
				overflow: "hidden",
				marginLeft: {xs: 1, sm: 1, md: "calc((-100vw + 100%) / 2)", lg: "calc((-100vw + 100%) / 2)", xl: "calc((-100vw + 100%) / 2)"},
				marginRight: {xs: 1, sm: 1, md: "calc((-100vw + 100%) / 2)", lg: "calc((-100vw + 100%) / 2)", xl: "calc((-100vw + 100%) / 2)"},
				...props.sx
			}}
			className="relative"
		>
			{props.children}
		</Paper>
	)
}


