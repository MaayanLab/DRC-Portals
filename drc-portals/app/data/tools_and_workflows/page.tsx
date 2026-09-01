import Link from "@/utils/link";
import Image from "@/utils/image";
import prisma from "@/lib/prisma";
import { Typography, Grid, Card, CardContent, Paper, Button, Stack, Box, Container, Tooltip, Chip, CardActions } from "@mui/material";

import Icon from '@mdi/react';
import { mdiArrowRight, mdiVideoOutline, mdiCloseCircle } from "@mdi/js"
import { Prisma } from "@prisma/client";
import ClientCarousel from "../usecases/ClientCarousel";
import { parseAsJson } from "next-usequerystate";

type ToolsWithPublications = Prisma.ToolGetPayload<{
	include: {
		publications: true
	}
}>

export interface ToolParams {
	tags?: Array<string>,
}

const ToolCard = ({ tool, parsedParams }: { tool: ToolsWithPublications, parsedParams: ToolParams }) => {
	let tags:string[] = []
    if (Array.isArray(tool.tags)) {
        tags = tool.tags as string[]
    }
	return(
	<Card sx={{ height: 300, display: "flex", flexDirection: "column", padding: 1 }}>
		<CardContent sx={{flexGrow: 1}}>
			<Grid container spacing={2}>
				<Grid item xs={8}>
					<div className="flex items-center space-x-2">
						{tool.icon ? <Image src={tool.icon} alt={tool.label} height={40} width={40} /> :
							<Image src={'/img/favicon.png'} alt={tool.label} height={40} width={40} />
						}
					</div>
					<Typography variant="h4" color="secondary">{tool.label}</Typography>
					<Typography variant={'caption'} color="secondary">
						{tool.short_description}
					</Typography>
				</Grid>
				<Grid item xs={4}>
					<Paper elevation={0} className="flex flex-row justify-center relative" sx={{ height: 120 }}>
						{tool.image ? <Image src={tool.image} alt={tool.label} fill={true} style={{ objectFit: "contain" }} /> :
							<Image src={tool.icon || '/img/favicon.png'} alt={tool.label} fill={true} style={{ objectFit: "contain" }} />
						}
					</Paper>
					
				</Grid>
				
			</Grid>	
		</CardContent>
		<CardActions>
			<Grid container spacing={1} justifyContent={"space-between"}>
				<Grid item xs={8}>
					{tool.publications.length > 0 &&
						<div className="flex items-center">
							<Typography variant="subtitle1"><b>Publication:</b></Typography>
							{tool.publications.map((pub, i) => (
								<Link href={`https://doi.org/${pub.doi}`} key={i} target="_blank" rel="noopener noreferrer">
									<Button color="secondary">
										{pub.doi}
									</Button>
								</Link>
							))}
						</div>
					}
				</Grid>
				<Grid item xs={4}>
					{Array.isArray(tool.tutorial) && tool.tutorial.length >= 2 ? (
						<Stack direction={"row"} spacing={1}>
							<div><Typography variant="subtitle2" color="secondary">TUTORIALS</Typography></div>
							{(tool.tutorial as string[]).map((url, idx) => (
								<Link
									key={idx}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button
										color="secondary"
										sx={{
											minWidth: 0,
											padding: '2px',
										}}
									>
										<Icon path={mdiVideoOutline} size={1} />
									</Button>
								</Link>
							))}
						</Stack>
					) : Array.isArray(tool.tutorial) && tool.tutorial.length === 1 && typeof tool.tutorial[0] === 'string' ? (
						<Link
							href={tool.tutorial[0]}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button
								color="secondary"
								sx={{
									minWidth: 0,
									padding: '2px',
								}}
						
							>
								TUTORIAL <Icon path={mdiVideoOutline} size={1} />
							</Button>
						</Link>
					) : null}			
				</Grid>
				{tool.url &&
					<Grid item sx={{gridRow: 1}}>
						<Link href={tool.url} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{ marginLeft: -2 }}>
								GO TO {tool.url.indexOf('github.com') > -1 ? 'GITHUB' : tool.label.toUpperCase()}
							</Button>
						</Link>
					</Grid>
				}
				<Grid item>
					<Grid container spacing={1}>
						{tags.length > 0 && tags.map(tag=>{
							const query = (parsedParams.tags || []).indexOf(tag) > -1 ? parsedParams: {tags: [...parsedParams.tags || [], tag]}
							return <Grid item key={tag}>
									<Link href={`/data/tools_and_workflows?filter=${JSON.stringify(query)}`}>
										<Chip key={tag} color="primary" variant="filled" sx={{borderRadius: 2}} label={tag}/>
									</Link>
								</Grid>
						})}
					</Grid>
				</Grid>
			</Grid>
		</CardActions>
	</Card>
)}

const CarouselCard = ({ tool }: { tool: ToolsWithPublications }) => (
	<Box sx={{
		minHeight: { xs: 150, sm: 150, md: 300, lg: 300, xl: 300 },
		width: { xs: 300, sm: 300, md: 640, lg: 640, xl: 640 },
		textAlign: "center",
		border: 1,
		borderRadius: 5,
		borderColor: "rgba(81, 123, 154, 0.5)",
		padding: 2
	}}>
		<Link href={tool.url || ''} target="_blank" rel="noopener noreferrer">
			<Box className="flex flex-col" sx={{ minHeight: 300, boxShadow: "none", background: "#FFF" }}>
				<div className="flex grow items-center justify-center relative">
					<Image src={tool.image || tool.icon || '/img/favicon.png'} alt={tool.label} fill={true} style={{ objectFit: "contain" }} />
				</div>
			</Box>
		</Link>
	</Box>
)
const ServerCarousel = ({ tools }: { tools: Array<ToolsWithPublications> }) => {
	return tools.map((tool, i) => (
		<Container key={i} maxWidth="lg">
			<Grid container spacing={2}>
				<Grid item xs={12} sm={7} sx={{ display: { xs: "block", sm: "block", md: "none", lg: "none", xl: "none" } }}>
					<CarouselCard tool={tool} />
				</Grid>
				<Grid item xs={12} sm={5}>
					<Stack direction="column"
						alignItems="flex-start"
						spacing={2}
						sx={{ height: "90%" }}
					>
						<Typography sx={{ color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", paddingLeft: 3, paddingRight: 3 }} variant="subtitle1">FEATURED</Typography>
						<Typography variant="h3" color="secondary.dark">{tool.label}</Typography>
						<Typography variant="subtitle1">{tool.description}</Typography>
						<Stack direction="column"
							alignItems="flex-start"
							spacing={0}
							sx={{ height: "90%" }}>

							<Grid>
								<Grid className="flex">
								{Array.isArray(tool.tutorial) && tool.tutorial.length >= 2 ? (
								<>
									<Typography variant="subtitle2" color="secondary">TUTORIALS</Typography>
									{(tool.tutorial as string[]).map((url, idx) => (
										<Link
											key={idx}
											href={url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Button
												color="secondary"
												sx={{
													minWidth: 0,
													padding: '2px',
												}}
											>
												<Icon path={mdiVideoOutline} size={1} />
											</Button>
										</Link>
									))}
								</>
							) : Array.isArray(tool.tutorial) && tool.tutorial.length === 1 && typeof tool.tutorial[0] === 'string' ? (
								<>
								<Typography variant="subtitle2" color="secondary">TUTORIAL</Typography>
								<Link
									href={tool.tutorial[0]}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button
										color="secondary"
										sx={{
											minWidth: 0,
											padding: '2px',
										}}
									>
										<Icon path={mdiVideoOutline} size={1} />
									</Button>
								</Link>
								</>
							) : null}			
								</Grid>
							</Grid>
							<Grid>
								{tool.url &&
									<Link href={tool.url} target="_blank" rel="noopener noreferrer">
										<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{ marginLeft: -2 }}>
											GO TO {tool.url.indexOf('github.com') > -1 ? 'GITHUB' : tool.label.toUpperCase()}
										</Button>
									</Link>}
							</Grid>
						</Stack>
					</Stack>
				</Grid>
				<Grid item xs={12} sm={7} sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
					<CarouselCard tool={tool} />
				</Grid>
			</Grid>
		</Container>
	))
}


export default async function ToolsPage(props: {
    searchParams?: Promise<{
        filter?: string
    }>
}) {
	const searchParams = await props.searchParams
	const query_parser = parseAsJson<ToolParams>().withDefault({tags: []})
	const parsedParams = query_parser.parseServerSide(searchParams?.filter)
		
	const featured_tools = await prisma.tool.findMany({
		where: {
			featured: true
		},
		include: {
			publications: true
		},
		orderBy: [{ publications: { _count: 'desc' } }, { label: 'asc' }, { id: 'asc' }],
	})
	const tags:string[] = []

	const tag_filter = []
    for (const tag of parsedParams.tags || []) {
        tag_filter.push({tags: {
                path: [],
                array_contains: tag
            }})
		tags.push(tag)
	}
	const where_tags: {[key:string]: any} = {}
	if (tag_filter.length) where_tags['where'] = {'OR': tag_filter}
	const tools = await prisma.tool.findMany({
		include: {
			publications: true
		},
		orderBy: [{ publications: { _count: 'desc' } }, { label: 'asc' }, { id: 'asc' }],
		...where_tags
	})
	const tag_counter: {[key:string]: number} = {}
	for (const tool of tools) {
		for (const tag of tool.tags as string[] || []) {
			if (tag_counter[tag] === undefined) tag_counter[tag] = 0
			tag_counter[tag] = tag_counter[tag] + 1
		}
	}
	return (
		<Grid container spacing={2} sx={{ marginTop: 2 }}>
			<Grid item xs={12} sx={{ display: { xs: "block", sm: "none", md: "none", lg: "none", xl: "none" } }}>
				<ClientCarousel title="" height={830}>
					<ServerCarousel tools={featured_tools} />
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{ display: { xs: "none", sm: "block", md: "none", lg: "none", xl: "none" } }}>
				<ClientCarousel title="" height={750}>
					<ServerCarousel tools={featured_tools} />
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
				<ClientCarousel title="">
					<ServerCarousel tools={featured_tools} />
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{ marginTop: 2 }}>
				<Typography sx={{ textAlign: "center" }} variant="h2" color="secondary">All Tools and Workflows</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography sx={{ textAlign: "center" }} variant="subtitle1">
					Explore different tools and workflows that utilizes data from different CFDE participating programs
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Grid container spacing={1}>
					{tags.length > 0 && tags.map(tag=>{
						const new_tags = (parsedParams.tags || []).filter(i=>i!== tag)
						return <Grid item key={tag}>
								<Link href={`/data/tools_and_workflows?filter=${JSON.stringify({tags: new_tags})}`}>
									<Chip key={tag} clickable color="primary" variant="filled" sx={{borderRadius: 2}} label={`${tag} (${tag_counter[tag]})`} icon={<Icon path={mdiCloseCircle} size={1} />}/>
								</Link>
							</Grid>
					})}
			</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container spacing={2}>
					{tools.map((tool) => (
						<Grid item xs={12} sm={6} key={tool.label}>
							<ToolCard tool={tool} parsedParams={parsedParams} />
						</Grid>
					))}
				</Grid>
			</Grid>
		</Grid>
	)
}