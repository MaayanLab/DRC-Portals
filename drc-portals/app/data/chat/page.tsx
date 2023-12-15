import Chat from '@/components/Chat/chat'
import { Typography } from '@mui/material'
import Link from 'next/link'

export default function ChatPage() {
    return (
    <>
    <Typography variant="h2" color="secondary" className='pt-3'>CFDE Chatbot</Typography>
    <Typography variant="subtitle1" color="secondary" className='p-3'>
        The CFDE chatbot utilizes the OpenAI API along with registred workflows implemented in the <Link href={"https://playbook-workflow-builder.cloud/"} target='_blank' className='underline'>Playbook Workflow Builder</Link> to answer queries related to DCC data types. Once a process and input is selected the result is visualized directly in the chat. 
    </Typography>
    <Chat/>
    </>)
}