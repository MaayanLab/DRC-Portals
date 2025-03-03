'use client'
import { Pagination, PaginationItem } from "@mui/material"
import { useRouter } from "@/utils/navigation"
import { usePathname } from "next/navigation"

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const PaginationComponent = ({limit, skip, count}:
	{limit: number, skip: number, count:number}) => {
		const router = useRouter()
		const pathname = usePathname()
		return (
			<Pagination count={Math.ceil(count/limit)}
				color="primary"
				shape='rounded'
				onChange={(e, page)=>{
					router.push(`${pathname}?filter=${JSON.stringify({"skip": limit*(page - 1)})}`)
				}}
				renderItem={(item) => (
					<PaginationItem
					  slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
					  {...item}
					/>
				  )}
			/>
		)
	}
export default PaginationComponent