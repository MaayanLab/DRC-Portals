"use client";
import { useEffect, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiEarHearing,
  mdiEarHearingOff,
  mdiMicrophone,
  mdiMicrophoneOff,
} from "@mdi/js";
import { applySpeechMapper } from "@/utils/speech";
const MicRecorder = require("mic-recorder-to-mp3");

const recorder = new MicRecorder({
  bitRate: 128,
});


const Communicator = ({
  text2speech,
  setMessage,
}: {
  text2speech: string | null;
  setMessage: Function;
}) => {
  const [record, setRecord] = useState(false);
  const [speakMessages, setSpeakMessages] = useState(false);
  const [disabledSpeakMessages, setDisabledSpeakMessages] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const transform = record ? {} : { transform: "rotateY(180deg)" };
  const [currAudio, setCurrAudio] = useState<AudioBufferSourceNode | null>(
    null
  );

  useEffect(() => {
    const speak = async (message: string | null) => {
      setAudioPlaying(true);
      const response = await fetch("/chat/speak", {
        method: "POST",
        body: JSON.stringify({
          input: message,
          model: "tts-1",
          voice: "alloy",
        }),
      });
      const ctx = new AudioContext();
      const arrayBuffer = await response.arrayBuffer();
      const audio = await ctx.decodeAudioData(arrayBuffer);
      const playSound = ctx.createBufferSource();
      playSound.buffer = audio;
      playSound.connect(ctx.destination);
      playSound.start(ctx.currentTime);
      setCurrAudio(playSound);
      setTimeout(() => {
        setAudioPlaying(false);
      }, audio.duration * 1000);
    };
    if (
      text2speech &&
      speakMessages &&
      !audioPlaying
    ) {
      speak(text2speech);
    }
  }, [
    text2speech,
    speakMessages,
    audioPlaying,
    setAudioPlaying,
  ]);

  // inactivate recording after 10 seconds
  useEffect(() => {
    const inactivate = setInterval(() => {
      setRecord(false);
    }, 10000);

    console.log(record, inactivate);
    const start_recording = async () => {
      try {
        console.log("recording");
        recorder.start();
      } catch (error) {
        console.error(error);
      }
    };
    const stop_recording = async () => {
      try {
        console.log("saving");
        const [buffer, blob] = await recorder.stop().getMp3();
        if (blob.size < 10) {
          setRecord(false);
          return;
        }
        setRecord(false);
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("model", "whisper-1");
        const response = await fetch("/chat/transcribe", {
          method: "POST",
          body: formData,
        });
        const transcribed = await response.json();
        setMessage(applySpeechMapper(transcribed.text));
        setRecord(false);
      } catch (error) {
        setRecord(false);
      }
    };
    if (record) {
      start_recording();
      if (!disabledSpeakMessages) setSpeakMessages(true);
    } else stop_recording();
    return () => clearInterval(inactivate);
  }, [record, setRecord, setSpeakMessages, disabledSpeakMessages, setMessage]);

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => {
          setRecord(!record);
          if (!disabledSpeakMessages) setSpeakMessages(true);
        }}
        className="btn btn-square"
      >
        <Icon
          className="w-6 h-6"
          path={record ? mdiMicrophone : mdiMicrophoneOff}
          style={transform}
        />
      </button>
      <button
        type="button"
        onClick={() => {
            if (speakMessages) currAudio?.disconnect();
          setSpeakMessages(!speakMessages);
          setDisabledSpeakMessages(!disabledSpeakMessages);
          
        }}
        className="btn btn-square"
      >
        <Icon
          className="w-6 h-6"
          path={speakMessages ? mdiEarHearing : mdiEarHearingOff}
          style={transform}
        />
      </button>
    </div>
  );
};

export default Communicator;
