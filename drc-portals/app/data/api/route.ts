

export async function POST(request: Request) {
	const {methods, payload} = await request.json();
	if (typeof methods === 'undefined' || methods === '') {
		return new Response(JSON.stringify({error: "Invalid Method"}), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	if (methods === 'runRunnable') {
		const res = await fetch(`${process.env.DEEPDIVE_URL}/${methods}?batch=1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
				'Authorization': `Token ${process.env.DEEPDIVE_TOKEN}`
            },
            body: JSON.stringify(payload),
        })
		return new Response(JSON.stringify(await res.json()), {
			status: res.status,
			headers: { 'Content-Type': 'application/json' }
		});
	 } else {
		const params = Object.entries(payload).map(([key, val])=>`${key}=${val}`).join("&")
		console.log(`${process.env.DEEPDIVE_URL}${methods}?${params}`)
		const res = await fetch(`${process.env.DEEPDIVE_URL}${methods}?${params}`,{
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Token ${process.env.DEEPDIVE_TOKEN}`
				}
			}
		)
		return new Response(JSON.stringify(await res.json()), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
	 }
}