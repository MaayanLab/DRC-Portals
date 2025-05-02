'use client'
import { Pagination, Box } from "@mui/material"
import { OutreachParams } from "./page"
import { useRouter } from "next/navigation"
import usePathname from "@/utils/pathname"

export const PaginationComponent = ({count, limit, parsedParams}: {count: number, limit: number, parsedParams: OutreachParams}) => {
const router = useRouter()
const pathname = usePathname()
console.log(parsedParams)
return	(
	<Pagination page={parsedParams.page || 1} count={Math.ceil((count as number)/(limit || 6))}
		onChange={(e, page)=>{
			const query = {
				...parsedParams,
				page
			}
			router.push(pathname + '?filter=' + JSON.stringify(query), {scroll: false})
		}}
	/>
)}