import { build, buildRetry } from "@/lib/text2cypher/llm/prompts/builder";
import { composeSchema } from "@/lib/text2cypher/llm/prompts/schema-composition";
import { chat } from "@/lib/text2cypher/llm/ollama";
// import { create } from "@/lib/text2cypher/llm/deepseek";
import type { Neo4jVarType } from "@/lib/text2cypher/neo4j/types";
import {
  extract,
  detectEntityMismatch,
  detectNotInSchema,
  isValid,
} from "@/lib/text2cypher/neo4j/utils";
import { runCypherQuery } from "@/lib/text2cypher/neo4j/queries";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";

const MAX_ATTEMPTS = 3;

type StructuredCypherResponse = {
  cypher: string;
  params?: Record<string, unknown>;
};

const toNeo4jParams = (
  params?: Record<string, unknown>,
): Record<string, Neo4jVarType> => {
  const normalized: Record<string, Neo4jVarType> = {};
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return normalized;
  }

  for (const [key, value] of Object.entries(params)) {
    normalized[key] = value as Neo4jVarType;
  }

  return normalized;
};

const parseStructuredCypherResponse = (
  raw: string,
): StructuredCypherResponse => {
  const text = raw.trim();
  if (!text) {
    throw new Error("LLM returned an empty response.");
  }

  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
  const candidate = fenced ? fenced[1] : text;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new Error(`Failed to parse JSON response from LLM: ${text}`);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    typeof (parsed as { cypher?: unknown }).cypher !== "string"
  ) {
    throw new Error(`LLM response is missing a valid "cypher" string: ${text}`);
  }

  const payload = parsed as {
    cypher: string;
    params?: Record<string, unknown>;
  };

  return {
    cypher: payload.cypher,
    params: payload.params,
  };
};

export interface PipelineResult {
  question: string;
  cypher: string;
  results: string;
  attempts: number;
  success: boolean;
  error: string;
  cached: boolean;
  history_id: number | null;
}

// TODO: Add system/domain prompts as a parameter(s)?
export const runPipeline = async (
  question: string,
): Promise<PipelineResult> => {
  const activeSchema = getActiveSchemaDefinition();
  const result: PipelineResult = {
    question,
    cypher: "",
    results: "",
    attempts: 0,
    success: false,
    error: "",
    cached: false,
    history_id: null,
  };

  console.info(`Running pipeline for question: ${question}`);
  const schema = composeSchema(
    activeSchema.nodeProperties,
    activeSchema.pathways,
  );
  console.info(`Schema retrieved: ${JSON.stringify(schema, null, 2)}`);
  const labels = activeSchema.nodes;
  const types = activeSchema.relationships;
  console.info(
    `Labels retrieved: ${JSON.stringify(labels, null, 2)}, Relationships retrieved: ${JSON.stringify(
      types,
      null,
      2,
    )}`,
  );

  let badCypher = "";
  let errorMsg = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    result.attempts = attempt;
    console.info(
      `Attempt ${attempt}/${MAX_ATTEMPTS} for question: ${question}`,
    );

    let messages;
    if (attempt === 1) {
      messages = build(schema, question, activeSchema.domainRules);
    } else {
      messages = buildRetry(
        schema,
        question,
        badCypher,
        errorMsg,
        activeSchema.domainRules,
      );
    }

    let raw_response;
    let raw;
    let cypher = "";
    let queryParams: Record<string, Neo4jVarType> = {};

    try {
      console.info(
        `LLM messages for attempt ${attempt}: ${JSON.stringify(messages, null, 2)}`,
      );
      // Ollama API call
      raw_response = await chat(messages);
      raw = raw_response.message.content;

      // OpenAI API call
      // raw_response = await create(messages);
      // raw = raw_response.output_text;

      // DeepSeek API call
      // raw_response = await create(messages);
      // raw = raw_response.output_text;
    } catch (e: unknown) {
      if (e instanceof Error) {
        errorMsg = e.message;
      } else {
        errorMsg = String(e);
      }
      console.warn(`LLM error on attempt ${attempt}: ${errorMsg}`);
      result.error = errorMsg;
      continue;
    }

    const notInSchemaMsg = detectNotInSchema(raw);
    if (notInSchemaMsg) {
      console.info(`LLM returned NOT_IN_SCHEMA response: ${notInSchemaMsg}`);
      result.error = notInSchemaMsg;
      result.attempts = attempt;
      break; // Definitive refusal — no point retrying
    }

    try {
      const structured = parseStructuredCypherResponse(raw);
      cypher = structured.cypher;
      queryParams = toNeo4jParams(structured.params);
      console.info(`Attempt ${attempt} extracted Cypher: ${cypher}`);
      console.info(
        `Attempt ${attempt} extracted params: ${JSON.stringify(queryParams)}`,
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        errorMsg = e.message;
      } else {
        errorMsg = String(e);
      }
      console.warn(
        `Attempt ${attempt} invalid structured response: ${errorMsg}`,
      );
      badCypher = raw;
      result.error = errorMsg;
      continue;
    }

    const fallbackCypher = extract(raw);
    if (!cypher && fallbackCypher) {
      cypher = fallbackCypher;
    }

    if (!isValid(cypher)) {
      errorMsg = `Extracted text is not valid Cypher: ${cypher}`;
      console.warn(`Attempt ${attempt} invalid Cypher: ${errorMsg}`);
      badCypher = cypher;
      result.error = errorMsg;
      continue;
    }

    const entityErrors = detectEntityMismatch(cypher, labels, types);
    if (entityErrors.length > 0) {
      errorMsg = entityErrors.join("; ");
      console.warn(`Attempt ${attempt} entity mismatch: ${errorMsg}`);
      badCypher = cypher;
      result.error = errorMsg;
      continue;
    }

    const cypherResult = JSON.stringify(
      await runCypherQuery(cypher, queryParams),
    );

    if (
      cypherResult.startsWith("CypherSyntaxError") ||
      cypherResult.startsWith("CypherTypeError") ||
      cypherResult.startsWith("Neo4jError") ||
      cypherResult.startsWith("Error:")
    ) {
      errorMsg = cypherResult;
      badCypher = cypher;
      console.warn(`Attempt ${attempt} query error: ${errorMsg}`);
      result.error = errorMsg;
      continue;
    }

    result.cypher = cypher;
    result.results = cypherResult;
    result.success = true;
    result.error = "";
    console.info(`Attempt ${attempt} succeeded`);
    break;
  }

  console.info(
    `Pipeline completed for question: ${question} with success: ${result.success}`,
  );
  console.info(`Final result: ${JSON.stringify(result, null, 2)}`);
  return result;
};
