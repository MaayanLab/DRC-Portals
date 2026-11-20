import { Ollama, Message } from "ollama/browser";

const HOST = process.env.OLLAMA_HOST || "http://localhost:11434"; // Default to localhost if not set
const MODEL = process.env.OLLAMA_MODEL || "gemma3"; // Default to gemma3 if not set

const ollama = new Ollama({ host: HOST });

export const chat = async (messages: Message[]) => {
  return await ollama.chat({
    model: MODEL,
    messages,
  });
};
