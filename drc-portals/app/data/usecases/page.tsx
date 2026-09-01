import Link from "@/utils/link";
import Image from "@/utils/image";
import prisma from "@/lib/prisma";
import { Typography, Grid, Card, CardContent, Paper, Button, Stack, Box, Container, Chip, CardHeader, CardActions } from "@mui/material";
import { Prisma } from "@prisma/client";
import Icon from '@mdi/react';
import { mdiArrowRight, mdiVideoOutline, mdiCloseCircle } from "@mdi/js"
import ClientCarousel from "./ClientCarousel";
import { parseAsJson } from "next-usequerystate";
import PaginationComponent from "./paginate";
import { ToolParams } from "../tools_and_workflows/page";
type UseCaseWithDCC = Prisma.UseCaseGetPayload<{
	include: {
		source_dccs: {
			include: {
				dcc: true
			}
		}
	}
}>

export interface UseCaseParams {
	limit: number,
	skip: number
	tags: string[]
}

const UseCaseCard = ({ usecase, parsedParams }: { usecase: UseCaseWithDCC, parsedParams: UseCaseParams }) => {
	let tags:string[] = []
    if (Array.isArray(usecase.tags)) {
        tags = usecase.tags as string[]
    }
	return(
	<Card sx={{ minHeight: 350, height: "100%", display: "flex", flexDirection: "column", padding: 1 }}>
		<CardHeader
		avatar={<Image src={usecase.tool_icon || '/img/favicon.png'} alt={usecase.title} height={40} width={40} />}
		title={<Typography color="secondary" variant="h5">{usecase.tool_name}</Typography>}
		/>
		<CardContent sx={{flexGrow: 1}}>
			<Grid container spacing={2}>	
				<Grid item xs={8}>
					<Typography variant="h4" color="secondary">{usecase.title}</Typography>
					<Typography variant={'caption'} color="secondary">
						{usecase.short_description}
					</Typography>
				</Grid>		
				<Grid item xs={4}>
					{usecase.image ? <Image src={usecase.image} alt={usecase.title} fill={true} style={{ objectFit: "contain" }} /> :
						<Image src={'/img/favicon.png'} alt={usecase.title} fill={true} style={{ objectFit: "contain" }} />
					}	
				</Grid>	
			</Grid>
		</CardContent>
		<CardActions>
			<Grid container spacing={1} justifyContent={"space-between"}>
				
				{usecase.tutorial &&
					<Grid item xs={12}>
						<Link href={usecase.tutorial} target="_blank" rel="noopener noreferrer">
							<Button
								color="secondary"
								endIcon={<Icon path={mdiVideoOutline} size={1} />}
								sx={{ marginLeft: -2, marginBottom: -2.5 }}
							>
								TUTORIAL
							</Button>
						</Link>
					</Grid>
				}
				{usecase.link &&
					<Grid item sx={{gridRow: 1}}>
						<Link href={usecase.link} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{ marginLeft: -2 }}>
								GO TO USE CASE
							</Button>
						</Link>
					</Grid>
				}
				<Grid item>
					<Grid container spacing={1}>
						{tags.length > 0 && tags.map(tag=>{
							const query = (parsedParams.tags || []).indexOf(tag) > -1 ? parsedParams: {tags: [...parsedParams.tags || [], tag]}
							return <Grid item key={tag}>
									<Link href={`/data/usecases?filter=${JSON.stringify(query)}`}>
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

const CarouselCard = ({ usecase }: { usecase: UseCaseWithDCC }) => (
	<Box sx={{
		minHeight: { xs: 150, sm: 150, md: 300, lg: 300, xl: 300 },
		width: { xs: 300, sm: 300, md: 640, lg: 640, xl: 640 },
		textAlign: "center",
		border: 1,
		borderRadius: 5,
		borderColor: "rgba(81, 123, 154, 0.5)",
		padding: 2
	}}>
		<Link href={usecase.link || ''} target="_blank" rel="noopener noreferrer">
			<Box className="flex flex-col" sx={{ minHeight: 300, boxShadow: "none", background: "#FFF" }}>
				<div className="flex grow items-center justify-center relative">
					<Image src={usecase.featured_image || usecase.image || '/img/favicon.png'} alt={usecase.title} fill={true} style={{ objectFit: "contain" }} />
				</div>
			</Box>
		</Link>
	</Box>
)
const ServerCarousel = ({ usecases }: { usecases: Array<UseCaseWithDCC> }) => {
	return usecases.map((usecase, i) => (
		<Container key={i} maxWidth="lg">
			<Grid container spacing={2}>
				<Grid item xs={12} sm={7} sx={{ display: { xs: "block", sm: "block", md: "none", lg: "none", xl: "none" } }}>
					<CarouselCard usecase={usecase} />
				</Grid>
				<Grid item xs={12} sm={5}>
					<Stack direction="column"
						alignItems="flex-start"
						spacing={2}
						sx={{ height: "90%" }}
					>
						<Typography sx={{ color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", paddingLeft: 3, paddingRight: 3 }} variant="subtitle1">FEATURED</Typography>
						<Typography variant="h3" color="secondary.dark">{usecase.title}</Typography>
						<Typography variant="subtitle1">{usecase.description}</Typography>
						{/* {usecase.link && 
						<Link href={usecase.link} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{marginLeft: -2}}>
								GO TO USE CASE
							</Button>
						</Link>} */}
					</Stack>
					<Stack
						direction="column"
						spacing={0.5}
						sx={{
							alignItems: 'flex-start',
							width: '100%'
						}}
					>
						{usecase.tutorial &&
							<Link href={usecase.tutorial} target="_blank" rel="noopener noreferrer">
								<Button
									color="secondary"
									endIcon={<Icon path={mdiVideoOutline} size={1} />}
									sx={{ marginLeft: -2, marginBottom: -2.5 }}
								>
									TUTORIAL
								</Button>
							</Link>
						}
						{usecase.link &&
							<Link href={usecase.link} target="_blank" rel="noopener noreferrer">
								<Button
									color="secondary"
									endIcon={<Icon path={mdiArrowRight} size={1} />}
									sx={{ marginLeft: -2 }}
								>
									GO TO USE CASE
								</Button>
							</Link>
						}
					</Stack>
				</Grid>
				<Grid item xs={12} sm={7} sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
					<CarouselCard usecase={usecase} />
				</Grid>
			</Grid>
		</Container>
	))
}



export default async function UseCasePage(props: {
	searchParams: Promise<{
		filter: string
	}>
}) {
	const searchParams = await props.searchParams
	const query_parser = parseAsJson<UseCaseParams>().withDefault({ limit: 10, skip: 0, tags: []})
	const parsedParams = query_parser.parseServerSide(searchParams.filter)
	const { limit = 10, skip=0 } = parsedParams
	const featured_usecases = await prisma.useCase.findMany({
		where: {
			featured: true
		},
		include: {
			source_dccs: {
				include: {
					dcc: true
				}
			}
		}
	})
	const count = await prisma.useCase.count()
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
	const usecases_all = await prisma.useCase.findMany({
		include: {
			source_dccs: {
				include: {
					dcc: true
				}
			}
		},
		// take: limit,
		// skip,
		...where_tags
	})
	const tag_counter: {[key:string]: number} = {}
	for (const tool of usecases_all) {
		for (const tag of tool.tags as string[] || []) {
			if (tag_counter[tag] === undefined) tag_counter[tag] = 0
			tag_counter[tag] = tag_counter[tag] + 1
		}
	}
	const usecases = usecases_all.slice(skip, skip+limit)
	return (
		<Grid container spacing={2} sx={{ marginTop: 2 }}>
			<Grid item xs={12} sx={{ display: { xs: "block", sm: "none", md: "none", lg: "none", xl: "none" } }}>
				<ClientCarousel title="" height={830}>
					<ServerCarousel usecases={featured_usecases} />
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{ display: { xs: "none", sm: "block", md: "none", lg: "none", xl: "none" } }}>
				<ClientCarousel title="" height={650}>
					<ServerCarousel usecases={featured_usecases} />
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{ display: { xs: "none", sm: "none", md: "block", lg: "block", xl: "block" } }}>
				<ClientCarousel title="">
					<ServerCarousel usecases={featured_usecases} />
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{ marginTop: 2 }}>
				<Typography sx={{ textAlign: "center" }} variant="h2" color="secondary">All Use Cases</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography sx={{ textAlign: "center" }} variant="subtitle1">
					Explore different use cases that utilizes data from different CFDE participating programs
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Grid container spacing={1}>
					{tags.length > 0 && tags.map(tag=>{
						const new_tags = (parsedParams.tags || []).filter(i=>i!== tag)
						return <Grid item key={tag}>
								<Link href={`/data/usecases?filter=${JSON.stringify({...parsedParams, tags: new_tags})}`}>
									<Chip key={tag} clickable color="primary" variant="filled" sx={{borderRadius: 2}} label={`${tag} (${tag_counter[tag]})`} icon={<Icon path={mdiCloseCircle} size={1} />}/>
								</Link>
							</Grid>
					})}
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<Grid container spacing={2}>
					{usecases.map((usecase) => (
						<Grid item xs={12} sm={6} key={usecase.title}>
							<UseCaseCard usecase={usecase} parsedParams={parsedParams} />
						</Grid>
					))}
				</Grid>
			</Grid>
			<Grid item xs={12} className="flex justify-center">
				<PaginationComponent limit={limit} skip={skip} count={usecases_all.length} />
			</Grid>
		</Grid>
	)
}