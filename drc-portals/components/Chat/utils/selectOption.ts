import stringSimilarity from "string-similarity-js"

export default function selectOption(query: any, options: string[]) {
    var max = -1
    var option;

    options.forEach((opt) => {
        const sim = stringSimilarity(query, opt, 2)
        if (sim > max) {
            max = sim
            option = opt
        }
    })
    if (max < .2) return "None"
    return option
}