'use client'
import { Stack } from "@mui/material";
import Link from "next/link";

export default function () {
	return (
		<Stack spacing={1}>
			<Link href="/v1">version 1</Link>
			<Link href="/v2">version 2</Link>
			<Link href="/v3">version 3</Link>
			
		</Stack>
	)
}
