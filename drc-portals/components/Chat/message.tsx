import React from 'react'
import classNames from 'classnames'
import Image from '@/utils/image'
import Avatar from '@mui/material/Avatar';

export default function Message({ role, children}: {role: string, children: React.ReactNode}) {
    return (
        <>
            <div className={classNames('chat ', { 'chat-end': role === 'user', 'chat-start': role !== 'user', 'hidden': role === 'system' })}>
                <div className="chat-image btn btn-ghost btn-circle avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
                        {role == 'user' ? <Avatar sx={{background: '#fff'}} src={'/img/user_icon.png'} alt={"user"}/> : <Avatar sx={{background: '#fff'}} src={'/img/CFDE_square.png'} alt={"CFDE Chatbot"}/>}
                    </div>
                </div>
                <div className={classNames('chat-bubble rounded-xl prose')}>
                    {children}
                </div>
            </div>
        </>
    )
}