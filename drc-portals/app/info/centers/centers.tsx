import { Container, Button, Typography, Tooltip } from "@mui/material";
import Image from "next/image";
import React from "react";
import { DCC } from "@prisma/client";
import Link from "next/link";


const CentersComponent = () => {
	const centers = [
		{
			label: "cloud",
			endpoint: "/info/centers/CWIC",
			rotate: "-72deg",
			position: {
				left: 85,
				top: 70
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
				top: 210
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
				top: 227
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
				top: 98
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
				top: 0
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
	

	return (
		<>
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
						top: 155,
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
						top: 100,
						left: -50,
						opacity: "0.5"
					}}
				></Container>
		</>
	)
}

export default CentersComponent