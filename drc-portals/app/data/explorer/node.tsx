import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Autocomplete, Avatar, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import Icon from '@mdi/react';
import trpc from '@/lib/trpc/client'
 

const Node = ({ data, isConnectable }: {data: {
	update_input: Function,
	facet: string[],
	label: string,
	icon: string,
	get_links?: Function,
}, isConnectable: boolean}) => {
  const [term, setTerm] = React.useState({type: '', a_label: ''})
  const [inputTerm, setInputTerm] = React.useState('')
  const { data: options } =  trpc.autocomplete.useQuery({
		search: inputTerm.toLocaleLowerCase(),
		facet: data.facet.map(facet=>`type:\"${facet}\"`),
	}, { staleTime: Infinity, enabled: inputTerm !== '' && inputTerm.length >= 3 })
  return (
	<Card elevation={0} sx={{width: 400, bgcolor: '#E7F3F5', borderColor: "#2D5986", borderWidth: 2}}>
		<Handle
		type="target"
		position={Position.Top}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="target-t"
	  />
	  <Handle
		type="target"
		position={Position.Bottom}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="target-b"
	  />
	  <Handle
		type="target"
		position={Position.Left}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="target-l"
	  />
	  <Handle
		type="target"
		position={Position.Right}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="target-r"
	  />
	<CardContent>
		<Grid container alignItems={"center"} spacing={2}>
		<Grid item xs={12}>
		  <Stack direction={"row"} spacing={1} alignItems={"center"}>
			<Avatar sx={{backgroundColor:'transparent', color: "#2D5986"}}><Icon path={data.icon} size={2}/></Avatar>
			<Typography variant='h3'>{data.label}</Typography>
		  </Stack>
		</Grid>
		<Grid item xs={12}>
		  <Autocomplete
			  sx={{width: 350, borderColor: "black"}}
			  // PopperComponent={CustomPopper}
			  className='w-auto'
			  options={options || []}
			  value={term}
			  color='secondary'
			  // onInputChange={handleInputChange}
			  // filterOption={null}
			  noOptionsText={inputTerm.length ? `No matching ${data.label.toLowerCase()}`: `Enter ${data.label.toLowerCase()}`}
			  getOptionLabel={option=>option.a_label}
			  onChange={(e: any, newValue: any) => {
					  
					  if (newValue) {
						if (typeof newValue === 'string') {
						  const links: Array<{
                              "resource": string,
                              "link": string,
                              description: string
                            }> = data.get_links? data.get_links(newValue): []
						  
						  data.update_input(data.facet, newValue, 'add', {}, links)
						  setInputTerm('')
						} else {
							const links: Array<{
                              "resource": string,
                              "link": string,
                              description: string
                            }> = data.get_links? data.get_links(newValue.a_label): []
						  data.update_input(newValue.type, newValue.a_label, 'add', {}, links)
						  setInputTerm('')
						}
					  } 
				  }
			  }
			  freeSolo
			  inputValue={inputTerm}
			  onInputChange={(event, newInputValue) => {
				  setInputTerm(newInputValue);
			  }}
			  renderInput={(params) => <TextField placeholder={`Enter ${data.label.toLowerCase().replace(' and', ' or')} name`} {...params} label={`Enter ${data.label.toLowerCase().replace(' and', ' or')} name`} />}
		  />
		</Grid>
		</Grid>
	</CardContent>
	  <Handle
		type="source"
		position={Position.Top}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="source-t"
	  />
	  <Handle
		type="source"
		position={Position.Bottom}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="source-b"
	  />
	  <Handle
		type="source"
		position={Position.Left}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="source-l"
	  />
	  <Handle
		type="source"
		position={Position.Right}
		onConnect={(params) => console.log('handle onConnect', params)}
		isConnectable={isConnectable}
		id="source-r"
	  />
	</Card>
  );
};
export default Node