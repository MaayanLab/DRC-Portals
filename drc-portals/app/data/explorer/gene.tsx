import React, { memo, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Autocomplete, Avatar, Card, CardContent, Grid, Popper, TextField, Typography } from '@mui/material';
import useSWRImmutable from 'swr/immutable';
import levenSort from '@/components/Chat/utils/leven-sort';
import { green } from '@mui/material/colors';
import Icon from '@mdi/react';
import { mdiDna } from '@mdi/js';
import { Stack } from '@mui/system';
import trpc from '@/lib/trpc/client'

const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

const CustomPopper = function (props: any) {
   return <Popper {...props} sx={{width: 50}} placement="bottom-start" />;
};

const Gene = ({ data, isConnectable }: {data: {update_input: Function}, isConnectable: boolean}) => {
  const [geneTerm, setGeneTerm] = React.useState<{type?: string, a_label?: string}>({a_label: ""})
  const [inputTerm, setInputTerm] = React.useState('')
  const { data: options } =  trpc.autocomplete.useQuery({
      search: inputTerm.toLocaleLowerCase(),
      facet: ["type:\"gene\"", "type:\"protein\""],
  }, { staleTime: Infinity, enabled: inputTerm !== '' && inputTerm.length >= 3 })
  
  return (
    <Card sx={{width: 400, backgroundColor: green[100]}}>
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
        <Grid item xs={12} >
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Avatar sx={{backgroundColor: green[100], color: 'black'}}><Icon path={mdiDna} size={2}/></Avatar>
            <Typography variant='h3'>Genes, Proteins, and Variants</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
              sx={{width: 350, borderColor: "black"}}
              // PopperComponent={CustomPopper}
              className='w-auto'
              options={options || []}
              value={geneTerm || ''}
              color='secondary'
              // onInputChange={handleInputChange}
              // loading={isLoading}
              // filterOption={null}
              noOptionsText={inputTerm.length ? 'No matching genes or proteins': 'Enter Gene or Protein Name'}
              // placeholder={'Enter gene symbol...'}
              getOptionLabel={option=>option.a_label}
              onChange={(e: any, newValue: any) => {
                      
                      if (newValue) {
                        if (typeof newValue === 'string') {
                          const links = [
                            {
                              "resource": "gdlpa",
                              "link": `https://cfde-gene-pages.cloud/gene/${newValue}?CF=false&PS=true`,
                              description: newValue
                            },
                            {
                              "resource": "gsfm",
                              "link": `https://gsfm.maayanlab.cloud/gene/${newValue}`,
                              description: newValue
                            },
                          ]
                          data.update_input('gene', newValue, 'add', {}, links)
                          setInputTerm('')
                        } else {
                          const links = [
                            {
                              "resource": "gdlpa",
                              "link": `https://cfde-gene-pages.cloud/gene/${newValue.a_label}?CF=false&PS=true`,
                              description: newValue.a_label
                            },
                            {
                              "resource": "gsfm",
                              "link": `https://gsfm.maayanlab.cloud/gene/${newValue.a_label}`,
                              description: newValue.a_label
                            },
                          ]
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
              renderInput={(params) => <TextField placeholder='Enter gene or protein name' {...params} label="Enter Gene or Protein Name" />}
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