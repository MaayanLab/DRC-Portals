import processesJson from "./processes.json"

const processes: Record<string, any> = processesJson

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

export function processesDescs(input: string) {return Object.keys(processes[input]).map((output: string) => { return `${output} -> ${processes[input][output].gpt_desc}` }).join('\n')}

export function getProcessParams(input: string, output: string) {return processes[input][output].questions}
export function getProcessText(input: string, output: string) {return processes[input][output].text}
export function getProcessComponent(input: string, output: string) {return processes[input][output].process}

export function inputsAvialble() {return Object.keys(processes)}
export function outputsAvialble(input: string) {return Object.keys(processes[input])}
