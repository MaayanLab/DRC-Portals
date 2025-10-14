import { z } from "zod";
import { get_playbook_description } from "./utils.js";

const GtexGeneExpression = [
  "GtexGeneExpression",
  {
    title: "GtexGeneExpression",
    description: "Runs a client side function that returns z-scored gene expression across tissues from GTEx. Takes a single gene as an input",
    inputSchema: {
        "geneSymbol": z.string().optional().describe("Gene symbol")
    },
    outputSchema: {
        "function": z.string().describe("Function to run"),
        "inputType": z.string().describe("The type of input"),
        "methods": z.record(z.string(), z.any()).describe("Methods describing the workflow"),
        "geneSymbol": z.string().optional().nullable().describe("Gene symbol")
        
    }
  },
  async ({geneSymbol}: {geneSymbol: string}) => {
    const body = {
        workflow: [
        { id: '1', type: 'Input[Gene]', data: { type: 'Term[Gene]', value: geneSymbol } },
        { id: '2', type: 'GTExTissueExpressionFromGene', inputs: { gene: { id: '1' } } },
        { id: '3', type: 'BarplotFrom[Scored[Tissue]]', inputs: { terms: { id: '2' } } },
        ],
        metadata: {
        title: 'GTEx Tissue Expression Barplot',
        },
    }
    const methods = await get_playbook_description(body)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
              function: "GtexGeneExpression",
              inputType: "GeneInput",
              methods,
              geneSymbol
          })
        }
      ],
      structuredContent: {
          function: "GtexGeneExpression",
          inputType: "GeneInput",
          methods,
          geneSymbol
      }
    }
  }
]


export default GtexGeneExpression;