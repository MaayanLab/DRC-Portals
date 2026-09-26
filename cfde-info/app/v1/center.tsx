'use client'
import Image from "next/image"
import { useSearchParams } from "next/navigation"

export const Center = (center: {image: string, name: string, width: number}) => {
	const searchParams = useSearchParams()
	const mode = searchParams.get('mode') || 'light'
	if (mode === 'light') {
		return <Image src={center.image}  alt={center.name} width={center.width} height={200}/>	
	} else {
		return <Image src={center.image} style={{filter: "brightness(0.1) invert()"}} alt={center.name} width={center.width} height={200}/>
	}
}