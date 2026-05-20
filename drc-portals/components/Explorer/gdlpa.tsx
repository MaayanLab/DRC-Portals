import Image from "@/utils/image"
import { mdiMagnify } from "@mdi/js"
import Icon from "@mdi/react"
import { ArrowForward } from "@mui/icons-material"
import { Avatar, Button, Card, CardHeader, Grid, IconButton, ListItemButton, ListItemIcon, ListItemText, Skeleton } from "@mui/material"
import { blueGrey } from "@mui/material/colors"
import { useEffect, useState } from "react"


export const gdlpa = ({label, entity, color=blueGrey[100], icon_color=blueGrey[900], icon=mdiMagnify}: {label: string, entity?:string, color?: string, icon_color?: string, icon?:string}) => {
	// const [expand, setExpand] = useState(false)
	const [count, setCount] = useState<null|number>(null)
	// const endpoint = entity === 'gene' ? 'gene': entity ==='variant' ? 'variant'
	useEffect(()=>{
		const get_gdlpa = async () =>  {
			try {
				const res = await fetch(`https://cfde-gene-pages.cloud/_next/data/TbM6Ywa1b0F_2AepsAqCK/${entity}/${label}.json`)
				if (res.ok) {
					const results = await res.json()
					if (results.pageProps) {
						const count = results.pageProps.manifest.length
						setCount(count)
					}
				} else {
					console.error(res.text)
					setCount(0)
				}	
			} catch (error) {
				console.error(error)
				setCount(0)
			}
			
		}
		get_gdlpa()
	}, [])
	if (count === null) {
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
	if (count === 0) return null
	return(
			<Card sx={{height: '100%'}}>
				<CardHeader
					avatar={
						<Avatar sx={{backgroundColor: color}}><Icon style={{backgroundColor: "transparent", color: icon_color}} path={icon} size={1}/></Avatar>
					}
					action={
					<IconButton aria-label="goto"
						href={`https://cfde-gene-pages.cloud/${entity}/${label}?CF=false&PS=true`}
						target="_blank" rel="noopener noreferrer"
					>
						<ArrowForward />
					</IconButton>
					}
					title={label}
					subheader={`View ${count} ${label} ${entity} cards on GDLPA`}
				/>
				{/* <CardContent>
					<Stack>
						<Typography variant="caption"><b>Search hits: </b>{`${data?.total}`}</Typography>
						{(expand ? buckets: buckets.slice(0,3)).map(i=>(
							<Typography variant="caption">
								<b>{i.key}: </b> {i.doc_count}
							</Typography>
						))}
						{buckets.length > 3 && <Button color="secondary" onClick={()=>setExpand(!expand)}><Typography variant="caption">{expand ? "Show less":"Show all"}</Typography></Button>}
					</Stack>
				</CardContent> */}
			</Card>
		)
}