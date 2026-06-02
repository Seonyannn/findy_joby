import { NextResponse } from "next/server";
import { scrapePage } from "@/lib/job-scraper";
import { getLLM, getModel } from "@/lib/llm";
import { JobDescriptionSchema } from "@/lib/schemas";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "请提供有效的 URL" }, { status: 400 });
    }

    // 抓取页面
    const pageText = await scrapePage(url);

    if (!pageText.trim()) {
      return NextResponse.json(
        { error: "页面内容为空" },
        { status: 400 }
      );
    }

    // 调用 LLM 提取 JD 列表
    const completion = await getLLM().chat.completions.create({
      model: getModel(),
      messages: [
        {
          role: "system",
          content: `你是一个招聘信息提取专家。请从网页文本中提取所有招聘岗位信息。
必须严格返回以下 JSON 数组格式，不要包含任何其他文字：
[
  {
    "job_title": "岗位名称",
    "department": "部门",
    "location": "工作地点",
    "requirements": ["任职要求1", "任职要求2"],
    "description": "岗位描述摘要",
    "url": "岗位链接（如有）"
  }
]
如果某个字段信息缺失，使用空字符串或空数组。如果没有找到任何岗位信息，返回空数组 []。`,
        },
        {
          role: "user",
          content: `以下是招聘页面的文本内容，请提取所有岗位信息：\n\n${pageText}`,
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

    // 提取 JSON
    const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    // 校验
    const JobsArraySchema = z.array(JobDescriptionSchema);
    const jobs = JobsArraySchema.parse(parsed);

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("岗位抓取错误:", err);
    const message =
      err instanceof Error ? err.message : "岗位抓取失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
