import { Container, Button, Typography, Tooltip } from "@mui/material";
import Image from "next/image";
import React from "react";
import { DCC } from "@prisma/client";
import Link from "next/link";


const InteractiveNavComponent = ({dccs, disableDCC}: {dccs: DCC[], disableDCC?: boolean}) => {
	const centers = [
		{
			label: "cloud",
			endpoint: "/info/centers/CWIC",
			rotate: "-72deg",
			position: {
				left: 85,
				top: 310
			},
			text_position: {
				top: 80,
				left: "50%"
			},
			image_position: {
				top: 100,
				left: "15%"
			}
		},
		{
			label: "knowledge",
			endpoint: "/info/centers/KC",
			position: {
				left: 60,
				top: 450
			},
			text_position: {
				top: 120,
				left: "10%"
			},
			image_position: {
				top: 50,
				left: "17%"
			}
		},
		{
			label: "training",
			endpoint: "/info/centers/TC",
			rotate: "72deg",
			position: {
				left: -83,
				top: 467
			},
			text_position: {
				top: 105,
				left: "10%"
			},
			image_position: {
				top: 35,
				left: "35%"
			}
		},
		{
			label: "data",
			endpoint: "/info/centers/DRC",
			rotate: "144deg",
			position: {
				left: -143,
				top: 338
			},
			text_position: {
				top: 50,
				left: "25%"
			},
			image_position: {
				top: 75,
				left: "60%"
			}
		},
		{
			label: "coordination",
			endpoint: "/info/centers/ICC",
			rotate: '216deg',
			position: {
				left: -39,
				top: 240
			},
			text_position: {
				top: 60,
				left: "23%"
			},
			image_position: {
				top: 110,
				left: "47%"
			}
		},
	]
	const pie_chunk = 2*Math.PI/dccs.length
	const radius = 280
	const descriptions: {[key:string]: string} = {
		KOMP2: 'Knockout Mouse Phenotyping',
		HuBMAP: 'Cellular spatial atlas of the human body',
		Bridge2AI: 'Biomedical AI ↔ people, data & ethics',
		HMP: 'Human microbiome in health and disease',
		SPARC: 'Bridging the body and brain',
		MoTrPAC: 'The molecular map of exercise',
		GlyGen: 'Computational and informatics resources for glycoscience',
		GTEx: 'Gene expression and regulation across human tissues',
		'Kids First': 'Data, tools, and resources empowering pediatric research',
		UDN: 'Improving diagnosis of rare and undiagnosed conditions',
		'4DN': 'Nuclear organization in space and time',
		A2CPS: 'Understanding the complex biological processes underlying chronic pain',
		Metabolomics: 'Metabolomics',
		LINCS: 'Omics signatures for drug & target discovery',
		ExRNA: 'Extracellular RNA communication',
		SenNet: 'Mapping senescent cells',
		IDG: 'Illuminating GPCRs, kinases, ion channels, & other drug targets',
		H3Africa: 'Improving the health of African populations'
	  }
	const additional = [
		{
			short_label: "SMaHT",
			icon: "/img/interactive/smath.png",
			homepage: "https://commonfund.nih.gov/somatic-mosaicism-across-human-tissues-smaht"
		},
		{
			short_label: "ComPASS",
			icon: "/img/interactive/compass.png",
			homepage: "https://commonfund.nih.gov/compass"
		},
		{
			short_label: "NPH",
			icon: "/img/interactive/nph.png",
			homepage: "https://commonfund.nih.gov/nutritionforprecisionhealth"
		}
	]

	const additional_label = ['NPH', 'ComPASS', 'SMaHT']
	return (
		<Container sx={{position: "relative", width: 200}}>
				{!disableDCC && [...dccs, ...additional].sort((a,b)=>(a.short_label || '') > (b.short_label || '') ? -1: 1).map((dcc, i)=>{
					const angle = pie_chunk * i
					const x = radius * Math.cos(angle)
					const y = radius * Math.sin(angle) + 400
					return (
						<Tooltip title={<Typography>{descriptions[dcc.short_label || '']}</Typography>} key={dcc.short_label || ''} >
							<Button variant="contained" 
								// disableElevation
								sx={{
									background: "#fff", 
									borderRadius: 1000, 
									width: 90, 
									height: 90,
									position: "absolute",
									transform: `translate(${x}px, ${y}px)`,
								}}
							>
								{ additional_label.indexOf(dcc.short_label || '') > -1 ?
								<Link href={dcc.homepage} target="_blank" rel="noopener noreferrer">
									<Image src={dcc.icon || ''} alt={dcc.short_label || ''} width={70} height={70}/>
								</Link>:
								<Link href={`/info/dcc/${dcc.short_label}`}>
									<Image src={dcc.icon || ''} alt={dcc.short_label || ''} width={70} height={70}/>
								</Link>
								}
							</Button>
						</Tooltip>
					)
				})}
				{centers.map((center, i)=>{
					return (
						<Button key={center.label} sx={{
							position: "absolute",
							width: 190,
							height: 190,
							// transform: `translate(${x}px, ${y}px) rotate(${center.rotate || '0deg'})`,
							...(center.position || {})
						}}>
							<Container sx={{
								position: "relative",
								width: 190,
								height: 190,
							}}>
								<Link href={center.endpoint}>
									<Image src={`/img/interactive/${center.label}.png`} alt={center.label} fill={true} style={{objectFit: "contain", transform: `rotate(${center.rotate || '0deg'})`}}/>
									<Typography sx={{color: "#FFF", position: "absolute", textTransform: "uppercase", ...(center.text_position || {})}}>
										<b>{center.label}</b>
									</Typography>
									<Image src={`/img/interactive/${center.label} 1.png`} alt={center.label} width={40} height={40} style={{position: "absolute", zIndex: 100, ...(center.image_position || {})}}/>
								</Link>
							</Container>
						</Button>
					)
				})}
				<Button variant="contained" 
					sx={{
						background: "#fff", 
						borderRadius: 1000, 
						width: 120, 
						height: 120,
						position: "absolute",
						top: 395,
						left: 5,
						padding: 1,
						zIndex: 100,
					}}
				>
					<Link href="/info">
						<Image src={'/img/interactive/CFDE_logo.png'} alt={'cfde_logo'} width={150} height={150} style={{zIndex: 100}}/>
					</Link>
				</Button>
				<Container
					sx={{
						background: "#000", 
						borderRadius: "50%", 
						width: 230, 
						height: 230,
						position: "absolute",
						top: 340,
						left: -50,
						opacity: "0.5"
					}}
				></Container>
		</Container>
	)
}

export default InteractiveNavComponent