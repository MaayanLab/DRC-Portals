'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { OutreachParams } from '.';
import { useEffect, useState } from 'react';
import { parseAsJson } from 'next-usequerystate';
export const ClientCheckbox = ({query_key, value, label}: {query_key: 'type' | 'tags' | 'status' | 'cfde_specific', value: string, label: string}) => {
	const router = useRouter()
	const pathname = usePathname()
	const [checked, setChecked] = useState(false)
	const searchParams = useSearchParams()
	const filter = searchParams.get('filter')
	const query_parser = parseAsJson<OutreachParams>().withDefault({type: ['outreach', 'training'], tags:[], expand_filter: true, status: ['active', 'recurring', 'past'], cfde_specific: true})
    const parsedParams: OutreachParams = query_parser.parseServerSide(filter || undefined)
	useEffect(()=>{
		if (query_key !== 'cfde_specific') {
			if (!parsedParams[query_key] || parsedParams[query_key].indexOf(value) === -1) {
				setChecked(false)
			} else {
				setChecked(true)
			}
		} else {
			if (parsedParams[query_key]) setChecked(true)
			else setChecked(false)
		}
	}, [parsedParams])
	
	const handleClick = () => {
		const query = query_parser.parseServerSide(filter || undefined)
		if (query_key !== 'cfde_specific') {
			if (typeof(query[query_key]) === 'undefined') query[query_key] = []
			if (query[query_key].indexOf(value) === -1) {
				query[query_key].push(value)
			} else {
				query[query_key] = query[query_key].filter(i=>i!==value)
			}
		} else {
			query[query_key] = !checked
		}
		router.push(`${pathname}?filter=${JSON.stringify(query)}`)
	}
	return (
		<FormControlLabel sx={{textTransform: "capitalize"}}  
			control={<Checkbox 
				onClick={handleClick} 
				checked={checked}/>} 
			label={label} />
	)
}