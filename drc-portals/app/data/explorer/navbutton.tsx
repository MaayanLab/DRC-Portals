'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import Icon from '@mdi/react';
import { mdiRobotOutline } from '@mdi/js';
import CFDEWheel from 'cfde-wheel'

export default function NavButton() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <SpeedDial
        ariaLabel="SpeedDial tooltip example"
        sx={{ 
			position: 'fixed', 
			bottom: 50,
			right: 50,
			}}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
		FabProps={{
			sx: {
				height: 70,
				width: 70
			}
		}}
      >
        <SpeedDialAction
            key={"CFDE Workbench Chatbot"}
            icon={<Icon className="text-center" path={mdiRobotOutline} size={2} />}
            tooltipTitle={"Open Chatbot"}
			FabProps={{
				href: "/data/chat",
				sx: {
					height: 70,
					width: 70
				}
			}}
            tooltipOpen
            onClick={handleClose}
          />
		  {/* <SpeedDialAction
		  	key={"CFDE Wheel"}
            icon={<Icon className="text-center" path={mdiRobotOutline} size={3} />}
            tooltipTitle={"Open CFDE Wheel"}
			FabProps={{
				component: CFDEWheel
			}}
            tooltipOpen
            onClick={handleClose}
		  /> */}
		  	
      </SpeedDial>
  );
}