import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const scrapeWebsiteTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "scrape_website",
    description:
      "抓取招聘网页内容，提取结构化的岗位列表（岗位名称、部门、地点、任职要求、岗位描述）。当用户提供招聘网站 URL 时调用此工具。",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "招聘网页的完整 URL",
        },
      },
      required: ["url"],
    },
  },
};
