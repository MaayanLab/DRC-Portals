import OpenAI from "openai";

const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
const OPENAI_MODEL = process.env["OPENAI_MODEL"] || "gpt-4.1"; // Default to gpt-4.1 if not set

const client = new OpenAI({
  apiKey: OPENAI_API_KEY, // This is the default and can be omitted
});

export const create = async (
  input: string | OpenAI.Responses.ResponseInput | undefined,
) =>
  await client.responses.create({
    model: OPENAI_MODEL,
    input,
  });
