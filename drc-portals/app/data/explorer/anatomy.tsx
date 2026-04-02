import React, { memo, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Autocomplete, Avatar, Card, CardContent, Grid, Popper, Stack, TextField, Typography } from '@mui/material';
import useSWRImmutable from 'swr/immutable';
import levenSort from '@/components/Chat/utils/leven-sort';
import { red } from '@mui/material/colors';
import { mdiEye } from '@mdi/js';
import Icon from '@mdi/react';
 import trpc from '@/lib/trpc/client'
 
const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

const CustomPopper = function (props: any) {
   return <Popper {...props} sx={{width: 100}} placement="bottom-start" />;
};

const Anatomy = ({ data, isConnectable }: {data: {update_input: Function}, isConnectable: boolean}) => {
  const [term, setTerm] = React.useState({type: "", a_label: ""})
  const [inputTerm, setInputTerm] = React.useState('')
  const { data: options } =  trpc.autocomplete.useQuery({
        search: inputTerm.toLocaleLowerCase(),
        facet: ["type:\"anatomy\""],
  }, { staleTime: Infinity, enabled: inputTerm !== '' && inputTerm.length >= 3 })
    
  return (
    <Card sx={{width: 400, backgroundColor: red[100]}}>
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
            <Avatar sx={{backgroundColor: red[100], color: 'black'}}><Icon path={mdiEye} size={2}/></Avatar>
            <Typography variant='h3'>Cell Types, Tissues, and Organs</Typography>
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
              // loading={isLoading}
              // filterOption={null}
              noOptionsText={inputTerm.length ? 'No matching  types/tissue/organ': 'Enter  types/tissue/organ'}
              getOptionLabel={option=>option.a_label}
              onChange={(e: any, newValue: any) => {
                      
                      if (newValue) {
                        if (typeof newValue === 'string') {
                          data.update_input('anatomy', newValue, 'add')
                          setInputTerm('')
                        } else {
                          data.update_input(newValue.type, newValue.a_label, 'add')
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
              renderInput={(params) => <TextField placeholder='Enter cell types/tissue/organ name' {...params} label="Enter Cell Types/Tissue/Organ Name" />}
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
export default Anatomy