'use client'
import { useState } from "react"
import {  Modal, Box, Tooltip, IconButton  } from "@mui/material"
import { OutreachWithDCCAndCenter } from "@/components/misc/Outreach"
import { OutreachParams } from "./page"
import Icon from '@mdi/react';
import { mdiArrowExpandAll,} from '@mdi/js';
import { OutreachCard } from "./card"

export const ExpandButton = ({e, parsedParams}: {e: OutreachWithDCCAndCenter, parsedParams: OutreachParams}) => {
	const [open, setOpen] = useState(false)

	return (
		<>
			<Tooltip title={"Expand"}>
				<IconButton color="secondary" onClick={()=>setOpen(true)}>
					<Icon path={mdiArrowExpandAll} size={1} />
				</IconButton>
			</Tooltip>
			<Modal
				open={open}
				onClose={()=>setOpen(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 700,
					minHeight: 400,
					p: 4,
					}}>
					<OutreachCard e={e} expanded={true} parsedParams={parsedParams} />
				</Box>
			</Modal>	
		</>
	)
}

