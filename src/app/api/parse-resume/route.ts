import { NextResponse } from "next/server";
import { extractText } from "@/lib/resume-parser";
import { getLLM, getModel } from "@/lib/llm";
import { ResumeDataSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传简历文件" }, { status: 400 });
    }

    // 提取纯文本
    const text = await extractText(file);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "无法从文件中提取文本" },
        { status: 400 }
      );
    }

    // 调用 LLM 结构化
    const completion = await getLLM().chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content: `你是一个简历解析专家。请将用户提供的简历文本解析为标准化 JSON 格式。
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
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "LLM 未返回有效内容" },
        { status: 500 }
      );
    }

    // 提取 JSON（处理可能的 markdown 代码块包裹）
    const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    // Zod 校验
    const result = ResumeDataSchema.parse(parsed);

    return NextResponse.json(result);
  } catch (err) {
    console.error("简历解析错误:", err);
    const message =
      err instanceof Error ? err.message : "简历解析失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
