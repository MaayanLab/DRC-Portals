import OpenAI from "openai";

const DEEPSEEK_API_KEY = process.env["DEEPSEEK_API_KEY"];
const DEEPSEEK_MODEL = process.env["DEEPSEEK_MODEL"] || "deepseek-v4-pro";
const DEEPSEEK_HOST =
  process.env["DEEPSEEK_HOST"] || "https://api.deepseek.com";

const client = new OpenAI({
  baseURL: DEEPSEEK_HOST,
  apiKey: DEEPSEEK_API_KEY, // This is the default and can be omitted
});

export const create = async (
  input: string | OpenAI.Responses.ResponseInput | undefined,
) => {
  return await client.responses.create({
    model: DEEPSEEK_MODEL,
    input,
    stream: false,
  });
};
