import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const parseResumeTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "parse_resume",
    description:
      "解析简历文本，提取结构化信息（姓名、联系方式、教育背景、工作经历、技能列表、个人总结）。当用户提供简历原始文本时调用此工具。",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "简历的原始文本内容",
        },
      },
      required: ["text"],
    },
  },
};
