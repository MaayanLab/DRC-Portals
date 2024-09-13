import React from 'react'
import classNames from 'classnames'
import Image from 'next/image'


export default function Message({ role, children}: {role: string, children: React.ReactNode}) {
    return (
        <>
            <div className={classNames('chat ', { 'chat-end': role === 'user', 'chat-start': role !== 'user', 'hidden': role === 'system' })}>
                <div className="chat-image btn btn-ghost btn-circle avatar placeholder">
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
                        {role == 'user' ? <Image src={'/img/user_icon.png'} alt={"user"} width={40} height={40}/> : <Image src={'/img/CFDE_square.png'} alt={"CFDE Chatbot"} width={50} height={50}/>}
                    </div>
                </div>
                <div className={classNames('chat-bubble rounded-xl prose')}>
                    {children}
                </div>
            </div>
        </>
    )
}