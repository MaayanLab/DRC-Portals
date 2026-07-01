"use client"
import { Container, Button, IconButton, Typography, Tooltip, Link, Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
 
  const centers = (radius:number) => ([
	{
			label: "coordination",
			endpoint: "https://cfdeconnect.org/",
			rotate: '216deg',
			position: {
				// right: "50%",
				// top: "0%"
				// top: 60
				transform: `translate(${-radius/20}px, ${radius/3.2 + 10}px)`,
				":hover": {
					transform: `translate(${-radius/20}px, ${radius/3.2 - 10}px)`,
				}
			},
			text_position: {
				top: "30%",
				left: "23%"
			},
			image_position: {
				top: "60%",
				left: "47%"
			}
		},
		{
			label: "cloud",
			endpoint: "https://cfdeworkspace.org/",
			rotate: "-72deg",
			position: {
				// left: "40%",
				// top: "70%"
				transform: `translate(${radius/2.5}px, ${radius/1.77 + 10}px)`,
				":hover": {
					transform: `translate(${radius/2.1}px, ${radius/1.77 + 10}px)`,
				}
			},
			text_position: {
				top: "50%",
				left: "55%"

			},
			image_position: {
				top: "50%",
				left: "20%"
			}
		},
		{
			label: "knowledge",
			endpoint: "https://cfdeknowledge.org/r/kc_landing",
			position: {
				transform: `translate(${radius/3.25}px, ${radius*1.07 + 10}px)`,
				":hover": {
					transform: `translate(${radius/3.25}px, ${radius*1.07 + 30}px)`,
				}
			},
			text_position: {
				top: "75%",
				left: "10%"
			},
			image_position: {
				top: "30%",
				left: "13%"
			}
		},
		{
			label: "training",
			endpoint: "https://orau.org/cfde-trainingcenter/",
			rotate: "72deg",
			position: {
				transform: `translate(${-radius/5}px, ${radius*1.135 + 10}px)`,
				":hover": {
					transform: `translate(${-radius/5}px, ${radius*1.135 + 30}px)`,
				}
			},
			text_position: {
				top: "65%",
				left: "15%"
			},
			image_position: {
				top: "20%",
				left: "45%"
			}
		},
		{
			label: "data",
			endpoint: "https://data.cfde.cloud/",
			rotate: "144deg",
			position: {
				transform: `translate(${-radius/2.4}px, ${radius/1.49 + 10}px)`,
				":hover": {
					transform: `translate(${-radius/2}px, ${radius/1.49 + 10}px)`,
					// width: radius
				}
			},
			text_position: {
				top: "25%",
				left: "25%"
			},
			image_position: {
				top: "35%",
				left: "60%"
			}
		},
	])

const default_radius = 280
// const radius_small = 200


function useViewportDimensions() {
  const [dimensions, setDimensions] = useState(() => ({ height: 700, width: 700 }))
  useEffect(() => {
    const ctx: any = {}
    const listener = () => {
      if (ctx.resizeTimeout) clearTimeout(ctx.resizeTimeout);
      ctx.resizeTimeout = setTimeout(() => {
        setDimensions({
          height: window.innerHeight,
          width: window.innerWidth,
        })
      }, 200);
    };
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [])
  return dimensions
}

export default function InteractiveNavComponent({dccs, handleClose, new_window=false}: {dccs: Array<any>, handleClose: any, new_window?: boolean}) {
	const pie_chunk = 2*Math.PI/(dccs.length)
	const dimensions = useViewportDimensions()
	const radius = Math.max(Math.min(dimensions.width/2, dimensions.height/2, default_radius) - 30, 100)
	const divRef = useRef<any>(null); // Ref for HTML Element
	useEffect(()=>{
		if (divRef.current) {
			divRef.current.addEventListener("click", handleClose)
		}
	}, [divRef.current])
	const link_props: {[key: string]: string} = {}
	if (new_window)
		link_props.target="_blank" 
		link_props.rel="noopener noreferrer"
	return (
			<Container sx={{position: "absolute", margin: 0, top: "50%", left: "50%",  transform: "translate(-50%, -50%)"}}>
				<Container sx={{position: "relative", display: "flex", justifyContent: "center", marginTop: 10, height: radius*2.9}}>
					{dccs.map((dcc:any, i:number)=>{
						const angle = pie_chunk * i
						const x = radius * Math.cos(angle)
						const y = radius * Math.sin(angle) + radius
						return (
							<Tooltip title={<Typography>{dcc.description}</Typography>} key={dcc.label || ''} >
								<IconButton 
									href={dcc.homepage}
									{...link_props}
									// disableElevation
									// onClick={handleClose}
									sx={{
										background: "#fff", 
										borderRadius: 1000, 
										width: radius/3.5, 
										height:  radius/3.5,
										position: "absolute",
										transform: `translate(${x}px, ${y}px)`,
										":hover": {
											background: "#C3E1E6", 
										}
									}}
								>
									<Box 
										sx={{
											position: 'relative',
											width: radius/5,
											overflow: 'hidden',
											height: radius/5
										}}
									>
										<img src={dcc.icon || ''} alt={dcc.short_label || ''} style={{
											top: 0,
											left: 0,
											position: 'absolute',
											maxWidth: '100%',
											height: '100%',
											objectFit: 'contain',
											color: 'transparent'
										}}/>
									</Box>
								</IconButton>
							</Tooltip>
						)
					})}
					
					{centers(radius).map((center, i)=>{
						return (
							<Button 
								key={center.label} 
								href={center.endpoint}
								{...link_props}
								// onClick={handleClose}
								sx={{
									position: "absolute",
									width: radius/1.47,
									height: radius/1.47,
									// transform: `translate(${x}px, ${y}px) rotate(${center.rotate || '0deg'})`,
									...(center.position || {}),
							}}>
								<Container sx={{
									position: "relative",
									width: radius/1.65,
									height: radius/1.65,
								}}>
									<img src={`https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/${center.label}.png`} alt={center.label} loading="lazy" decoding="async"  sizes="100vw" style={{
										position: "absolute",
										height: "100%",
										width: "100%",
										maxWidth: "100%",
										inset: "0px",
										objectFit: "contain",
										color: "transparent",
										display: "block",
										transform: `rotate(${center.rotate || '0deg'})`,
									}}
										/>
									<Typography sx={{color: "#FFF", position: "absolute", textTransform: "uppercase", fontSize: radius/17.5, ...(center.text_position || {})}}>
										<b>{center.label}</b>
									</Typography>
									<Container>
										<img src={`https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/${center.label} 1.png`} alt={center.label} style={{position: "absolute", width: radius/7, height: radius/7, zIndex: 100, ...(center.image_position || {})}}/>
									</Container>
									{/* <Container sx={{display: {md: 'none', xs: 'block'}}}>
										<img src={`https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/${center.label} 1.png`} alt={center.label} style={{position: "absolute", zIndex: 100, width: 30, height: 30, ...(center.image_position_small || {})}}/>
									</Container> */}
										
								</Container>
							</Button>
						)
					})}
					<Button variant="contained"
						// onClick={handleClose}
						href="https://info.cfde.cloud" 
						{...link_props}
						sx={{
							background: "#fff", 
							borderRadius: 1000, 
							width: radius/2.3, 
							height: radius/2.3,
							position: "absolute",
							transform: `translate(${radius/250}px, ${radius/1.14 + 10}px)`,
							padding: 1,
							zIndex: 100,
							":hover": {
								background: "#C3E1E6", 
							}
						}}
					>
						<Box 
							sx={{
								position: 'relative',
								width: radius/3,
								overflow: 'hidden',
								height: radius/3,
								zIndex: 1000,
							}}
						>
							<img src={'https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/CFDE_logo.png'} alt={'CFDE_Logo'} style={{
								top: 0,
								left: 0,
								position: 'absolute',
								maxWidth: '100%',
								height: '100%',
								objectFit: 'contain',
								color: 'transparent'
							}}/>
						</Box>
					</Button>
					<Container
						sx={{
							background: "#000", 
							borderRadius: "50%", 
							width: radius/1.2, 
							height: radius/1.2,
							position: "absolute",
							transform: `translate(${radius/250}px, ${radius/1.46 + 10}px)`,
							opacity: "0.5"
						}}
					></Container>
				</Container>
			</Container>
	)
}