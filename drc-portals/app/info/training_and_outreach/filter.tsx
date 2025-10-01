'use client'
import { TextField, Autocomplete, Chip, Grid } from "@mui/material"
import { Stack } from "@mui/system";
import { OutreachParams } from "./page";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
const options = ["recurring", "cfde-specific", "fellowship", "workshop", "internship", "course", "training program", "webinar", "office hours", "face to face meeting", "competition", "conference", "use-a-thon", "hackathon", "symposium"]

export default function FilterBox({parsedParams}: {parsedParams: OutreachParams}) {
	const tags = parsedParams.tags || []
	const router = useRouter()
	const pathname = usePathname()
	const [value, setValue] = useState(null)
	const [inputValue, setInputValue] = useState("")

	return (
		<Grid container spacing={1} alignItems={"center"} justifyContent={"flex-end"}>
			<Grid item xs={12}>
				<Stack direction={"row"} spacing={1} justifyContent={"flex-end"} alignItems={"center"}>
					<Autocomplete
						disablePortal
						options={options}
						sx={{ width: 300 }}
						value={value}
						inputValue={inputValue}
						onInputChange={(e, v)=>setInputValue(v)}
						onChange={(e,v)=>{
							if (v && tags.indexOf(v) === -1) {
								const {page, ...rest} = parsedParams
								const query = {
									...rest,
									tags: [...tags, v]
								}
								setValue(null)
								router.push(pathname + '?filter=' + JSON.stringify(query), {scroll: false})
							}
						}}
						renderInput={(params) => <TextField {...params} label="Filter by tag" />}
					/>
					
				</Stack>
			</Grid>
			{tags.map(tag=>(<Grid item key={tag}><Chip label={tag} variant="outlined" onDelete={()=>{
				const new_tags = tags.filter(t=>t!==tag)
				const {page, ...rest} = parsedParams
				const query = {
					...rest,
					tags: new_tags
				}
				router.push(pathname + '?filter=' + JSON.stringify(query), {scroll: false})
			}} /></Grid>))}
			{parsedParams.date && 
			<Grid item><Chip label={`Date: ${parsedParams.date}`} variant="outlined" onDelete={()=>{
				const {date, ...query} = parsedParams
				router.push(pathname + '?filter=' + JSON.stringify(query), {scroll: false})
			}} /></Grid>
			}
		</Grid>
	);
  }