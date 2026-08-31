'use client'

import { Stack, Switch, SwitchProps } from "@mui/material"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Icon from '@mdi/react';
import { mdiWeatherSunny, mdiWeatherNight } from '@mdi/js';
import { styled } from '@mui/material/styles';

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#333',
        opacity: 1,
        border: 0,
        ...theme.applyStyles('dark', {
          backgroundColor: '#9E9E9E',
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#9E9E9E',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D',
    }),
  },
}));

export const ModeSwitch = () => {
	const searchParams = useSearchParams()
	const mode = searchParams.get('mode') || 'light'
	const router = useRouter()
	const pathname = usePathname()
	return (
		<Stack direction={"row"} sx={{alignItems: "center", mt: 5}}>
			<Icon path={mdiWeatherSunny} size={1} style={{color: mode === 'dark' ? '#E9E9EA': "#333"}}/>
			<IOSSwitch sx={{ m: 1 }} checked={mode==='dark'} onClick={()=>router.push(`${pathname}${mode === 'dark' ? "": "?mode=dark"}`)}/>
			<Icon path={mdiWeatherNight} size={1} style={{color: mode === 'dark' ? '#E9E9EA': "#333"}}/>
		</Stack>
	)
}