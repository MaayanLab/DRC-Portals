'use client'
import { Box } from "@mui/material"
import {InteractiveNavComponent} from "cfde-wheel"
export default function Wheel({dccs}: {dccs: any}) {
	return <Box sx={{position: "relative", width: "100%", height: 600, display: "flex", alignItems: "center"}}>
		<Box sx={{position: "absolute", left: 0, width: "100%"}}>
			<InteractiveNavComponent  dccs={dccs}/>
			</Box>
		</Box>
}