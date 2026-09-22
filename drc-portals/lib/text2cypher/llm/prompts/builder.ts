import { SYSTEM_TEMPLATE, RETRY_SYSTEM_TEMPLATE } from "./system";
import type { Message } from "../types";

const DEFAULT_DOMAIN_RULES = "No domain specific rules provided.";

export const build = (
  schema: string,
  question: string,
  domain_rules: string = DEFAULT_DOMAIN_RULES,
  system_prompt: string = SYSTEM_TEMPLATE,
): Array<Message> => {
  return [
    {
      role: "system",
      content: system_prompt
        .replace("{{schema}}", schema)
        .replace("{{domain_rules}}", domain_rules),
    },
    { role: "user", content: question },
  ];
};

export const buildRetry = (
  schema: string,
  question: string,
  bad_cypher: string,
  error: string,
  domain_rules: string = DEFAULT_DOMAIN_RULES,
  retry_system_prompt: string = RETRY_SYSTEM_TEMPLATE,
): Array<Message> => {
  const user_content = `${question}\n\nPrevious attempt (failed):\n${bad_cypher}\n\nError:\n${error}`;
  return [
    {
      role: "system",
      content: retry_system_prompt
        .replace("{{schema}}", schema)
        .replace("{{domain_rules}}", domain_rules),
    },
    { role: "user", content: user_content },
  ];
};
