'use client'
import Link from "next/link"
import { Button } from "@mui/material"

const DownloadPDF = ({link}: {link: string}) => (
	<Link href={link.replace("/img/", "/pdf/").replace(".png", ".pdf")}>
		<Button>Download flyer as PDF</Button>
	</Link>
)

export default DownloadPDF