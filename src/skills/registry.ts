import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { parseResumeTool } from "./parse_resume/schema";
import { scrapeWebsiteTool } from "./scrape_website/schema";
import { execute as parseResume } from "./parse_resume/index";
import { execute as scrapeWebsite } from "./scrape_website/index";

// 所有工具 Schema（传给 LLM）
export const allTools: ChatCompletionTool[] = [
  parseResumeTool,
  scrapeWebsiteTool,
];

// 工具执行器映射（LLM 决定调用哪个 → 执行对应函数）
export const toolExecutors: Record<
  string,
  (args: Record<string, string>) => Promise<unknown>
> = {
  parse_resume: (args) => parseResume(args.text),
  scrape_website: (args) => scrapeWebsite(args.url),
};
