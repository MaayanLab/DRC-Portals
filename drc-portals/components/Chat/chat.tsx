'use client'
import React from 'react'
import Message from './message'
import Communicator from './Communicator'
import ChatExample from './chatExample'

// Input processing functions
import Gene from './Inputs/gene'
import GeneSet from './Inputs/geneset'
import Glycan from './Inputs/glycan'

// input forms
import GeneInput from './Inputs/geneInput'
import GeneSetInput from './Inputs/geneSetInput'
import GlycanInput from './Inputs/glycanInput'
import { Input } from '@mui/material'


interface ResponseData {
  response: string,
  input: string | undefined,
  output: string | undefined,
  status: number
}

let inputMapper: Record<string, any> = {
  '[Gene]': Gene,
  '[Gene Set]': GeneSet,
  '[Glycan]': Glycan,
}

let processMapper: Record<string, any> = {
  'GeneInput': GeneInput,
  'GeneSetInput': GeneSetInput,
  'GlycanInput': GlycanInput,
}

export default function Chat() {
  const [query, setQuery] = React.useState('')
  const [options, setOptions] = React.useState([])
  const [inProcess, setInProcess] = React.useState(false)
  const [currentArg, setCurrentArg] = React.useState('')
  const [processInfo, setProcessInfo] = React.useState<any>({ args: {} })
  const [chat, setChat] = React.useState({
    waitingForReply: false,
    messages: [] as { role: string, content: string, output: null | string, options: null | string[], args: null | any }[],
  })

  const lastBotChat = React.useMemo(() => chat.messages.filter((message) => message.role == 'bot').slice(-1)[0]?.content || null, [chat])

  const trigger = React.useCallback(async (arg0: { body: { message: string } }) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: arg0.body.message
      })
    }
    const res = await fetch(`/chat/findProcess`, options)
    const process: ResponseData = await res.json()

    if (process.status == 1 || process.status == 2) {
      return {
        role: 'assistant',
        content: process.response.replaceAll('<br>', '\r\n'),
      }
    } else if (process.status == 0) {
      setInProcess(true)
      setProcessInfo({ input: process.input, output: process.output, args: {} })
      const input: string = process.input || ''
      const inputFunction = inputMapper[input]

      return inputFunction({ message: arg0.body.message, options, setOptions, currentArg, setCurrentArg, processInfo: { input: process.input, output: process.output, args: {} }, setProcessInfo})
    } else {
      return {
        role: "bot",
        content: "There was an error communicating with OpenAI API"
      }
    }
  }, [currentArg])

  const submit = React.useCallback(async (message: { role: string, content: string, output: null | string, options: null | string[], args: null | any }) => {
    if (chat.waitingForReply) return
    setChat((cc: any) => ({ waitingForReply: true, messages: [...cc.messages, message] }))
    setQuery(() => '')

    var results: any;

    if (!inProcess) {
      results = await trigger({
        body: {
          message: message.content,
        }
      })
    } else {
      const input: string = processInfo.input || ''
      const inputFunction = inputMapper[input]
      results = await inputFunction({ message: message.content, options, setOptions, currentArg, setCurrentArg, processInfo, setProcessInfo })
    }

    if (results.output) {
      setCurrentArg('')
      setProcessInfo({ args: {} })
      setOptions([])
      setInProcess(false)
    }

    setChat((cc: any) => {
      if (!results) return { waitingForReply: false, messages: cc.messages }
      else return ({ waitingForReply: false, messages: [...cc.messages, results] })
    })

  }, [chat, inProcess, currentArg, options, processInfo, trigger])

  return (
    <div>
      <div className={'border border-neutral-700 rounded-xl pt-3 pb-2'}>
        <Message role="welcome" key={"welcome"}>
          <p>I&apos;m an AI-powered chat assistant interface designed to help you access and execute tools created by CFDE DCCs.
            Please start by asking your question of interest, and I&apos;ll try my best to help you answer it by selection and excecution of the most relevant tool.</p>
        </Message>
        {chat.messages.flatMap((message, i) => {
          const Component = processMapper[message.output || '']
          return (<>
            <Message role={message.role} key={i}>
              <p style={{ whiteSpace: "pre-line" }}>
                {message.content}
                {message.options ? <> Some options include: </> : <></>}
                {message.options ? message.options.map((opt) => <><a className=' text-blue-400' onClick={() => submit({
                  role: 'user',
                  content: opt,
                  output: null,
                  options: null,
                  args: null,
                })}>{opt}</a> </>) : <></>}
                {message.options ? <>? You can click an option to select it.</> : <></>}
              </p>
            </Message>

            {message.output ?
              <Message role='bot' key={i.toString() + "result"}>
                {React.createElement(Component, message.args)}
              </Message> : <></>}
          </>
          )
        }
        )}
        {chat.waitingForReply ?
        <div className="flex justify-center items-center">
          <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <p className='text-sm'>Thinking...</p>
          <span className="sr-only">Loading...</span>
        </div> : <></>}
      </div>
      <form
        className="flex flex-row items-center mt-3"
        onSubmit={async (evt) => {
          evt.preventDefault()
          if (query != '') {
            submit({
              role: 'user',
              content: query,
              output: null,
              options: null,
              args: null
            })
          }
        }}
      >
        <Input
          type="text"
          className="input w-full bg-transparent rounded-full"
          placeholder="Type your question here"
          value={query}
          onChange={evt => setQuery(() => evt.target.value)}
        />
        <Communicator text2speech={lastBotChat} setMessage={setQuery}></Communicator>
        <button type="submit" className="btn btn-sm ml-2" disabled={!query && !chat.waitingForReply}>Send</button>
      </form>
      <div className='flex flex-wrap justify-center mt-2 mb-5'>
        <ChatExample example={'In which GTEx tissues is AKT1 most highly expressed?'} submit={submit}/>
        <ChatExample example={'Which L1000 drugs most signfigantly up or down regulate STAT3?'} submit={submit}/>
        <ChatExample example={'Which L1000 signatures up or down regulate my gene set?'} submit={submit}/>
        <ChatExample example={'Which mouse phenotypes signfigantly associated with ACE2?'} submit={submit}/>
        <ChatExample example={'In which pediatric tumors is ACE2 expressed?'} submit={submit}/>
        <ChatExample example={'Which regulatory elements are associated with ACE2?'} submit={submit}/>
        <ChatExample example={'Can you provide information about the glycan G17689DH?'} submit={submit}/>
      </div>
    </div>
  )
}


