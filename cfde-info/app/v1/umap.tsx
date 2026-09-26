'use client'

import { useSearchParams } from "next/navigation"

export const UMAP = () => {
	const searchParams = useSearchParams()
	const mode = searchParams.get('mode') || 'light'
	
	if (mode === 'light') {
		return <img src="/img/umap-light.png" alt="logo" style={{height: 380, width:450}}/>
	} else {
		return <img src="/img/neon-glow.jpg" alt="logo" style={{height: 380, width:450}}/>
                
	}
}