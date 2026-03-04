import { mdiTimerSand } from '@mdi/js';
import Icon from '@mdi/react';
import { Typography, Stack } from '@mui/material';
import { useState } from 'react';

export const Loading = () => {
	const [index, setIndex] = useState(0)
	const message = [
		"Processing your query...",
		"Thinking...",
		"Fetching information...",
		"Almost there..."
	]
	function updateValue() {
		if (index < message.length-1){
			setIndex(index+1)
		}
	}
	setInterval(updateValue, 12000);
	return <Stack direction={"row"} spacing={1} alignItems={"center"}>
			<Icon path={mdiTimerSand} style={{animation: "spin 2s linear infinite"}} size={1}/>
			<Typography variant="body1">{message[index]}</Typography>
		</Stack>
}