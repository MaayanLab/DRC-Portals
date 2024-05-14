import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Typography, Grid, Card, CardContent, Paper, Button, Stack, CardActions } from "@mui/material";

import Icon from '@mdi/react';
import { mdiArrowRight } from "@mdi/js"
import Avatar from "@mui/material/Avatar";
import { Prisma } from "@prisma/client";
import MasonryClient from "@/components/misc/MasonryClient";
type ToolsWithPublications = Prisma.ToolGetPayload<{
    include: {
        publications: true
    }
  }>

  const ToolCard = ({tool}:{tool: ToolsWithPublications}) => (
	<Card sx={{height: 270}}>
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
						</Stack>

						{tool.url && 
						<Link href={tool.url}>
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

export default async function ToolsPage() {
    const tools = await prisma.tool.findMany({
        include: {
            publications: true
        },
        orderBy: [{publications: {_count: 'desc'}}, {label: 'asc'}, {id: 'asc'}],
    })

    return (
        <Grid container spacing={2} sx={{marginTop: 2}}>
			<Grid item xs={12} sx={{marginTop: 10}}>
                <Typography sx={{textAlign: "center"}} variant="h3" color="secondary">TOOLS AND WORKFLOWS</Typography>
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