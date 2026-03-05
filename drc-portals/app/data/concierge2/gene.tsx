import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Autocomplete, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import useSWRImmutable from 'swr/immutable';
import levenSort from '@/components/Chat/utils/leven-sort';
 
const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

const Gene = ({ data, isConnectable }: {data: {[key: string]: any}, isConnectable: boolean}) => {
  const [geneTerm, setGeneTerm] = React.useState('')
  const [inputTerm, setInputTerm] = React.useState('')
  
  const { data: d, error, isLoading } = useSWRImmutable<string[]>(() => {
        if (inputTerm.length < 2) return null
        // if (processName === 'ReverseSearchL1000') return `/chat/l1000sigs/autocomplete?q=${encodeURIComponent(geneTerm)}`
        return `https://maayanlab.cloud/Harmonizome/api/1.0/suggest?t=gene&q=${encodeURIComponent(inputTerm)}`
    }, fetcher)
  const items = React.useMemo(() => d ? levenSort(d, inputTerm).slice(0, 10).map((elt: string) => { return { value: elt, label: elt } }) : [], [data, inputTerm])
  return (
    <Card sx={{width: 350}}>
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
          <Typography variant='h5'>Gene</Typography>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
              sx={{width: 300}}
              className='w-auto'
              options={items}
              value={geneTerm}
              color='secondary'
              // onInputChange={handleInputChange}
              loading={isLoading}
              // filterOption={null}
              noOptionsText={inputTerm.length ? 'No matching genes': 'Enter Gene Name'}
              // placeholder={'Enter gene symbol...'}
              onChange={(e: any, newValue: any) => {
                      if (newValue) setGeneTerm(newValue.value)
                      else setGeneTerm('')
                  }
              }
              inputValue={inputTerm}
              onInputChange={(event, newInputValue) => {
                  setInputTerm(newInputValue);
              }}
              renderInput={(params) => <TextField placeholder='Enter gene name' {...params} label="Gene" />}
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
export default Gene