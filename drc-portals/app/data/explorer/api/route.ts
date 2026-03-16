import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";


export async function POST(request: Request) {
	const {methods, payload} = await request.json();
	console.log(methods, payload)
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
		if (res.statusText !== 'OK') {
			return new Response(JSON.stringify({error: await res.text()}), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
		} else {
			return new Response(JSON.stringify(await res.json()), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}
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
		if (res.statusText !== 'OK') {
			return new Response(JSON.stringify({error: await res.text()}), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
		} else {
			return new Response(JSON.stringify(await res.json()), {
				status: res.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	 }
}