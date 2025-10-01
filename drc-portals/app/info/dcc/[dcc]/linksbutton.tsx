'use client'
import Button from "@mui/material/Button";
import Icon from "@mdi/react";
import Image from "@/utils/image";
import { mdiArrowRight } from "@mdi/js";
import { useState } from "react";
import { Avatar, Box, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Typography } from "@mui/material";
import Link from "next/link";

const options = [
	{
		label: "CM4AI",
		alt: "CM4AI",
		width: 25,
		height: 25,
		href: "https://cm4ai.org/publications/",
		icon: "/img/cm4ai-logo.png"
	},
	{
		label: "AI-READi",
		alt: "AI-READi",
		width: 20,
		height: 20,
		href: "https://aireadi.org/publications",
		icon: "/img/aireadi-logo.png"
	},
	{
		label: "CHoRUS",
		alt: "CHoRUS",
		width: 15,
		height: 15,
		href: "https://chorus4ai.org/publications/",
		icon: "/img/chorus4ai.png"
	},
	{
		label: "Voice",
		alt: "Voice",
		width: 25,
		height: 25,
		href: "https://b2ai-voice.org/publications/",
		icon: "/img/b2aivoice.jpg"
	},
	{
		label: "Bridge2AI Center",
		alt: "Bridge2AI Center",
		width: 25,
		height: 25,
		href: "https://bridge2ai.org/publications/",
		icon: "/img/Bridge2AI.png"
	}
]
export default function PubButton({ dcc }: { dcc: string } ) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popper' : undefined;
	if (dcc !== "Bridge2AI") return null
	console.log("HERE")
	return (
		<>
			<Button color="secondary" onClick={handleClick} sx={{textAlign: "left"}} endIcon={<Icon path={mdiArrowRight} size={1} />}>
				{dcc} Publications
			</Button>
			<Menu id={id} open={open} anchorEl={anchorEl} onClose={handleClose}>
					<MenuList>
						{options.map(option=>(
							<Link key={option.label} onClick={handleClose} href={option.href} target="_blank" rel="noopener noreferrer">
								<MenuItem>
									<ListItemIcon>
										<Image src={option.icon} alt={option.alt} width={option.width} height={option.height}/>
									</ListItemIcon>
									<ListItemText><Typography variant="caption">{option.label}</Typography></ListItemText>									
								</MenuItem>
							</Link>
						))}
					</MenuList>
			</Menu>
		</>
	)
}
