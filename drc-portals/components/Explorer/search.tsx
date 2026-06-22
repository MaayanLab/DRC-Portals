import { Grid, Card, CardContent, CardHeader, Avatar, IconButton, Typography, Skeleton, Stack, Button } from "@mui/material";
import trpc from '@/lib/trpc/client'
import { mdiMagnify } from "@mdi/js";
import { blueGrey } from "@mui/material/colors";
import Icon from "@mdi/react";
import { ArrowForward } from "@mui/icons-material";
import { useState } from "react";

export const SearchCard = ({labels, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {labels: string[], color?: string, icon_color?: string, icon?:string}) => {
	const {data, isLoading} = trpc.facet.useQuery({search: labels.join(" and ")}, {enabled: labels.length > 0})
	const [expand, setExpand] = useState(false)
	if (labels.length === 0) return null
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
			<Grid item xs={6} sm={4}>
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
			</Grid>
		)
	}
}

