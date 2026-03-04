interface ResponseData {
  id: string;
  output: Array<{[key: string]: any}>;
  output_text: string;
  error?: string
}

export interface ChatResponse {
	id: null | string,
	state: string,
	content: string,
	output: null | string,
	args: null | {[key:string]: any}
}
export const submit = async (message: {
	  content: string;
	  prevResponseId: null | string;
	  inputType?: string;
	}) => {
	  const payload: {[key:string]: string} = {
		query: message.content,
	  }
	  if (message.inputType) payload.query = `${payload.query} (Input Type: ${message.inputType})`
	  if (message.prevResponseId) payload['response_id'] = message.prevResponseId
	  const options = {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	  };
	  const res = await fetch(`/chat/response`, options);
	  const data: ResponseData = await res.json();
	  if (!data) {
		return {
			id: null,
			state: "error",
			content: "The CFDE Workbench AI Assistant is taking longer than usual to respond. We apologize for the inconvenience, please try again later.",
			output: null,
		  	args: null,
		}
	  } else if (data.error) {
		return {
		  id: data.id,
		  state: "error",
		  content: data.error,
		  output: null,
		  args: null,
		};
	  } else {
		const results = data["output"];
		if (!results) {
			return {
				id: data.id,
				state: "error",
				content: "The CFDE Workbench AI Assistant is having some issues. We apologize for the inconvenience, please try again later.",
				output: null,
				args: null,
			};
		} 
		let mcp_vals = results.filter(r=>r["type"]==="mcp_call") || []
		const output_text = data.output_text
		const output: ChatResponse = {
			id: data.id,
			state: "success",
			content: output_text,
			output: message.inputType || null,
			args: {}
		}
		for (const mcp_val of mcp_vals) {
		  const mcp_output = JSON.parse(mcp_val["output"] || '{}')
		  if (mcp_output.function) {
			const {function:toolName, inputType, output_text:outtxt, ...toolArgs} = mcp_output
			// const toolName = function
			output.args = {...output.args, [toolName]: { process: toolName, ...toolArgs }}
		  } else if (mcp_output.error) {
			output.state = "error"
			output.output = null
			output.args = null
			break
		  } else {
			output.content = output_text.replace(
				/\【.*?\】/g,
				""
			  )
			output.output = null
			output.args = null
			break;
		  }
		}
		return output
	  }
	}