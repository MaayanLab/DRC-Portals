import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Typography, Grid, Card, CardContent, Paper, Button, Stack, Box, Container } from "@mui/material";
import { Prisma } from "@prisma/client";
import Icon from '@mdi/react';
import { mdiArrowRight } from "@mdi/js"
import ClientCarousel from "./ClientCarousel";
import { parseAsJson } from "next-usequerystate";
import PaginationComponent from "./paginate";
type UseCaseWithDCC = Prisma.UseCaseGetPayload<{
    include: {
        source_dccs: {
          include: {
            dcc: true
          }
        }
    }
  }>

const UseCaseCard = ({usecase}:{usecase: UseCaseWithDCC}) => (
	<Card sx={{height: 375}}>
		<CardContent>
			<Grid container spacing={2}>
				<Grid item xs={8}>
					<Stack direction="column"
						justifyContent="space-between"
						alignItems="flex-start"
						spacing={2}
						sx={{height: "90%"}}
					>
						<Stack direction="column" spacing={2}>
							<div className="flex items-center space-x-2">
							{ usecase.tool_icon ? <Image src={usecase.tool_icon} alt={usecase.title} height={40} width={40}/>:
								<Image src={'/img/favicon.png'} alt={usecase.title} height={40} width={40}/>
							}
								<Typography color="secondary" variant="h5">{usecase.tool_name}</Typography>
							</div>
							<Typography variant="h4" color="secondary">{usecase.title}</Typography>
							<Typography variant={'caption'} color="secondary">
								{usecase.short_description}
							</Typography>
						</Stack>

						{usecase.link && 
						<Link href={usecase.link} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{marginLeft: -2}}>
								GO TO USE CASE
							</Button>
						</Link>}
					</Stack>
				</Grid>
				<Grid item xs={4}>
					<Paper elevation={0} className="flex flex-row justify-center relative" sx={{height: 350}}>
						{ usecase.image ? <Image src={usecase.image} alt={usecase.title} fill={true} style={{objectFit: "contain"}}/>:
							<Image src={'/img/favicon.png'} alt={usecase.title} fill={true} style={{objectFit: "contain"}}/>
						}
					</Paper>
				</Grid>
			</Grid>
		</CardContent>
    </Card>
)

const CarouselCard = ({usecase}: {usecase: UseCaseWithDCC}) => (
	<Box sx={{
		minHeight: {xs: 150, sm: 150, md: 300, lg: 300, xl: 300}, 
		width: {xs: 300, sm: 300, md: 640, lg: 640, xl: 640},
		textAlign: "center", 
		border: 1,
		borderRadius: 5,
		borderColor: "rgba(81, 123, 154, 0.5)", 
		padding: 2
	}}>
		<Link href={usecase.link || ''} target="_blank" rel="noopener noreferrer">
			<Box className="flex flex-col" sx={{minHeight: 300, boxShadow: "none", background: "#FFF"}}>
				<div className="flex grow items-center justify-center relative">
					<Image src={usecase.featured_image || usecase.image || '/img/favicon.png'} alt={usecase.title} fill={true} style={{objectFit: "contain"}}/>
				</div>
			</Box>
		</Link>
	</Box>
)
const ServerCarousel = ({usecases}: {usecases: Array<UseCaseWithDCC>}) => {
	return usecases.map( (usecase, i) => (
		<Container key={i} maxWidth="lg">
			<Grid container spacing={2}>
				<Grid item xs={12} sm={7} sx={{display: {xs: "block", sm: "block", md: "none", lg: "none", xl: "none"}}}>
					<CarouselCard usecase={usecase}/>
				</Grid>
				<Grid item xs={12} sm={5}>
					<Stack direction="column"
						alignItems="flex-start"
						spacing={2}
						sx={{height: "90%"}}
					>
						<Typography sx={{color: "#FFF", backgroundColor: "tertiary.main", textAlign: "center", paddingLeft: 3, paddingRight: 3}}variant="subtitle1">FEATURED</Typography>
						<Typography variant="h3" color="secondary.dark">{usecase.title}</Typography>
						<Typography variant="subtitle1">{usecase.description}</Typography>
						{usecase.link && 
						<Link href={usecase.link} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{marginLeft: -2}}>
								GO TO USE CASE
							</Button>
						</Link>}
					</Stack>
				</Grid>
				<Grid item xs={12} sm={7} sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
					<CarouselCard usecase={usecase}/>
				</Grid>
			</Grid>
		</Container>
    ))
}


export interface UseCaseParams {
	limit: number,
	skip: number
  }

export default async function UseCasePage({searchParams}: {searchParams: {
	filter: string
}}) {
	const query_parser = parseAsJson<UseCaseParams>().withDefault({limit: 10, skip: 0})
	const {limit=10, skip} = query_parser.parseServerSide(searchParams.filter)
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
	const usecases = await prisma.useCase.findMany({
		include: {
			source_dccs: {
				include: {
					dcc: true
				}
			}
		},
		take: limit,
		skip
	})	

    return (
        <Grid container spacing={2} sx={{marginTop: 2}}>
			<Grid item xs={12} sx={{display: {xs: "block", sm: "none", md: "none", lg: "none", xl: "none"}}}>
				<ClientCarousel title="" height={830}>
					<ServerCarousel usecases={featured_usecases}/>
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{display: {xs: "none", sm: "block", md: "none", lg: "none", xl: "none"}}}>
				<ClientCarousel title="" height={650}>
					<ServerCarousel usecases={featured_usecases}/>
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{display: {xs: "none", sm: "none", md: "block", lg: "block", xl: "block"}}}>
				<ClientCarousel title="">
					<ServerCarousel usecases={featured_usecases}/>
				</ClientCarousel>
			</Grid>
            <Grid item xs={12} sx={{marginTop: 2}}>
                <Typography sx={{textAlign: "center"}} variant="h3" color="secondary">ALL USE CASES</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography sx={{textAlign: "center"}} variant="body2">
                    Explore different use cases that utilizes data from different CFDE participating programs
                </Typography>
            </Grid>
			<Grid item xs={12}>
				<Grid container spacing={2}>
					{usecases.map((usecase)=>(
						<Grid item xs={12} sm={6} key={usecase.title}>
							<UseCaseCard usecase={usecase}/>
						</Grid>
					))}
				</Grid>
			</Grid>
			<Grid item xs={12} className="flex justify-center">
				<PaginationComponent limit={limit} skip={skip} count={count}/>
			</Grid>
		</Grid>
    )
}