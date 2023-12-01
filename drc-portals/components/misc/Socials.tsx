'use server'
import React from "react"
import Link from "next/link"
import Image from "next/image"
import IconButton from "@mui/material/IconButton"
import Twitter from "@/public/img/icons/Twitter.svg"
import Email from "@/public/img/icons/email.svg"
import Facebook from "@/public/img/icons/Facebook.svg"
import Linkedin from "@/public/img/icons/Linkedin.svg"
import Youtube from "@/public/img/icons/Youtube.svg"

const SocialMedia = ({color}: {color?: "inherit" | "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}) => {
    console.log(Twitter)
    return (
        <div className='flex items-center space-x-2'>
            <Link href="mailto:contact@cfde.info">
                <IconButton color={"secondary"}>
                    <Email/>
                </IconButton>
            </Link>
            <Link href="/">
                <IconButton  color={"secondary"}>
                    <Twitter/>
                </IconButton>
            </Link>
            <Link href="/">
                <IconButton  color={"secondary"}>
                    <Youtube/>
                </IconButton>
            </Link>
            <Link href="/">
                <IconButton  color={"secondary"}>
                    <Facebook sx={{color: "#000"}}/>
                </IconButton>
            </Link>
            <Link href="/">
                <IconButton  color={"secondary"}>
                    <Linkedin/>
                </IconButton>
            </Link>
        </div>
    )
}
export default SocialMedia