import { getLLM, getModel } from "@/lib/llm";
import { allTools, toolExecutors } from "@/skills/registry";
import {
  MatchResultSchema,
  type MatchResult,
} from "@/lib/schemas";
import { z } from "zod";
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";

const SYSTEM_PROMPT = `你是一个专业的简历-岗位匹配撮合专家。
用户会提供简历内容和目标招聘页面 URL。
你拥有以下工具：
- parse_resume: 解析简历文本，提取结构化信息
- scrape_website: 抓取招聘网页，提取岗位列表

工作流程：
1. 收到简历文本后，调用 parse_resume 获取结构化简历数据
2. 收到招聘 URL 后，调用 scrape_website 获取岗位列表
3. 当所有信息收集完毕，执行最终匹配分析

最终匹配结果必须严格返回以下 JSON 格式，不要包含任何其他文字：
{
  "results": [
    {
      "job_title": "岗位名称",
      "match_percentage": 85,
      "match_reasons": ["匹配原因1", "匹配原因2"],
      "missing_skills": ["缺失技能1"]
    }
  ]
}
评分标准：
- match_percentage: 0-100 的整数，基于技能匹配度、经验相关度、教育背景综合评估
- match_reasons: 列出候选人与岗位匹配的具体原因
- missing_skills: 列出候选人缺少但岗位要求的技能
请对所有岗位都进行评估，不要跳过任何一个。`;

interface AgentInput {
  resumeText: string;
  jobUrl: string;
  topPercent: number;
  maxResults: number;
}

export async function runAgent(input: AgentInput): Promise<MatchResult[]> {
  const { resumeText, jobUrl, topPercent, maxResults } = input;
  const llm = getLLM();
  const model = getModel();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `请帮我分析以下简历与招聘岗位的匹配度：\n\n【简历内容】\n${resumeText}\n\n【招聘页面 URL】\n${jobUrl}\n\n推荐配置：仅展示匹配度排名前 ${topPercent}% 的岗位，最多 ${maxResults} 条。`,
    },
  ];

  // ReAct 循环：最多 10 轮防止死循环
  for (let i = 0; i < 10; i++) {
    const completion = await llm.chat.completions.create({
      model,
      messages,
      tools: allTools,
      temperature: 0.2,
    });

    const choice = completion.choices[0];
    if (!choice) throw new Error("LLM 未返回有效内容");

    const message = choice.message;

    // 如果 LLM 要求调用工具
    if (message.tool_calls && message.tool_calls.length > 0) {
      // 先把 assistant 的 tool_calls 消息加入历史
      messages.push({
        role: "assistant",
        content: message.content,
        tool_calls: message.tool_calls,
      });

      // 逐个执行工具调用
      for (const toolCall of message.tool_calls) {
        if (toolCall.type !== "function") continue;
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments);
        const executor = toolExecutors[fnName];

        let result: string;
        try {
          if (!executor) throw new Error(`未知工具: ${fnName}`);
          const output = await executor(fnArgs);
          result = JSON.stringify(output);
        } catch (err) {
          result = JSON.stringify({
            error: err instanceof Error ? err.message : "工具执行失败",
          });
        }

        const toolMessage: ChatCompletionToolMessageParam = {
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        };
        messages.push(toolMessage);
      }

      // 继续循环，让 LLM 处理工具结果
      continue;
    }

    // LLM 返回了最终文本结果（没有 tool_calls）
    const content = message.content;
    if (!content) throw new Error("LLM 未返回匹配结果");

    const jsonStr = content
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(jsonStr);
    const ResponseSchema = z.object({ results: z.array(MatchResultSchema) });
    const { results } = ResponseSchema.parse(parsed);

    // 后处理
    const sorted = results.sort(
      (a, b) => b.match_percentage - a.match_percentage
    );
    const cutoff = Math.max(
      1,
      Math.ceil(sorted.length * (topPercent / 100))
    );
    return sorted.slice(0, Math.min(cutoff, maxResults));
  }

  throw new Error("Agent 循环超过最大轮次，未产生最终结果");
}
