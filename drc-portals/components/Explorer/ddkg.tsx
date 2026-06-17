import Image from "@/utils/image"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText, Skeleton } from "@mui/material"
import trpc from '@/lib/trpc/client'
import { ArrowForward } from "@mui/icons-material"
import Icon from "@mdi/react"
import { blueGrey } from "@mui/material/colors"
import { mdiMagnify } from "@mdi/js"

export const DDKG = ({label, values, entity='gene', color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, values?: {[key: string]: number}, color?: string, icon_color?: string, icon?:string}) => {
	const {data: link, isLoading} = trpc.ddkg.useQuery({term: label, entity: entity })
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
	if (link === '' || link === undefined) return null
	return (
		<Card sx={{height: '100%'}}>
			<CardHeader
				avatar={
					<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
				}
				action={
				<IconButton aria-label="goto"
					href={link || ''}
					target="_blank" rel="noopener noreferrer" 
				>
					<ArrowForward />
				</IconButton>
				}
				title={label}
				subheader={`Explore connections with this term in DD-KG`}
			/>
		</Card>
	)
	
}