import { Grid, Card, CardContent, Collapse, CardHeader, Avatar, IconButton, ListItemButton, ListItemIcon, ListItemText, Typography, Paper, Skeleton, Stack, Button } from "@mui/material";
import trpc from '@/lib/trpc/client'
import { mdiMagnify } from "@mdi/js";
import { blueGrey } from "@mui/material/colors";
import Icon from "@mdi/react";
import { ArrowForward, ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";
import Image from "@/utils/image";

export const search_card = ({labels, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {labels: string[], color?: string, icon_color?: string, icon?:string}) => {
	const {data, isLoading} = trpc.facet.useQuery({search: labels.join(" and ")})
	const [expand, setExpand] = useState(false)
	if (isLoading) {
		return (
			<Card sx={{height: '100%'}}>
				<CardHeader
					avatar={
						<Skeleton animation="wave" variant="circular" width={40} height={40} />
					}
					action={
					null
					}
					title={<Skeleton
						animation="wave"
						height={30}
						width="80%"
						/>}
					subheader={<Skeleton
						animation="wave"
						height={50}
						width="80%"
					/>}
				/>
			</Card>
		)
	}
	else if (data?.total === 0) {
		return null
	} else {
		const buckets = data?.aggregations?.type.buckets || []
		return(
			<Card sx={{height: '100%'}}>
				<CardHeader
					avatar={
						<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
					}
					action={
					<IconButton aria-label="goto"
						href={`/data/processed/search/${labels.join(" and ")}`}
					>
						<ArrowForward />
					</IconButton>
					}
					title={labels.join(" and ")}
					subheader={`Search the CFDE Workbench with the term${labels.length > 1 ? 's':''} ${labels.join(" and ")}`}
				/>
				<CardContent sx={{paddingTop: 0, paddingBottom: 0}}>
					<Stack>
						<Typography variant="caption"><b>Search hits: </b>{`${data?.total}`}</Typography>
						{(expand ? buckets: buckets.slice(0,3)).map(i=>(
							<Typography variant="caption">
								<b>{i.key}: </b> {i.doc_count}
							</Typography>
						))}
						{buckets.length > 3 && <Button color="secondary" onClick={()=>setExpand(!expand)}><Typography variant="caption">{expand ? "Show less":"Show all"}</Typography></Button>}
					</Stack>
				</CardContent>
			</Card>
		)
	}
}

export const ExpandableComponent = ({inputList, icon, title, description, child_function, collapsed=true, combine=false, width=50, height=50}: 
	{	collapsed?: boolean,
		combine?: boolean,
		icon: string,
		title: string,
		description: string,
		child_function: Function,
		width?: number,
		height?: number,
		inputList: {
			entity: string,
			label: string,
			icon: string,
			icon_color: string,
			color:string,
			values?: {[key: string]: number},
			links?: {resource: string,
				description: string,
				link: string}[]}[]
	}) => {
	const [open, setOpen] = useState(!collapsed)
	const children: React.ReactNode[] = []
	const terms:string[] = []
	for (const i of inputList) {
		terms.push(i.label)
		const child = child_function({labels: [i.label], ...i})
		if (child !== null) {
			if (Array.isArray(child)) {
				console.log(i.label)
				let ind = 0
				for (const c of child) {
					children.push(
						<Grid item xs={6} sm={4} key={i.label + ind}>
							{c}
						</Grid>
					)
					ind += 1
				}
			} else {
				children.push(
					<Grid item xs={6} sm={4} key={i.label}>
						{child}
					</Grid>
				)
			}
			
		}
	}
	if (combine && terms.length) {
		const child = child_function({labels: terms})
		if (child !== null) {
			children.push(
				<Grid item xs={6} sm={4} key={terms.join(" and ")}>
					{child}
				</Grid>
			)
		}
	}
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