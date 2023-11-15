import { NextRequest, NextResponse } from "next/server";
import { processesDescs, optionsDesc, inputsAvialble, outputsAvialble } from "@/components/Chat/utils/constants";

const optionsStr = optionsDesc()

async function pickProcess({ query, input }: { query: string, input: string }) {
    const pickOuput = `
    Based on the query from the user: "${query}"
    Pick one of the following processes based on their description's similarity to the user's query:
    ${processesDescs(input)}
    If the user's query does resemble any of the processes' descritions respond with [None].
    Your response must strictly follow the following format with no other text, description or reasoning:
    [<Output>]
    `
    try {
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { "role": "system", "content": "You are an assitant meant to process a user query and decide what type of input the user is specifiying" },
                    { "role": "user", "content": pickOuput }
                ],
                max_tokens: 20,
                temperature: 0
            })
        })
        const tagLineParsed = await tagLine.json()
        const outputsAvialbleList = outputsAvialble(input)
        var output: string = tagLineParsed.choices[0].message.content
        console.log(output)
        output = output.slice(output.indexOf('['), output.indexOf(']') + 1)

        if (outputsAvialbleList.includes(output))
            return { response: "", input: input, output: output, status: 0 }
        else
            return {
                response: "No matching process was found. Here are some of the tools available through the chat currently:" + optionsStr,
                status: 2,
                input: undefined,
                output: undefined
            }
    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }
    }
}


export async function POST(req: NextRequest
) {
    const { query } = await req.json();

    const pickInput = `
    Based on the query from the user: "${query}"
    Pick an input type from the list: [[Metabolite],[RNA-seq file],[Variant],[Transcript],[Gene],[Gene Set],[Differential Expression],[Study Metadata],[Other]]
    Additional context: 
    A Gene Set is a collection of mulitple genes.
    If the user includes a gene symbol in their query, then the input is likely [Gene].
    If the the user's query is not relevant to any type in the list, or in general the question is not relevant in a biomedical context, then please respond with [Other].
    Take a deep breath, and respond in this format including only one type and no other reasoning:
    [Type]
    `
    try {
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { "role": "system", "content": "You are an assitant meant to process a user query and decide what type of input the user is specifiying" },
                    { "role": "user", "content": pickInput }
                ],
                max_tokens: 20,
                temperature: 0
            }),
        })

        console.log(tagLine)

        const tagLineJson = await tagLine.json()

        const avaiableInputs = inputsAvialble()
        var input = tagLineJson.choices[0].message.content
        input = input.slice(input.indexOf('['), input.indexOf(']') + 1)
        console.log(input)

        if (avaiableInputs.includes(input)) {
            const processResult = await pickProcess({ query, input })
            return new NextResponse(JSON.stringify(processResult), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        else {
            return new NextResponse(JSON.stringify({
                response: "No matching process was found. Here are some of the tools available through the chat currently:" + optionsStr,
                status: 2,
                input: undefined,
                output: undefined
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
    catch {
        return new NextResponse(JSON.stringify({
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
}
