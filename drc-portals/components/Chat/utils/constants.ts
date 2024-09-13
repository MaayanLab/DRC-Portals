
import descriptionsJson from "./descriptions.json"

const descriptions: Record<string, any> = descriptionsJson

export function getFunctionText(name: string) {return descriptions[name].desc}
export function getFunctionInput(name: string) {return descriptions[name].input}
