'use client'
import { useEffect } from "react"
import { useWidth } from "../Carousel/helper"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { OutreachParams } from '.';
import { parseAsJson } from 'next-usequerystate';
export const ClientExpander = ({children}: {children: React.ReactNode}) => {
	const width = useWidth()
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const filter = searchParams.get('filter')
	const query_parser = parseAsJson<OutreachParams>().withDefault({type: ['outreach', 'training'], tags:[], expand_filter: false, status: ['active', 'recurring', 'past'], cfde_specific: false})
    const parsedParams: OutreachParams = query_parser.parseServerSide(filter || undefined)
	
	useEffect(()=>{
		console.log(width)
		const query: OutreachParams = parsedParams
		router.push(`${pathname}?filter=${JSON.stringify(query)}`)
	},[])
	return children
}

export default ClientExpander