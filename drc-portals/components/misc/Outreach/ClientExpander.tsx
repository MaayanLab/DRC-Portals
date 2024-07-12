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
	const query_parser = parseAsJson<OutreachParams>().withDefault({type: ['outreach', 'training'], tags:[], expand_filter: true, status: ['active', 'recurring'], cfde_specific: true})
    const parsedParams: OutreachParams = query_parser.parseServerSide(filter || undefined)
	
	useEffect(()=>{
		const query: OutreachParams = {
			...parsedParams,
			expand_filter: ['xs', 'sm'].indexOf(width) === -1
		}
		router.push(`${pathname}?filter=${JSON.stringify(query)}`)
	},[])
	return children
}

export default ClientExpander