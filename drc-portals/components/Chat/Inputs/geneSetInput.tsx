'use client'
import React from 'react'
import example from '@/components/Chat/utils/example.json'
import uniqueArray from '@/components/Chat/utils/uniqueArray'

// Import gene set components and map them to names
import SigComLincs from '../GeneSet/sigComLincs'
import classNames from 'classnames'
import Button from '@mui/material/Button';

let processMapper: Record<string, any> = {
  'sigComLincs': SigComLincs
}

let upDownMapper: Record<string, any> = {
  'sigComLincs': true
}


export default function InputForm(props: any) {
  const processName = props.process
  const hasUpDown = upDownMapper[props.process]
  const Component = processMapper[processName || '']
  const [submitted, setSubmitted] = React.useState(false)
  const [upDown, setUpDown] = React.useState(hasUpDown)
  const [rawGenes, setRawGenes] = React.useState('')
  const [rawGenes2, setRawGenes2] = React.useState('')
  const genes = React.useMemo(() => uniqueArray(rawGenes.split(/[;,\t\r\n\s]+/).filter(v => v)), [rawGenes])
  const genes2 = React.useMemo(() => uniqueArray(rawGenes2.split(/[;,\t\r\n\s]+/).filter(v => v)), [rawGenes2])
  var fileReader = React.useRef<FileReader | null>(null);
  var fileReader2 = React.useRef<FileReader | null>(null);

  const handleFileRead = React.useCallback(() => {
    const content = fileReader!.current!.result as string;
    setRawGenes(content!);
  }, [setRawGenes])

  const handleFileRead2 = React.useCallback(() => {
    const content = fileReader2!.current!.result as string;
    setRawGenes2(content!);
  }, [setRawGenes2])

  const handleFileChosen = React.useCallback((file: File | null) => {
    fileReader.current = new FileReader();
    fileReader.current.onloadend = handleFileRead;
    fileReader.current.readAsText(file!);
  }, [handleFileRead]);

  const handleFileChosen2 = React.useCallback((file: File | null) => {
    fileReader2.current = new FileReader();
    fileReader2.current.onloadend = handleFileRead2;
    fileReader2.current.readAsText(file!);
  }, [handleFileRead2]);

  React.useEffect(()=>{
    if (props.geneset) {
      setRawGenes(props.geneset.trim().split(/[;,\t\r\n\s]+/).filter((v:string) => v).join("\n"))
      setUpDown(false)
    } else {
      setRawGenes((props.up || "").trim().split(/[;,\t\r\n\s]+/).filter((v:string) => v).join("\n"))
      setRawGenes2((props.down || "").trim().split(/[;,\t\r\n\s]+/).filter((v:string) => v).join("\n"))
      setUpDown(true)
    }
  }, [props.args])

  return (
    <div className='flex flex-col'>
      <div className='flex flex-row'>
        {!submitted ? <>

          <div className='flex-col'>
            <p className="prose mb-2 text-slate-100">
              Try a gene set <a
                className="font-bold cursor-pointer  text-sky-400"
                onClick={() => {
                  setRawGenes(example.genes.join('\n'))
                }}
              >example</a>.
            </p>
            <form
              className="flex flex-col place-items-end"
              onSubmit={async (evt) => {
                evt.preventDefault()
                setSubmitted(true)
              }}
            >
              <textarea
                value={rawGenes}
                onChange={evt => {
                  setRawGenes(evt.currentTarget.value)
                }}
                rows={8}
                className="textarea textarea-bordered w-full text-slate-800 bg-slate-200 rounded-md p-2"
                placeholder="Paste a set of valid Entrez gene symbols (e.g. STAT3) on each row in the text-box"
              />
              <input
                className="block w-full mb-2 mt-2 text-xs cursor-pointer "
                id="fileUpload"
                type="file"
                onChange={(e) => { handleFileChosen(e.target.files?.[0] || null) }} />
              <div className='mx-auto'>
                {genes.length} {upDown ? <>up</> : <></>} gene(s) entered
              </div>
              {hasUpDown ? <></> : <><button className={classNames('btn', { 'disabled': genes.length < 5 })} type="submit">Submit</button></>}
            </form>
          </div>
          {upDown ?
            <>
              <div className='flex-col ml-5'>
                <p className="prose mb-2 text-slate-100">
                  Try a gene set <a
                    className="font-bold cursor-pointer  text-sky-400"
                    onClick={() => {
                      setRawGenes2(example.genesDown.join('\n'))
                    }}
                  >example</a>.
                </p>
                <form
                  className="flex flex-col place-items-end"
                  onSubmit={async (evt) => {
                    evt.preventDefault()
                    setSubmitted(true)
                  }}
                >
                  <textarea
                    value={rawGenes2}
                    onChange={evt => {
                      setRawGenes2(evt.currentTarget.value)
                    }}
                    rows={8}
                    className="textarea textarea-bordered w-full text-slate-800 bg-slate-200 rounded-md p-2"
                    placeholder="Paste a set of valid Entrez gene symbols (e.g. STAT3) on each row in the text-box"
                  />
                  <input
                    className="block w-full mb-2 mt-2 text-xs cursor-pointer text-center"
                    id="fileUpload"
                    type="file"
                    onChange={(e) => { handleFileChosen2(e.target.files?.[0] || null) }} />
                  <div className='mx-auto'>
                    {genes2.length} down gene(s) entered
                  </div>
                </form>
              </div>
            </> :
            <></>
          }
        </> :
          <>
            {React.createElement(Component, { genes: genes, genesDown: genes2, upDownGeneset: upDown })}
          </>}
      </div>
      {submitted ? <></> : <div className='flex flex-col mx-auto'>
        {hasUpDown ? <><Button className="m-2" variant="outlined" color="info"
          style={{
            borderRadius: 35,
            borderColor: "darkgray",
            color: "whitesmoke"
          }}
          onClick={(evt) => {
            evt.preventDefault()
            setUpDown(!upDown)
          }}>
          {upDown ? <div className='text-center'>Use single gene set</div> : <>Use up & down gene sets</>}</Button> {upDown ? <div className='mt-2 text-center'><Button style={{
              borderRadius: 35,
              borderColor: "darkgray",
              color: "whitesmoke",
              backgroundColor: "#374254",
            }}
            variant="contained"
            className={classNames('btn', { 'cursor-not-allowed opacity-50': (genes.length < 5 || genes2.length < 5) })} onClick={(evt) => {
            evt.preventDefault()
            if ((genes.length >= 5) && ((genes2.length >= 5))) {
              setSubmitted(true)
            }
          }}>Submit</Button></div> : <div className='mt-2 text-center'><Button className={classNames('text-slate-100 mt-2', { 'cursor-not-allowed opacity-50': (genes.length < 5) })} onClick={(evt) => {
            evt.preventDefault()
            if ((genes.length >= 5)) {
              setSubmitted(true)
            }
          }}
            style={{
              borderRadius: 35,
              borderColor: "darkgray",
              color: "whitesmoke",
              backgroundColor: "#374254",
            }}
            variant="contained"
          >Submit</Button></div>}</> : <></>}
      </div>
      }
    </div>
  )
}
