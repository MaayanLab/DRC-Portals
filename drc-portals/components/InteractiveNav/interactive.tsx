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
				left: {md: 85, xs: 60},
				top: {md: 310, xs: 320}
			},
			text_position: {
				top: {md: 80, xs: 70},
				left: {md: "50%", xs: "65%"},

			},
			image_position: {
				top: 100,
				left: "15%"
			},
			image_position_small: {
				top: 70,
				left: "25%"
			}
		},
		{
			label: "knowledge",
			endpoint: "/info/centers/KC",
			position: {
				left: {md: 60, xs: 40},
				top: {md: 450, xs: 423}
			},
			text_position: {
				top: {md: 120, xs: 100},
				left: "10%"
			},
			image_position: {
				top: 50,
				left: "17%"
			},
			image_position_small: {
				top: 45,
				left: "17%"
			}
		},
		{
			label: "training",
			endpoint: "/info/centers/TC",
			rotate: "72deg",
			position: {
				left: {md: -83, xs: -65},
				top: {md: 467, xs: 434}
			},
			text_position: {
				top: {md: 105, xs: 90},
				left: "10%"
			},
			image_position: {
				top: 35,
				left: "35%"
			},
			image_position_small: {
				top: 33,
				left: "35%"
			}
		},
		{
			label: "data",
			endpoint: "/info/centers/DRC",
			rotate: "144deg",
			position: {
				left: {md: -143, xs: -110},
				top: {md: 338, xs: 337}
			},
			text_position: {
				top: {md: 50, xs: 50},
				left: {md: "25%", xs: "10%"}
			},
			image_position: {
				top: 75,
				left: "60%"
			},
			image_position_small: {
				top: 55,
				left: "45%"
			}
		},
		{
			label: "coordination",
			endpoint: "/info/centers/ICC",
			rotate: '216deg',
			position: {
				left: {md: -39, xs: -31},
				top: {md: 240, xs: 265}
			},
			text_position: {
				top: {md: 60, xs: 39},
				left: "23%"
			},
			image_position: {
				top: 110,
				left: "47%"
			},
			image_position_small: {
				top: 65,
				left: "47%"
			}
		},
	]
	
	
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
		H3Africa: 'Improving the health of African populations',
		SMaHT: "Mapping somatic mutations' health implications",
		ComPASS: "Community-led research on structural drivers of health",
		NPH: "Predictive algorithms to advance nutrition research"
	  }
	const additional = [
		{
			short_label: "SMaHT",
			icon: "/img/interactive/smath.png",
			homepage: "https://commonfund.nih.gov/somatic-mosaicism-across-human-tissues-smaht"
		},
		{
			short_label: "ComPASS",
			icon: "/img/interactive/compass.svg",
			homepage: "https://commonfund.nih.gov/compass"
		},
		{
			short_label: "NPH",
			icon: "/img/interactive/nph.png",
			homepage: "https://commonfund.nih.gov/nutritionforprecisionhealth"
		}
	]
	
	const additional_label = ['NPH', 'ComPASS', 'SMaHT']
	const ordering = [ "Kids First", "A2CPS", "HuBMAP", "ComPASS", "4DN", "LINCS", "IDG", "NPH", 
		"GlyGen", "Bridge2AI", "MoTrPAC", "Metabolomics", "SPARC", "SMaHT", "HMP", "GTEx", "SenNet", "ExRNA",]
	const all_dccs: {[key:string]: any} = [...dccs, ...additional].reduce((acc, i)=>({...acc, [`${i.short_label}`]: i}), {})
	const pie_chunk = 2*Math.PI/(ordering.length)

	const radius = 280
	const radius_small = 195
	return (
		<Container sx={{position: "relative", width: {md: 200, xs: 100}}}>
				{!disableDCC && ordering.map((dcc_name, i)=>{
					const dcc = all_dccs[dcc_name as string]
					const angle = pie_chunk * i
					const x = radius * Math.cos(angle)
					const y = radius * Math.sin(angle) + 400
					const x_small = radius_small * Math.cos(angle)
					const y_small = radius_small * Math.sin(angle) + 400
					return (
						<Tooltip title={<Typography>{descriptions[dcc.short_label || '']}</Typography>} key={dcc.short_label || ''} >
							<Button variant="contained" 
								// disableElevation
								sx={{
									background: "#fff", 
									borderRadius: 1000, 
									width: {md: 90, xs: 60}, 
									height:  {md: 90, xs: 60},
									position: "absolute",
									transform: {md: `translate(${x}px, ${y}px)`, xs: `translate(${x_small}px, ${y_small}px)`},
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
							width: {md: 190, xs: 150},
							height: {md: 190, xs: 150},
							// transform: `translate(${x}px, ${y}px) rotate(${center.rotate || '0deg'})`,
							...(center.position || {})
						}}>
							<Container sx={{
								position: "relative",
								width: {md: 190, xs: 150},
								height: {md: 190, xs: 150},
							}}>
								<Link href={center.endpoint}>
									<Image src={`/img/interactive/${center.label}.png`} alt={center.label} fill={true} style={{objectFit: "contain", transform: `rotate(${center.rotate || '0deg'})`}}/>
									<Typography sx={{color: "#FFF", position: "absolute", textTransform: "uppercase", fontSize: {md: 16, xs: 11.5}, ...(center.text_position || {})}}>
										<b>{center.label}</b>
									</Typography>
									<Container sx={{display: {md: 'block', xs: 'none'}}}>
										<Image src={`/img/interactive/${center.label} 1.png`} alt={center.label} width={40} height={40} style={{position: "absolute", zIndex: 100, ...(center.image_position || {})}}/>
									</Container>
									<Container sx={{display: {md: 'none', xs: 'block'}}}>
										<Image src={`/img/interactive/${center.label} 1.png`} alt={center.label} width={30} height={30} style={{position: "absolute", zIndex: 100, ...(center.image_position_small || {})}}/>
									</Container>
								</Link>
							</Container>
						</Button>
					)
				})}
				<Button variant="contained" 
					sx={{
						background: "#fff", 
						borderRadius: 1000, 
						width: {md: 120, xs: 110}, 
						height: {md: 120, xs: 110},
						position: "absolute",
						top: {md: 395, xs: 365},
						left: {md: 5, xs: -5},
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
						width: {md: 230, xs: 200}, 
						height: {md: 230, xs: 200},
						position: "absolute",
						top: {md: 340, xs: 320},
						left: {md: -50, xs: -50},
						opacity: "0.5"
					}}
				></Container>
		</Container>
	)
}

export default InteractiveNavComponent