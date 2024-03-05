"use client";
import { useEffect, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiEarHearing,
  mdiEarHearingOff,
  mdiMicrophone,
  mdiMicrophoneOff,
} from "@mdi/js";
const MicRecorder = require("mic-recorder-to-mp3");

const recorder = new MicRecorder({
  bitRate: 128,
});

const speechMapper: Record<string, string> = {
  "LYNX": "LINCS",
  "Lynx": "LINCS",
  "Winks": "LINCS",
  "links DCC": "LINCS DCC",
  "MotorPak": "MoTrPAC",
  "Spark": "SPARC",
  "glycoscience": "Glycoscience",
  "bridge to AI": "Bridge2AI",
  "g-tex": "GTEx",
  "g-tax": "GTEx",
  "hub map": "HuBMAP",
  "HubMap": "HuBMAP",
  "sennet": "SenNet",
  "Sennet": "SenNet",
  "CNET": "SenNet",
  "AT&T": "A2CPS"
};

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
        var text = transcribed.text;
        Object.keys(speechMapper).forEach(
          (key) => {
            let regex = new RegExp(`(${key})(?=[,?. ]|$)`, 'gi');
            text = text.replace(regex, speechMapper[key]);
            }
        );

        setMessage(text);
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
          path={record ? mdiMicrophone : mdiMicrophoneOff}
          style={transform}
          size={1}
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
          path={speakMessages ? mdiEarHearing : mdiEarHearingOff}
          style={transform}
          size={1}
        />
      </button>
    </div>
  );
};

export default Communicator;
