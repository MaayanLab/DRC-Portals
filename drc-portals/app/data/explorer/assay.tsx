import React, { memo, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Autocomplete, Avatar, Card, CardContent, Grid, Popper, Stack, TextField, Typography } from '@mui/material';
import useSWRImmutable from 'swr/immutable';
import levenSort from '@/components/Chat/utils/leven-sort';
import { blue } from '@mui/material/colors';
import { mdiFlask } from '@mdi/js';
import Icon from '@mdi/react';
 
const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

const CustomPopper = function (props: any) {
   return <Popper {...props} sx={{width: 100}} placement="bottom-start" />;
};

const Assay = ({ data, isConnectable }: {data: {update_input: Function}, isConnectable: boolean}) => {
  const [term, setTerm] = React.useState({type: '', a_label: ''})
  const [inputTerm, setInputTerm] = React.useState('')
  const { data: d, error, isLoading } = useSWRImmutable<any>(() => {
        if (inputTerm.length <= 2) return null
        // if (processName === 'ReverseSearchL1000') return `/chat/l1000sigs/autocomplete?q=${encodeURIComponent(Term)}`
        return `/api/trpc/autocomplete?batch=1&input={"0":{"search":"${encodeURIComponent(inputTerm)}","facet":["type:\\"assay_type\\""]}}`
    }, fetcher)
  const items = React.useMemo(() => d ? d[0].result.data : [], [d, inputTerm])
  return (
    <Card sx={{width: 400, backgroundColor: blue[100]}}>
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
            <Avatar sx={{backgroundColor: blue[100], color: 'black'}}><Icon path={mdiFlask} size={2}/></Avatar>
            <Typography variant='h3'>Assay</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
              sx={{width: 350, borderColor: "black"}}
              // PopperComponent={CustomPopper}
              className='w-auto'
              options={items}
              value={term}
              color='secondary'
              // onInputChange={handleInputChange}
              loading={isLoading}
              // filterOption={null}
              noOptionsText={inputTerm.length ? 'No matching assay': 'Enter assay'}
              getOptionLabel={option=>option.a_label}
              onChange={(e: any, newValue: any) => {
                      
                      if (newValue) {
                        data.update_input(newValue.type, newValue.a_label, 'add')
                        setInputTerm('')
                      }
                  }
              }
              inputValue={inputTerm}
              onInputChange={(event, newInputValue) => {
                  setInputTerm(newInputValue);
              }}
              renderInput={(params) => <TextField placeholder='Enter assay name' {...params} label="Enter Assay Name" />}
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
export default Assay