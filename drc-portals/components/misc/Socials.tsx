'use server'
import React from "react"
import Link from "@/utils/link"
import IconButton from "@mui/material/IconButton"
import Twitter from "@/public/img/icons/Twitter.svg"
import Email from "@/public/img/icons/email.svg"
import Facebook from "@/public/img/icons/Facebook.svg"
import Linkedin from "@/public/img/icons/Linkedin.svg"
import Youtube from "@/public/img/icons/Youtube.svg"
import { MailTo } from "@/utils/mailto"

const SocialMedia = ({color}: {color?: "inherit" | "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}) => {
    return (
        <div className='flex items-center space-x-2'>
            <MailTo email="help@cfde.cloud">
                <IconButton color={"secondary"}>
                    <Email/>
                </IconButton>
            </MailTo>
            <Link href="https://twitter.com/CfdeWorkbench" target="_blank" rel="noopener noreferrer">
                <IconButton  color={"secondary"}>
                    <Twitter/>
                </IconButton>
            </Link>
            <Link href="https://www.youtube.com/@CFDEWorkbench" target="_blank" rel="noopener noreferrer">
                <IconButton  color={"secondary"}>
                    <Youtube/>
                </IconButton>
            </Link>
            {/* <Link href="/">
                <IconButton  color={"secondary"}>
                    <Facebook sx={{color: "#000"}}/>
                </IconButton>
            </Link> */}
            {/* <Link href="/">
                <IconButton  color={"secondary"}>
                    <Linkedin/>
                </IconButton>
            </Link> */}
        </div>
    )
}
export default SocialMedia