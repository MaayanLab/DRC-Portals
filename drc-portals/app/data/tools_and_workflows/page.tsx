import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Typography, Grid, Card, CardContent, Paper, Button, Stack, Box, Container } from "@mui/material";

import Icon from '@mdi/react';
import { mdiArrowRight } from "@mdi/js"
import { Prisma } from "@prisma/client";
import ClientCarousel from "../usecases/ClientCarousel";
type ToolsWithPublications = Prisma.ToolGetPayload<{
    include: {
        publications: true
    }
  }>

  const ToolCard = ({tool}:{tool: ToolsWithPublications}) => (
	<Card sx={{height: 280}}>
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
							{ tool.icon ? <Image src={tool.icon} alt={tool.label} height={40} width={40}/>:
								<Image src={'/img/favicon.png'} alt={tool.label} height={40} width={40}/>
							}
							</div>
							<Typography variant="h4" color="secondary">{tool.label}</Typography>
							<Typography variant={'caption'} color="secondary">
								{tool.short_description}
							</Typography>
                            {tool.publications.length > 0 &&
                            <div className="flex items-center">
                                <Typography variant="subtitle1"><b>Publications:</b></Typography>
                                {tool.publications.map((pub, i)=>(
                                    <Link href={`https://doi.org/${pub.doi}`} key={i} target="_blank" rel="noopener noreferrer">
                                        <Button color="secondary">
                                            {pub.doi}
                                        </Button>
                                    </Link>
                                ))}
                                </div>
                            }
						</Stack>

						{tool.url && 
						<Link href={tool.url} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{marginLeft: -2}}>
								GO TO {tool.url.indexOf('github.com') > -1 ? 'GITHUB': tool.label.toUpperCase()}
							</Button>
						</Link>}
					</Stack>
				</Grid>
				<Grid item xs={4}>
					<Paper elevation={0} className="flex flex-row justify-center relative" sx={{height: 200}}>
						{ tool.image ? <Image src={tool.image} alt={tool.label} fill={true} style={{objectFit: "contain"}}/>:
							<Image src={tool.icon || '/img/favicon.png'} alt={tool.label} fill={true} style={{objectFit: "contain"}}/>
						}
					</Paper>
				</Grid>
			</Grid>
		</CardContent>
    </Card>
)

const CarouselCard = ({tool}: {tool: ToolsWithPublications}) => (
	<Box sx={{
		minHeight: 300, 
		width: 640,
		textAlign: "center", 
		border: 1,
		borderRadius: 5,
		borderColor: "rgba(81, 123, 154, 0.5)", 
		padding: 2
	}}>
		<Link href={tool.url || ''} target="_blank" rel="noopener noreferrer">
			<Box className="flex flex-col" sx={{minHeight: 300, boxShadow: "none", background: "#FFF"}}>
				<div className="flex grow items-center justify-center relative">
					<Image src={tool.image || tool.icon || '/img/favicon.png'} alt={tool.label} fill={true} style={{objectFit: "contain"}}/>
				</div>
			</Box>
		</Link>
	</Box>
)
const ServerCarousel = ({tools}: {tools: Array<ToolsWithPublications>}) => {
	return tools.map( (tool, i) => (
		<Container key={i} maxWidth="lg">
			<Grid container spacing={2}>
				<Grid item xs={12} sm={5}>
					<Stack direction="column"
						alignItems="flex-start"
						spacing={2}
						sx={{height: "90%"}}
					>
						<Typography sx={{color: "#FFF", background: "#7187c3", textAlign: "center", paddingLeft: 3, paddingRight: 3}}variant="subtitle1">FEATURED</Typography>
						<Typography variant="h3" color="secondary.dark">{tool.label}</Typography>
						<Typography variant="subtitle1">{tool.description}</Typography>
						{tool.url && 
						<Link href={tool.url} target="_blank" rel="noopener noreferrer">
							<Button color="secondary" endIcon={<Icon path={mdiArrowRight} size={1} />} sx={{marginLeft: -2}}>
                                GO TO {tool.url.indexOf('github.com') > -1 ? 'GITHUB': tool.label.toUpperCase()}
							</Button>
						</Link>}
					</Stack>
				</Grid>
				<Grid item xs={12} sm={7}>
					<CarouselCard tool={tool}/>
				</Grid>
			</Grid>
		</Container>
    ))
}


export default async function ToolsPage() {
    const featured_tools = await prisma.tool.findMany({
        where: {
            featured: true
        },
        include: {
            publications: true
        },
        orderBy: [{publications: {_count: 'desc'}}, {label: 'asc'}, {id: 'asc'}],
    })
    const tools = await prisma.tool.findMany({
        include: {
            publications: true
        },
        orderBy: [{publications: {_count: 'desc'}}, {label: 'asc'}, {id: 'asc'}],
    })

    return (
        <Grid container spacing={2} sx={{marginTop: 2}}>
            <Grid item xs={12}>
				<ClientCarousel title="">
					<ServerCarousel tools={featured_tools}/>
				</ClientCarousel>
			</Grid>
			<Grid item xs={12} sx={{marginTop: 2}}>
                <Typography sx={{textAlign: "center"}} variant="h3" color="secondary">ALL TOOLS AND WORKFLOWS</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography sx={{textAlign: "center"}} variant="body2">
                    Explore different tools and workflows that utilizes data from different CFDE participating programs
                </Typography>
            </Grid>
			<Grid item xs={12}>
				<Grid container spacing={2}>
					{tools.map((tool)=>(
						<Grid item xs={12} sm={6} key={tool.label}>
							<ToolCard tool={tool}/>
						</Grid>
					))}
				</Grid>
			</Grid>
		</Grid>
    )
}