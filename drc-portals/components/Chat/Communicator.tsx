'use client'
import { useEffect, useState } from 'react'
import Icon from '@mdi/react';
import { mdiEarHearing, mdiEarHearingOff } from '@mdi/js';
import { set } from 'zod';
const MicRecorder = require('mic-recorder-to-mp3')

const recorder = new MicRecorder({
    bitRate: 128
});

const Communicator = ({text2speech, setMessage}: {text2speech: string | null, setMessage: Function}) => {
    const [active, setActive] = useState(false)
    const [enabled, setEnabled] = useState(false)
    const transform = active ? {}: {transform: "rotateY(180deg)"}

    useEffect(()=>{
        const speak = async (message: string | null) => {
            const response = await fetch("/chat/speak", {
                method: 'POST',
                body: JSON.stringify({
                    input: message,
                    model: "tts-1",
                    voice: "alloy",
                }),
            })
            const ctx = new AudioContext();
            const arrayBuffer = await response.arrayBuffer()
            const audio = await ctx.decodeAudioData(arrayBuffer)
            const playSound = ctx.createBufferSource();
            playSound.buffer = audio;
            playSound.connect(ctx.destination);
            playSound.start(ctx.currentTime);
        }
        if (text2speech && enabled) {
            speak(text2speech)
        }
    }, [text2speech])

    // inactivate recording after 10 seconds
    useEffect(()=>{
        const inactivate = setInterval(() => {
            setActive(false);
        }, 10000);
        const start_recording = async () => {
            try {
                console.log("recording")
                recorder.start()   
            } catch (error) {
                console.error(error)
            }
        }
        const stop_recording = async () => {
            try {
                console.log("saving")
                const [buffer, blob] = await recorder.stop().getMp3()
                const formData = new FormData();
                formData.append("file", blob);
                formData.append("model", "whisper-1");
                const response = await fetch("/chat/transcribe", { method: 'POST', body: formData });
                const transcribed = await response.json()
                setMessage(transcribed.text)    
            } catch (error) {
                console.error(error)
            }
            
        } 
        if (active) {
            start_recording()
            setEnabled(true)
        }
        else stop_recording()
        return () => clearInterval(inactivate);
    },[active, setActive, setMessage])


    return (
        <button onClick={()=>setActive(!active)} className="btn btn-square">
            <Icon path={active ? mdiEarHearing: mdiEarHearingOff} style={transform} size={1} />
        </button>
    )
}

export default Communicator