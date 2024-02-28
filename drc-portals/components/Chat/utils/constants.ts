import processesJson from "./processes.json"
import descriptionsJson from "./descriptions.json"

const processes: Record<string, any> = processesJson
const descriptions: Record<string, any> = descriptionsJson

export function optionsDesc() {
    var optionsStr = "<br>";
    const optionsDict = new Map<string, { input: string, output: string }>()
    let i = 0;
    Object.keys(processes).map((input: string) => {
        Object.keys(processes[input]).map((output: string) => {
            optionsStr += `${(i + 1).toString()}. ${processes[input][output].gpt_desc}<br>`
            optionsDict.set((i + 1).toString(), { input, output })
            i++
            return
        })
        return
    })
    return optionsStr
}

export function getFunctionText(name: string) {return descriptions[name].desc}
export function getFunctionInput(name: string) {return descriptions[name].input}
