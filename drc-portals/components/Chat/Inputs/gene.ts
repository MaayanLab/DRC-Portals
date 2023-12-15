import officalGeneSymbols from '../utils/officalGeneSymbols.json'
import removePunctuation from "../utils/cleanQuery"
import queryUser from '../utils/queryUser'

import { getProcessComponent, getProcessParams, getProcessText } from '../utils/constants'

export default async function Gene({message, options, setOptions, currentArg, setCurrentArg, processInfo, setProcessInfo}: 
    {message: string, options: string[], setOptions: any, currentArg: string, setCurrentArg: any, processInfo: any, setProcessInfo: any}) {
    var currProcessInfo: any = {...processInfo}

    const input = processInfo.input
    const output = processInfo.output

    const processQs = getProcessParams(processInfo.input, processInfo.output)

    if (currentArg == '') {
        const splitMessage = removePunctuation(message).split(' ')
        splitMessage.forEach(m => {
            if (officalGeneSymbols.includes(m)) {
                currProcessInfo.args['genesymbol'] = m
                setProcessInfo(currProcessInfo)
            }
        })
        for (let i=0; i < processQs.length; i++) {
            const searchTerms = processQs[i].options
            const arg = processQs[i].arg
            if (arg == 'dir') {
                if (splitMessage.includes('up') && splitMessage.includes('down')) {
                    currProcessInfo.args[arg] = 'both'
                    setProcessInfo(currProcessInfo)
                }
                else if (splitMessage.includes('up')) {
                    currProcessInfo.args[arg] = 'up'
                    setProcessInfo(currProcessInfo)

                }else if (splitMessage.includes('down')) {
                    currProcessInfo.args[arg] = 'down'
                    setProcessInfo(currProcessInfo)
                }
            } else {
                for (let j=0; j < searchTerms.length; j++) {
                    if (splitMessage.includes(searchTerms[j])) {
                        currProcessInfo.args[arg] = searchTerms[j]
                        setProcessInfo(currProcessInfo)
                    }
                }
            }
        }
    }

    const processName = getProcessComponent(input, output)
    const processText = getProcessText(input, output)

    const response = await queryUser(message, currProcessInfo, setProcessInfo, currentArg, setCurrentArg, options, setOptions)

    if (response.output) {
        return {
            role: "bot",
            content: processText,
            output: "GeneInput",
            args: {process: processName, ...currProcessInfo.args}
        }
    }

    return response
}