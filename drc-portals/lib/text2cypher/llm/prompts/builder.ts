import type { Message } from "../types";
import { SYSTEM_PROMPT } from "./system";

const DEFAULT_DOMAIN_RULES = "No domain specific rules provided.";

export const build = (
  schema: string,
  question: string,
  system_prompt: string = SYSTEM_PROMPT,
  domain_rules: string = DEFAULT_DOMAIN_RULES,
  domain_few_shot: string = "",
): Array<Message> => {
  return [
    {
      role: "system",
      content: system_prompt
        .replace("{{schema}}", schema)
        .replace("{{domain_rules}}", domain_rules)
        .replace("{{domain_few_shot}}", domain_few_shot),
    },
    { role: "user", content: question },
  ];
};

export const buildRetry = (
  schema: string,
  question: string,
  bad_cypher: string,
  error: string,
  system_prompt: string = SYSTEM_PROMPT,
  domain_rules: string = DEFAULT_DOMAIN_RULES,
  domain_few_shot: string = "",
): Array<Message> => {
  const user_content = `
Original question:
${question}

A previous attempt failed validation.

<previous_cypher>
${bad_cypher}
</previous_cypher>

<validation_error>
${error}
</validation_error>

Generate a corrected response for the original question.
Use the validation error to identify and correct the problem in the previous attempt.
Follow all system instructions and do not repeat the invalid query unless it is corrected.
`.trim();

  return [
    {
      role: "system",
      content: system_prompt
        .replace("{{schema}}", schema)
        .replace("{{domain_rules}}", domain_rules)
        .replace("{{domain_few_shot}}", domain_few_shot),
    },
    { role: "user", content: user_content },
  ];
};
