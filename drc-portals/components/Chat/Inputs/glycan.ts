import React from 'react'
import GlycanInput from '@/components/Chat/Inputs/glycanInput'
import removePunctuation from '../utils/cleanQuery'
import { getProcessText, getProcessComponent} from "../utils/constants"

export default async function Glycan({message, options, setOptions, currentArg, setCurrentArg, processInfo, setProcessInfo}: 
    {message: string, options: string[], setOptions: any, chat: any, setChat: any, inProcess: boolean, setInProcess: any, currentArg: string, setCurrentArg: any, processInfo: any, setProcessInfo: any}) {

    var currProcessInfo: any = {...processInfo}
    const input = processInfo.input
    const output = processInfo.output
    const processName = getProcessComponent(input, output)
    const processText = getProcessText(input, output)

    const splitMessage = removePunctuation(message).split(' ')
    const possibleGylcans = splitMessage.filter((word: string) => word.at(0) == 'G')

    if (possibleGylcans.length > 0) {
        currProcessInfo.args['glycan'] = possibleGylcans[0]
        setProcessInfo(currProcessInfo)
    }

    return {
        role: "bot",
        content: processText,
        output: "GlycanInput",
        args: {process: processName, ...currProcessInfo.args}
    }
}