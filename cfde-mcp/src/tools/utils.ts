const ENDPOINT = 'https://playbook-workflow-builder.cloud';

export const get_playbook_description = async (data: any) => {
	const res = await fetch(ENDPOINT + '/api/db/fpl', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	})

    const id = await res.json()
    const resOutput = await fetch(ENDPOINT + '/api/bco/' + id)
 
    const output = await resOutput.json() 
	return output
}