import { getLLM, getModel } from "@/lib/llm";
import { ResumeDataSchema, type ResumeData } from "@/lib/schemas";

export async function execute(text: string): Promise<ResumeData> {
  const completion = await getLLM().chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `你是一个简历解析专家。请将简历文本解析为标准化 JSON 格式。
必须严格返回以下 JSON 结构，不要包含任何其他文字：
{
  "name": "姓名",
  "contact": { "email": "邮箱", "phone": "电话", "location": "所在地" },
  "education": [{ "school": "学校", "degree": "学位", "major": "专业", "year": "毕业年份" }],
  "experience": [{ "company": "公司", "title": "职位", "duration": "任职时间", "highlights": ["工作亮点"] }],
  "skills": ["技能1", "技能2"],
  "summary": "个人总结"
}
如果某个字段信息缺失，使用空字符串或空数组。`,
      },
      { role: "user", content: text },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("LLM 未返回有效内容");

  const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  return ResumeDataSchema.parse(JSON.parse(jsonStr));
}
