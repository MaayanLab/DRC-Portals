import React from "react"
import Link from "next/link"
import Twitter from "../../public/img/icons/Twitter.svg"
import Email from "../../public/img/icons/email.svg"
import Youtube from "../../public/img/icons/Youtube.svg"
import { IconButton } from "@mui/material"
import Image from "next/image"
function MailTo({ email, children }: React.PropsWithChildren<{ email: string }>) {
  const id = React.useId()
  const email_split = email.split('@')
  return <a
    id={id}
    href="#"
    onClick={evt => {
      const el = document.getElementById(id) as HTMLAnchorElement | null
      if (!el) return
      el.href = 'mailto:'
      el.href += email_split[0]
      el.href += '@'
      el.href += email_split[1]
    }}
  >{children}</a>
}


const SocialMedia = () => {
    return (
        <div className='flex items-center space-x-2'>
            <MailTo email="help@cfde.cloud">
                <IconButton color={"secondary"}>
                    <Image 
						src={'/img/icons/email.svg'} 
						alt="email" 
						width={24} 
						height={24} 
						/>
                </IconButton>
            </MailTo>
            <Link href="https://twitter.com/CfdeWorkbench" target="_blank" rel="noopener noreferrer">
                <IconButton  color={"secondary"}>
                    <Image 
						src={'/img/icons/Twitter.svg'} 
						alt="twitter" 
						width={24} 
						height={24} 
						/>
                </IconButton>
            </Link>
            <Link href="https://www.youtube.com/@CFDEWorkbench" target="_blank" rel="noopener noreferrer">
                <IconButton  color={"secondary"}>
                    <Image 
						src={'/img/icons/Youtube.svg'} 
						alt="Youtube" 
						width={24} 
						height={24} 
						/>
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