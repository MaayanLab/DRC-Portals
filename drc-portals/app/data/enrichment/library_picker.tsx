'use client'
import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { 
	Autocomplete,
	Chip,
	Grid,
	Popper,
	Slider,
	Box,
	TextField,
	Alert,
	Snackbar,
	Tooltip,
	Typography,
	FormLabel,
	Stack,
	Button
 } from "@mui/material"
import { router_push } from "./utils"
import { mdiClose, mdiCloseCircle, mdiMinusCircleOutline, mdiPlusCircleOutline } from "@mdi/js"
import Icon from "@mdi/react"
import { EnrichmentParams } from "./types"
import { useQueryState, parseAsJson } from "next-usequerystate"

import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import schema from './schema.json'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const LibraryPicker = ({
	parsedParams,
	libraries_list,
	fullWidth,
}: {
	fullWidth: boolean,
    libraries_list: Array<string>,
    parsedParams: EnrichmentParams,
	fullscreen?: 'true'
}) => {
	const disableLibraryLimit = true
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const fullscreen = searchParams.get('fullscreen')
	
	const view = searchParams.get('view')
	const collapse = searchParams.get('collapse')
	const [error, setError] = useState<{message: string, type: string} | null>(null)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [query, setQuery] = useQueryState('query', parseAsJson<EnrichmentParams>().withDefault({}))
	const [selected, setSelected] = useState<string | null>(null)
	
	const handleClick = (event: React.MouseEvent<HTMLElement>, selected: string) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
		setSelected(anchorEl ? null: selected)
	};
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popper' : undefined;
	let default_options: null | {libraries?: {name: string, limit?: number}[], [key:string]: any} = null
	for (const tab of schema.header.tabs) {
		if (pathname.replace("/data", "") === tab.endpoint) { 
			default_options = tab.props?.default_options
		}

	}
	let libraries = query.libraries || parsedParams.libraries || default_options?.libraries || []

	return (
		<Grid container spacing={1}>
			<Grid item xs={12} md={fullWidth ? 12:5}>
				<Snackbar open={error!==null}
					anchorOrigin={{ vertical:"bottom", horizontal:"left" }}
					autoHideDuration={4500}
					onClose={()=>{
                        setError(null)
                    }}
				>
                    <Alert 
                        onClose={()=>{
                            setError(null)
                        }}
                        severity={(error || {} ).type === "fail" ? "error": "warning"}
                        sx={{ width: '100%' }} 
                        variant="filled"
                        elevation={6}
                    >
                        <Typography>{( error || {}).message || ""}</Typography>
                    </Alert>
                </Snackbar>
				<Autocomplete
					multiple
					limitTags={2}
					id="multiple-limit-tags"
					options={libraries_list}
					title="Select libraries to include"
					value={libraries.map(i=>i.name)}
					renderInput={(params) => (
						<TextField 
							error={libraries.length === 0}
							{...params} 
							sx={{backgroundColor: "#FFF"}}
							label="Select libraries" 
							placeholder="Select libraries" 
						/>
					)}
					renderOption={(props, option, { selected }) => (
						<li {...props}>
						  <Checkbox
							icon={icon}
							checkedIcon={checkedIcon}
							sx={{ marginRight: 8 }}
							checked={selected}
						  />
						  {option}
						</li>
					  )}
					sx={{ width: '100%' }}
					onChange={(e, libs)=>{
						if (libs.length <= 5 || disableLibraryLimit) {
							const new_libraries = libs.map(name=>({name, limit: 5}))
							if (fullWidth) {
								setQuery({
									...query,
									libraries: new_libraries
								})
							} else {
								const misc: {fullscreen?: string, view?: string, collapse?: string} = {}
								if (fullscreen) misc["fullscreen"] = fullscreen
								if (view) misc["view"] = view
								if (collapse) misc["collapse"] = collapse
								router_push(router, pathname, {
									...misc,
									q: JSON.stringify({
										...parsedParams,
										libraries: new_libraries
									}),
								})
							}
							
						} else if (libs.length > 5) {
							setError({message: "Please select up to 5 libraries", type: "fail"})
						}	
						
					}}
					renderTags={()=>null}
				/>
			</Grid>
			<Grid item xs={12} md={fullWidth ? 12: 7}>
                <Grid container spacing={1} alignItems="center">
					{libraries.map(({name, limit}) => (
                                <Grid item key={name} xs={fullWidth ? 12: undefined}>
                                    <Tooltip title={`Click chip to adjust limits`} key={name} placement="top">
                                        <Chip label={`${name}: ${limit}`}
											onClick={(event: React.MouseEvent<HTMLElement>)=>handleClick(event, name)}
                                            color="primary"
                                            sx={{padding: 0, borderRadius: "8px"}}
                                            onDelete={()=>{
												const new_libraries = libraries.filter(l=>l.name !== name)
												if (new_libraries.length === 0) setError({message: "Please select at least one library", type: "fail"})
												else {
													if (fullWidth) {
														setQuery({
															...query,
															libraries: new_libraries
														})
													} else {
														const misc: {fullscreen?: string, view?: string, collapse?: string} = {}
														if (fullscreen) misc["fullscreen"] = fullscreen
														if (view) misc["view"] = view
														if (collapse) misc["collapse"] = collapse
														router_push(router, pathname, {
															...misc,
															q: JSON.stringify({
																...parsedParams,
																libraries: new_libraries
															})
														})
													}    
												}
												setAnchorEl(null)                                             
                                        }}/>
                                    </Tooltip>
									<Popper id={id} open={open} anchorEl={anchorEl}>
										<Box sx={{ border: 1, p: 1, bgcolor: 'background.paper', width: 250 }}>
											<FormLabel>
												<Typography variant="subtitle2">Top terms to include: </Typography>
											</FormLabel>
											<Stack direction={"row"} spacing={1} alignItems={"center"}>
												<Icon path={mdiMinusCircleOutline} size={0.8} />
												<Slider 
													color="secondary"
													value={(libraries.filter(i=>i.name === selected)[0] || {}).limit || 5}
													onChange={(e, nv)=>{
														const new_libraries: Array<{name: string, limit?: number}> = []
														for (const i of libraries) {
															if (i.name === selected && i.name !== null) {
																new_libraries.push({
																	name: selected,
																	limit: typeof nv === "number" ? nv: nv[0]
																})
															}else new_libraries.push(i)
														}
														if (fullWidth) {
															setQuery({
																...query,
																libraries: new_libraries
															})
														} else {
															const misc: {fullscreen?: string, view?: string, collapse?: string} = {}
															if (fullscreen) misc["fullscreen"] = fullscreen
															if (view) misc["view"] = view
															if (collapse) misc["collapse"] = collapse
															router_push(router, pathname, {
																...misc,
																q: JSON.stringify({
																	...parsedParams,
																	libraries: new_libraries
																}),
															})
														}
													}}
													sx={{width: "100%"}}
													valueLabelDisplay='auto'
													min={1}
													max={50}
													aria-labelledby="limit-slider" />
												<Icon path={mdiPlusCircleOutline} size={0.8} />
												<Button color="secondary" onClick={(event: React.MouseEvent<HTMLElement>)=>handleClick(event, '')}><Icon path={mdiCloseCircle} size={0.8} /></Button>
											</Stack>	
										</Box>
									</Popper>
                                </Grid>
                            ))}
				</Grid>
			</Grid>
		</Grid>
	)
}

export default LibraryPicker