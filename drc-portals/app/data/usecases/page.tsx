import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Typography, Grid, Card, CardContent, Paper, Button, Stack, Box } from "@mui/material";
import { Prisma } from "@prisma/client";
import MasonryClient from "@/components/misc/MasonryClient";
import Icon from '@mdi/react';
import { mdiArrowRight } from "@mdi/js"
import ClientCarousel from "@/components/misc/Carousel/ClientCarousel";
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
const shuffle = (array: UseCaseWithDCC[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 

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
						<Link href={usecase.link}>
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
		minHeight: 300, 
		width: 640,
		textAlign: "center", 
		border: 1,
		borderRadius: 5,
		borderColor: "rgba(81, 123, 154, 0.5)", 
		padding: 2
	}}>
		<Link href={usecase.link || ''} target="_blank" rel="noopener noreferrer">
			<Box className="flex flex-col" sx={{minHeight: 300, boxShadow: "none", background: "#FFF"}}>
				<div><Typography variant="subtitle2" color="secondary">{usecase.title}</Typography></div>
				<div className="flex grow items-center justify-center relative">
					<Image src={usecase.featured_image || usecase.image || '/img/favicon.png'} alt={usecase.title} fill={true} style={{objectFit: "contain"}}/>
				</div>
			</Box>
		</Link>
	</Box>
)
const ServerCarousel = ({usecases}: {usecases: Array<UseCaseWithDCC>}) => {
	return usecases.map( (item, i) => (
        <div key={i}><CarouselCard usecase={item}/></div>
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
			<Grid item xs={12} sm={5}>
				<Stack direction="column"
					alignItems="flex-start"
					spacing={2}
					sx={{height: "90%"}}
				>
					<Typography sx={{color: "#FFF", background: "#7187c3", textAlign: "center", paddingLeft: 3, paddingRight: 3}}variant="subtitle1">FEATURED</Typography>
					<Typography variant="h3" color="secondary.dark">{featured_usecases[0].title}</Typography>
					<Typography variant="subtitle1">{featured_usecases[0].description}</Typography>
					{featured_usecases[0].link && 
					<Link href={featured_usecases[0].link}>
						<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{marginLeft: -2}}>
							GO TO USE CASE
						</Button>
					</Link>}
				</Stack>
			</Grid>
			<Grid item xs={12} sm={7}>
				<CarouselCard usecase={featured_usecases[0]}/>
			</Grid>
            <Grid item xs={12} sx={{marginTop: 10}}>
                <Typography sx={{textAlign: "center"}} variant="h3" color="secondary">USE CASES</Typography>
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