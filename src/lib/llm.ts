import OpenAI from "openai";

let _llm: OpenAI | null = null;

export function getLLM(): OpenAI {
  if (!_llm) {
    _llm = new OpenAI({
      baseURL: process.env.LLM_BASE_URL,
      apiKey: process.env.LLM_API_KEY,
    });
  }
  return _llm;
}

export function getModel(): string {
  return process.env.LLM_MODEL_NAME || "deepseek-chat";
}
