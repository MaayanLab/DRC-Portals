import JSZip from "jszip";
import fileDownload from "js-file-download";
import { NetworkSchema } from "./types";

export function toNumber(value:{low: number, high: number} ) {
    if (typeof value !== 'object') return value
    const { low, high } = value
    let res = high

    for (let i = 0; i < 32; i++) {
        res *= 2
    }

    return low + res
}

const convert_float = (value: number) => {
  if (isNaN(value)) return ''
  else {
    const v = value.toPrecision(4)
    if (Math.abs(value) < 0.0001 && v.length > 5){
      return `${Number.parseFloat(v).toExponential(4)}`;
    } else {
      return v
    }
  }
}

export const precise = (value: number | string) => {
	// if (typeof value === 'number' && isNaN(value)) return `${value}`
  if (typeof value === 'number') {
    if (isNaN(value)) return ''
    if (Number.isInteger(value)) return `${value}`
    else {
      return convert_float(value)
    }
  } else if (value) {
    if (value.split(".").length === 1) return value
    const val = Number.parseFloat(value)
    return convert_float(val)
  } else return ''
}

export function makeTemplate(
    templateString: string,
    templateVariables: {[key:string]: string|number|boolean},
) {
  const keys = [...Object.keys(templateVariables).map((key) => key.replace(/ /g, '_').replace(/\./g, '_')), 'PREFIX']
  const values = [...Object.values(templateVariables), process.env.NEXT_PUBLIC_PREFIX]
  try {
    const templateFunction = new Function(...keys, `return \`${templateString}\`;`)
    return templateFunction(...values)
  } catch (error) {
    return 'undefined'
  }
}

export const isIFrame = () => {
	try {
		if ( window.location !== window.parent.location ) return true
    	else false	
	} catch (error) {
		return false
	}
}

export const process_tables = async (results: NetworkSchema) => {
	const node_columns = ["id", "label"]
	const nodes = []
	const relation_columns = ["source", "target", "relation"]
	const relations = []
	const ids = []
	for (const {data: props} of results.nodes) {
		const row = []
		if (ids.indexOf(props["id"]) === -1) {
			ids.push(props["id"])
		
			for (const i of node_columns) {
				row.push(props[i] || '')
			}
			for (const [k,v] of Object.entries(props)) {
				if (node_columns.indexOf(k) === -1) {
					node_columns.push(k)
					row.push(v || '')
				}
			}
			nodes.push(row)
		}
	}
	for (const {data} of results.edges) {
		const {source, target, relation, ...properties} = data
		const {id, label, ...rest} = properties
		const props = {
			source,
			target,
			relation,
			...rest
		}
		const row: Array<string | number | true> = [props["source"], props['target'], props['relation'] || '']
		
		for (const [k,v] of Object.entries(rest)) {
			if (relation_columns.indexOf(k) === -1) {
				relation_columns.push(k)
				row.push(v || '')
			}
		}
		relations.push(row)
	}
	let node_text = node_columns.join("\t") + "\n"
	for (const node of nodes) {
		if (node.length < node_columns.length) {
			const line = [...node, ...Array(node_columns.length-node.length).fill("")]
			node_text = node_text + line.join("\t") + "\n"
		} else {
			node_text = node_text + node.join("\t") + "\n"
		}
	}
	let relation_text= relation_columns.join("\t") + "\n"
	for (const relation of relations) {
		if (relation.length < relation_columns.length) {
			const line = [...relation, ...Array(relation_columns.length-relation.length).fill("")]
			relation_text = relation_text + line.join("\t") + "\n"
		} else {
			relation_text = relation_text + relation.join("\t") + "\n"
		}
	}
	const zip = new JSZip();
	zip.file("nodes.tsv", node_text);
	zip.file("edges.tsv", relation_text);


	zip.generateAsync({type:"blob"}).then(function(content) {
		// see FileSaver.js
		fileDownload(content, "subnetwork.zip");
	});
}

export function typed_fetch<T>(url: string, controller?:AbortController): Promise<T> {
    const params: {signal?: any, revalidate?:number} = {}
    if (controller) params["signal"] = controller.signal
    params["revalidate"] = 3600
    return fetch(url, params)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        return response.json() as Promise<T>
      })
  }

  export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));