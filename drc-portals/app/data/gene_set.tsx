import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Autocomplete, Avatar, Button, Card, CardContent, Grid, Popper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import useSWRImmutable from 'swr/immutable';
import levenSort from '@/components/Chat/utils/leven-sort';
import { purple } from '@mui/material/colors';
import { mdiFormatColumns, mdiListBox, mdiMenu, mdiReceiptTextPlus, mdiSend, mdiTextSearchVariant } from '@mdi/js';
import Icon from '@mdi/react';
import EnrichrTermSearch from './enrichment/enrichr_term_search';
import trpc from '@/lib/trpc/client'

const fetcher = (endpoint: string) => fetch(endpoint).then((res) => res.json())

const CustomPopper = function (props: any) {
   return <Popper {...props} sx={{width: 100}} placement="bottom-start" />;
};

const GeneSet = ({ data, isConnectable }: {data: {update_input: Function, setGeneSetPos: Function}, isConnectable: boolean}) => {
  const [search, setSearch] = useState<'term'|'input' | 'double'>('term')
  const [userInput, setUserInput] = useState<{description: string, value:{gene_set?: string[], up?: string[], down?:string[]}}>({description: '', value: {}})
  
  const linksearch = trpc.submit_gene_set.useMutation()
  return (
    <Card sx={{width: 400, bgcolor: '#E7F3F5', borderColor: "#2D5986", borderWidth: 2}}>
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
            <Avatar sx={{backgroundColor:'transparent', color: "#2D5986"}}><Icon path={mdiListBox} size={2}/></Avatar>
            <Typography variant='h3'>Gene Sets, Pathways, and Modules</Typography>
            <Tooltip title={search === 'term' ? "Add your own gene set": "Search Enrichr gene sets"}>
              <Button variant='outlined' color="secondary" onClick={()=>{
                if (search==='term') {
                  setSearch('input')
                  data.setGeneSetPos(120)
                } else {
                  setSearch('term')
                  data.setGeneSetPos(0)
                }}
              }><Icon path={search === 'term' ? mdiReceiptTextPlus: mdiTextSearchVariant} size={1}/></Button>
            </Tooltip>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          {search === 'term' ?
          <EnrichrTermSearch setInput={async (d:any)=>{
            const {description, genes} = d
            const res = await linksearch.mutateAsync({
                input: {
                  gene_set: genes,
                },
                description,
            })         
            data.update_input('gene_set', description, "add", res)
          }} hideText={true} background='transparent'/>
          // <Autocomplete
          //     sx={{width: 350, borderColor: "black"}}
          //     // PopperComponent={CustomPopper}
          //     className='w-auto'
          //     options={options || []}
          //     value={term}
          //     color='secondary'
          //     // onInputChange={handleInputChange}
          //     // loading={isLoading}
          //     // filterOption={null}
          //     noOptionsText={inputTerm.length ? 'No matching gene sets': 'Enter gene sets'}
          //     getOptionLabel={option=>option.a_label}
          //     onChange={(e: any, newValue: any) => {
          //             if (newValue) {
          //               setTerm(newValue)
          //               // data.update_input(newValue.type, newValue.a_label, 'add')
          //             }
          //             setInputTerm('')
          //         }
          //     }
          //     inputValue={inputTerm}
          //     onInputChange={(event, newInputValue) => {
          //         setInputTerm(newInputValue);
          //     }}
          //     renderInput={(params) => <TextField placeholder='Enter gene set name' {...params} label="Enter Gene Set Name" />}
          // />
          :
          <Grid container spacing={1}>
            {search==="input" ?
              <Grid item xs={12}>
                <TextField value={userInput.value.gene_set?.join("\n")} placeholder='Enter newline separated genes' sx={{width: "100%"}} multiline rows={4} onChange={e=>setUserInput({...userInput, value: {gene_set: e.target.value.split(/\n/)}})}/>
              </Grid>:
              <>
                <Grid item xs={12} md={6}>
                  <TextField multiline rows={4} placeholder='Enter new line separated up genes' value={userInput.value.up?.join("\n")} onChange={e=>setUserInput({...userInput, value: {...userInput.value, up: e.target.value.split(/\n/)}})}/>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField multiline rows={4} placeholder='Enter new line separated down genes' value={userInput.value.down?.join("\n")} onChange={e=>setUserInput({...userInput, value: {...userInput.value, down: e.target.value.split(/\n/)}})}/>
                </Grid>
              </>
            }
            
            <Grid item xs={12}>
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                <TextField label={"Enter description"} value={userInput.description} onChange={(e)=>setUserInput({...userInput, description: e.currentTarget.value})}/>
                <Tooltip title="Save Gene Set">
                  <Button 
                    color="secondary" 
                    variant="contained"
                    disabled={search==='input' ? userInput.value.gene_set === undefined : (userInput.value.up === undefined || userInput.value.down === undefined)}
                    onClick={async ()=>{
                      const {description, value} = userInput
                      const res: {[key:string]: string} = await linksearch.mutateAsync({
                          input: {
                            gene_set: value.gene_set,
                            up_gene_set: value.up,
                            down_gene_set: value.down,
                          },
                          description,
                      })  
                      const {description: desc, ...results} = res
                      data.update_input('gene_set', description || 'user_input', "add", results)
                      setUserInput({description: '', value: {}})
                    }}
                  ><Icon path={mdiSend} size={1}/></Button>
                </Tooltip>
                <Tooltip title={search==='input' ? "Switch to up and down gene sets": "Switch to single gene set"}>
                  <Button onClick={()=>search==='input'?setSearch('double'): setSearch('input')} color="secondary" variant="contained"><Icon path={search === 'input' ? mdiFormatColumns: mdiMenu} size={1}/></Button>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        }
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
export default GeneSet