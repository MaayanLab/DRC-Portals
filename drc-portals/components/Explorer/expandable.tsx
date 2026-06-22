import { Grid,  Collapse, ListItemButton, ListItemIcon, ListItemText, Typography, Paper } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";
import Image from "@/utils/image";

export const ExpandableComponent = ({icon, title, description, collapsed=true, width=50, height=50, children}: 
	{	collapsed?: boolean,
		icon: string,
		title: string,
		description: string,
		width?: number,
		height?: number,
		children: React.ReactNode[],
	}) => {
	const [open, setOpen] = useState(!collapsed)
	if (children.length === 0) return null
	return (
		<>
		<ListItemButton onClick={()=>setOpen(!open)}>
			<ListItemIcon>
				<Image src={icon} width={width} height={height} alt={title}/>
			</ListItemIcon>
			<ListItemText primary={<Typography variant="h3">{title}</Typography>}
			secondary={description} />
			{open? <ExpandLess/> : <ExpandMore />}
		</ListItemButton>
		<Collapse in={open} timeout="auto" unmountOnExit>
			<Paper elevation={0} sx={{background: 'transparent'}}>
				<Grid container spacing={2}>
					{children}
				</Grid>
			</Paper>
		</Collapse>
		</>
	)
}