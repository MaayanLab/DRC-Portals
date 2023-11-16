import React from 'react'
import GeneSetInput from '@/components/Chat/Inputs/geneSetInput'
import { getProcessText, getProcessComponent} from "../utils/constants"

export default async function GeneSet({message, options, setOptions, currentArg, setCurrentArg, processInfo, setProcessInfo}: 
    {message: string, options: string[], setOptions: any, chat: any, setChat: any, inProcess: boolean, setInProcess: any, currentArg: string, setCurrentArg: any, processInfo: any, setProcessInfo: any}) {
    const input = processInfo.input
    const output = processInfo.output
    const processName = getProcessComponent(input, output)
    const processText = getProcessText(input, output)

    return {
        role: "bot",
        content: processText,
        output: "GeneSetInput",
        args: {process: processName}
    }
}