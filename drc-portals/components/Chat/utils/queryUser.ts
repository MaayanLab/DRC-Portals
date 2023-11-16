import selectOption from "./selectOption"
import { getProcessParams, getProcessText, getProcessComponent } from "./constants"

export default async function queryUser(message: any, processInfo: any, setProcessInfo: any, currentArg: string, setCurrentArg: any, options: string[], setOptions: any) {

    var argsSet = new Set(Object.keys(processInfo.args))

    if ((!argsSet.has(currentArg)) && (currentArg != '')) {
        const opt = selectOption(message, options)
        if (opt === "None") {
            return {
                role: "bot",
                content: "The option you selected was not recognized, please try again.",
            }
        } else {
            processInfo.args[currentArg] = opt;
            setProcessInfo(processInfo);
        }
    }

    const processQs = getProcessParams(processInfo.input, processInfo.output)
    const processArgs = new Set(Object.keys(processInfo.args))
    for (let i =0; i < processQs.length; i++) {
        const arg = processQs[i].arg
        const opts = processQs[i].options
        const q = processQs[i].q
        if (!processArgs.has(arg)) {
            setOptions(opts)
            setCurrentArg(arg)
            return {
                role: "bot",
                content: q,
                options: opts,
                output: null
            }
        }

    }

    const desc = getProcessText(processInfo.input, processInfo.output)
    const componentName = getProcessComponent(processInfo.input, processInfo.output)

    return {
        role: "bot",
        content: desc,
        output: componentName,
        options: null,
        args: processInfo.args
    }
}