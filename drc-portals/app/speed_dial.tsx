'use client'
import {InteractiveNavComponent} from 'cfde-wheel'
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Icon from '@mdi/react';
import { mdiRobot } from '@mdi/js';
import { useEffect, useState } from 'react';
import Image from '@/utils/image';
import { Fab, Modal, Tooltip } from '@mui/material';

export interface dccType {
	id: string
	label: string
	homepage: string
	icon: string
	description?: string 
}

const SpeedDialButton = () => {
	const [dccs, setDccs] = useState<Array<dccType>>([])
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	useEffect(()=>{
		const fetch_dccs = async () => {
			try {
				console.log("Fetching")
				const r = await fetch("https://raw.githubusercontent.com/MaayanLab/cfde-wheel/refs/heads/main/src/dccs.json")
				setDccs(await r.json())
			} catch (error) {
				setDccs([])
			}
			
		}
		fetch_dccs()
	}, [])

	return (
		<>
			<Fab size="large" onClick={handleOpen} sx={{ position: 'fixed', bottom: 130, right: 50 }}>
				<Image src="https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/cfde_unified_icon.svg" alt={'nav-but'} width={120} height={120}/>
			</Fab>
			<Fab size="large" href='/data/chat' sx={{ position: 'fixed', bottom: 60, right: 50 }}>
				<Icon path={mdiRobot} size={2} />
			</Fab>
			{/* <SpeedDial
				ariaLabel="SpeedDial basic example"
				sx={{ position: 'fixed', bottom: 60, right: 50 }}
				icon={<SpeedDialIcon />}
				>
					<SpeedDialAction
					icon={<Image src="https://cfde-drc.s3.us-east-2.amazonaws.com/assets/img/cfde_unified_icon.svg" alt={'nav-but'} width={120} height={120}/>}
					tooltipTitle="Open CFDE Wheel"
					FabProps={{onClick:handleOpen, size: "large"}}
					/>
					<SpeedDialAction
					icon={<Icon path={mdiRobot} size={2} />}
					tooltipTitle="Open CFDE Workbench Chatbot"
					FabProps={{href: '/data/chat', size: "large"}}
					/>
			</SpeedDial> */}
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<>
					<InteractiveNavComponent dccs={dccs} handleClose={handleClose}/>
				</>
			</Modal>
		</>
	)
}

export default SpeedDialButton