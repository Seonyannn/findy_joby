import { getLLM, getModel } from "@/lib/llm";
import { MatchResultSchema, type MatchResult } from "@/lib/schemas";
import { z } from "zod";

export async function matchJobs(
  resume: string,
  jobs: string,
  topPercent: number,
  maxResults: number
): Promise<MatchResult[]> {
  const completion = await getLLM().chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `你是一个专业的求职匹配分析师。请根据候选人的简历信息，对每个岗位进行匹配度评估。
必须严格返回以下 JSON 格式，不要包含任何其他文字：
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
请对所有岗位都进行评估，不要跳过任何一个。`,
      },
      {
        role: "user",
        content: `候选人简历：\n${resume}\n\n招聘岗位列表：\n${jobs}`,
      },
    ],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LLM 未返回有效内容");
  }

  const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(jsonStr);

  const ResponseSchema = z.object({ results: z.array(MatchResultSchema) });
  const { results } = ResponseSchema.parse(parsed);

  // 后处理：排序 → 取 topPercent% → 截断 maxResults
  const sorted = results.sort((a, b) => b.match_percentage - a.match_percentage);
  const cutoff = Math.max(1, Math.ceil(sorted.length * (topPercent / 100)));
  const topResults = sorted.slice(0, Math.min(cutoff, maxResults));

  return topResults;
}
